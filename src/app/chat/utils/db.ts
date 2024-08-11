import { IDBPDatabase, openDB } from 'idb';
import { HistoryRecord } from '../models/db';

const CHAT_DB_NAME = 'chat';
const HISTORY_STORE_NAME = 'history';

let db: IDBPDatabase<HistoryRecord>;

export async function initializeDB() {
  if (!db) {
    db = await openDB<HistoryRecord>(CHAT_DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(HISTORY_STORE_NAME)) {
          db.createObjectStore(HISTORY_STORE_NAME, {
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

  return await dbInstance.getAll(HISTORY_STORE_NAME);
}

export async function getHistoryTransaction() {
  const dbInstance = await initializeDB();

  return dbInstance.transaction(HISTORY_STORE_NAME, 'readwrite');
}
