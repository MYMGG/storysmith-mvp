// lib/indexedDb.js
// Minimal IndexedDB wrapper for StorySmith MVP
// Ported from storysmith-v5 (TypeScript -> JavaScript)
// No external dependencies - native IndexedDB only

const DB_NAME = 'storysmith_mvp';
const DB_VERSION = 1;

let dbInstance = null;

/**
 * Initialize the database and create object stores.
 * @returns {Promise<IDBDatabase>}
 */
export function initDB() {
	return new Promise((resolve, reject) => {
		if (dbInstance) {
			resolve(dbInstance);
			return;
		}

		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => {
			dbInstance = request.result;
			resolve(dbInstance);
		};

		request.onupgradeneeded = (event) => {
			const db = event.target.result;

			// Create projects store
			if (!db.objectStoreNames.contains('projects')) {
				db.createObjectStore('projects', { keyPath: 'id' });
			}

			// Create storyStates store
			if (!db.objectStoreNames.contains('storyStates')) {
				db.createObjectStore('storyStates', { keyPath: 'projectId' });
			}
		};
	});
}

/**
 * Get all records from a store.
 * @param {string} storeName 
 * @returns {Promise<any[]>}
 */
export async function getAll(storeName) {
	const db = await initDB();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(storeName, 'readonly');
		const store = transaction.objectStore(storeName);
		const request = store.getAll();

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result);
	});
}

/**
 * Get a single record by key.
 * @param {string} storeName 
 * @param {string} key 
 * @returns {Promise<any|null>}
 */
export async function get(storeName, key) {
	const db = await initDB();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(storeName, 'readonly');
		const store = transaction.objectStore(storeName);
		const request = store.get(key);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result || null);
	});
}

/**
 * Put (upsert) a record.
 * @param {string} storeName 
 * @param {any} value 
 * @returns {Promise<void>}
 */
export async function put(storeName, value) {
	const db = await initDB();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(storeName, 'readwrite');
		const store = transaction.objectStore(storeName);
		const request = store.put(value);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve();
	});
}

/**
 * Delete a record by key.
 * @param {string} storeName 
 * @param {string} key 
 * @returns {Promise<void>}
 */
export async function deleteRecord(storeName, key) {
	const db = await initDB();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(storeName, 'readwrite');
		const store = transaction.objectStore(storeName);
		const request = store.delete(key);

		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve();
	});
}
