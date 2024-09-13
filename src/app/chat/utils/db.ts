import { IDBPDatabase, openDB } from 'idb';
import { HistoryRecord, Prompt } from '../models/db';

const CHAT_DB_NAME = 'byok-chat';
const HISTORY_STORE_NAME = 'history';
const PROMPTS_STORE_NAME = 'prompts';

let db: IDBPDatabase<HistoryRecord | Prompt>;

export async function initializeDB() {
  if (!db) {
    db = await openDB<HistoryRecord | Prompt>(CHAT_DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(HISTORY_STORE_NAME)) {
          db.createObjectStore(HISTORY_STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
          });
        }

        if (!db.objectStoreNames.contains(PROMPTS_STORE_NAME)) {
          db.createObjectStore(PROMPTS_STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
          });
        }
      },
    });
  }
  return db;
}

export async function getHistoryDB() {
  const dbInstance = await initializeDB();
  const history: HistoryRecord[] = [];

  let cursor = await dbInstance
    .transaction(HISTORY_STORE_NAME)
    .store.openCursor(null, 'prev');

  while (cursor) {
    history.push(cursor.value);
    cursor = await cursor.continue();
  }

  return history;
}

export async function getHistoryTransaction() {
  const dbInstance = await initializeDB();

  return dbInstance.transaction(HISTORY_STORE_NAME, 'readwrite');
}

export async function getPromptsDB() {
  const dbInstance = await initializeDB();

  return await dbInstance.getAll(PROMPTS_STORE_NAME);
}

export async function getPromptTransaction() {
  const dbInstance = await initializeDB();

  return dbInstance.transaction(PROMPTS_STORE_NAME, 'readwrite');
}
