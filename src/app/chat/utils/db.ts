import { IDBPDatabase, IDBPTransaction, openDB } from 'idb';
import { HistoryRecord, Project, Prompt, SyncedRecord } from '../models/db';

const CHAT_DB_NAME = 'byok-chat';
const HISTORY_STORE_NAME = 'history';
const PROMPTS_STORE_NAME = 'prompts';
const PROJECTS_STORE_NAME = 'projects';

const STORE_NAMES = [
  HISTORY_STORE_NAME,
  PROMPTS_STORE_NAME,
  PROJECTS_STORE_NAME,
] as const;

type StoreName = (typeof STORE_NAMES)[number];

// A record as versions 1 and 2 kept it: numbered by the store, never stamped.
type LegacyRecord = {
  id: number | string;
  createdAt?: number;
  updatedAt?: number;
  projectId?: number | string;
};

type UpgradeTransaction = IDBPTransaction<
  HistoryRecord | Prompt | Project,
  string[],
  'versionchange'
>;

// Rewrites one store's counter ids as uuids, stamping each record on the way
// through, and returns where everything went so references can follow.
//
// The stamps are staggered a second apart in the old id order rather than all
// set to the same moment, because the lists now sort by these stamps and a
// shared timestamp would shuffle what the counter ids used to keep in order.
async function relabel(tx: UpgradeTransaction, storeName: StoreName) {
  const store = tx.objectStore(storeName);
  const records = (await store.getAll()) as LegacyRecord[];
  const numbered = records.filter(
    (record) => typeof record.id === 'number',
  ) as (LegacyRecord & { id: number })[];
  const ids = new Map<number, string>();

  if (numbered.length === 0) return ids;

  const newestId = Math.max(...numbered.map(({ id }) => id));
  const now = Date.now();

  for (const record of numbered) {
    const id = crypto.randomUUID();
    const bornAt = now - (newestId - record.id) * 1000;

    ids.set(record.id, id);

    await store.delete(record.id);
    await store.put({
      ...record,
      id,
      createdAt: record.createdAt ?? bornAt,
      updatedAt: record.updatedAt ?? bornAt,
    });
  }

  return ids;
}

// Version 3: counter ids become uuids and every record gets its timestamps,
// which is what lets a record ever be matched up with a copy of itself from
// an export or, one day, another browser.
async function migrateToUuids(tx: UpgradeTransaction) {
  // Projects first, so the chats filed under them can follow each one to its
  // new name.
  const projectIds = await relabel(tx, PROJECTS_STORE_NAME);
  await relabel(tx, PROMPTS_STORE_NAME);
  const chatIds = await relabel(tx, HISTORY_STORE_NAME);

  const historyStore = tx.objectStore(HISTORY_STORE_NAME);
  const chats = (await historyStore.getAll()) as LegacyRecord[];

  for (const chat of chats) {
    if (typeof chat.projectId !== 'number') continue;

    const projectId = projectIds.get(chat.projectId);
    const moved = { ...chat };

    if (projectId) {
      moved.projectId = projectId;
    } else {
      delete moved.projectId;
    }

    await historyStore.put(moved);
  }

  // The chat that was open last time is remembered under a number that has
  // just stopped meaning anything.
  const remembered = chatIds.get(Number(localStorage.getItem('currentChatId')));

  if (remembered) {
    localStorage.setItem('currentChatId', remembered);
  }
}

let db: IDBPDatabase<HistoryRecord | Prompt | Project>;

export async function initializeDB() {
  if (!db) {
    // Version 2 added projects. Each store is created behind its own check, so
    // the upgrade runs the same whether it is arriving at an empty database or
    // at one that has been carrying chats since version 1.
    db = await openDB<HistoryRecord | Prompt | Project>(CHAT_DB_NAME, 3, {
      async upgrade(db, oldVersion, _newVersion, tx) {
        for (const storeName of STORE_NAMES) {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        }

        if (oldVersion > 0 && oldVersion < 3) {
          await migrateToUuids(tx);
        }
      },
    });
  }
  return db;
}

export async function getHistoryDB() {
  const dbInstance = await initializeDB();
  const history: HistoryRecord[] = await dbInstance.getAll(HISTORY_STORE_NAME);

  // Most recently touched first, which is what the counter ids used to give
  // for free. Tombstones stay behind in the store for the day something needs
  // telling about them; nothing above this line of the code sees one.
  return history
    .filter((record) => !record.deletedAt)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getHistoryTransaction() {
  const dbInstance = await initializeDB();

  return dbInstance.transaction(HISTORY_STORE_NAME, 'readwrite');
}

export async function getPromptsDB() {
  const dbInstance = await initializeDB();
  const prompts: Prompt[] = await dbInstance.getAll(PROMPTS_STORE_NAME);

  // Oldest first: the order they were written in, which is the order the list
  // has always shown.
  return prompts
    .filter((record) => !record.deletedAt)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export async function getPromptTransaction() {
  const dbInstance = await initializeDB();

  return dbInstance.transaction(PROMPTS_STORE_NAME, 'readwrite');
}

export async function getProjectsDB() {
  const dbInstance = await initializeDB();
  const projects: Project[] = await dbInstance.getAll(PROJECTS_STORE_NAME);

  return projects
    .filter((record) => !record.deletedAt)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export async function getProjectTransaction() {
  const dbInstance = await initializeDB();

  return dbInstance.transaction(PROJECTS_STORE_NAME, 'readwrite');
}

// Folds incoming copies of records into a store: anything unknown is taken,
// and where both sides have a record the later write wins whole. This is the
// entire merge rule, for imports today and for sync whenever it comes.
async function mergeRecords<T extends SyncedRecord>(
  storeName: StoreName,
  records: T[],
) {
  const dbInstance = await initializeDB();
  const tx = dbInstance.transaction(storeName, 'readwrite');

  for (const record of records) {
    const existing = (await tx.store.get(record.id)) as T | undefined;

    if (!existing || record.updatedAt > existing.updatedAt) {
      await tx.store.put(record);
    }
  }

  await tx.done;
}

export function mergeHistoryRecords(records: HistoryRecord[]) {
  return mergeRecords(HISTORY_STORE_NAME, records);
}

export function mergePrompts(records: Prompt[]) {
  return mergeRecords(PROMPTS_STORE_NAME, records);
}

export function mergeProjects(records: Project[]) {
  return mergeRecords(PROJECTS_STORE_NAME, records);
}
