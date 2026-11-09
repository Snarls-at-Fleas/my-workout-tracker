export type Entries = Record<string, string>
type Session = { date: string; entries: Entries }
let connection: Promise<IDBDatabase> | undefined

function openDatabase() {
  if (!connection) {
    connection = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('my-workout-push', 1)
      request.onupgradeneeded = () => request.result.createObjectStore('sessions', { keyPath: 'date' })
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    }).catch(error => { connection = undefined; throw error })
  }
  return connection
}

export async function readSession(date: string) {
  const db = await openDatabase()
  return new Promise<{ entries: Entries; previous?: Session }>((resolve, reject) => {
    const tx = db.transaction('sessions')
    const store = tx.objectStore('sessions')
    const current = store.get(date)
    const older = store.openCursor(IDBKeyRange.upperBound(date, true), 'prev')
    tx.oncomplete = () => resolve({ entries: current.result?.entries ?? {}, previous: older.result?.value })
    tx.onabort = () => reject(tx.error)
  })
}

export async function saveField(date: string, key: string, value: string) {
  const db = await openDatabase()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('sessions', 'readwrite')
    const store = tx.objectStore('sessions')
    const read = store.get(date)
    read.onsuccess = () => {
      const entries: Entries = read.result?.entries ?? {}
      if (value) entries[key] = value
      else delete entries[key]
      if (Object.keys(entries).length) store.put({ date, entries })
      else store.delete(date)
    }
    tx.oncomplete = () => resolve()
    tx.onabort = () => reject(tx.error)
  })
}

