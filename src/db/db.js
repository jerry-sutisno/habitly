import Dexie from 'dexie';

/**
 * Habitly IndexedDB Database via Dexie
 * Skema sesuai SRS.md Bagian 4.1 & AGENTS.md Bagian 3
 */
export const db = new Dexie('habitly-db');

db.version(1).stores({
  habits: 'id, categoryId, isArchived, createdAt',
  habit_logs: 'id, &[habitId+logDate], habitId, logDate',
  categories: 'id, name',
  settings: 'key',
});
