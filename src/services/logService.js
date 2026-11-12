import { db } from '../db/db';
import { getTodayString, isDateWithinRetroactiveLimit } from '../utils/date';

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'log-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now();
}

/**
 * Validasi batasan tanggal retroaktif (SRS-FR-002 & AGENTS.md 2.5).
 * Hanya mengizinkan hari ini dan maksimal 7 hari ke belakang.
 */
function assertWithinRetroactiveLimit(targetDate, today = getTodayString()) {
  const check = isDateWithinRetroactiveLimit(targetDate, today, 7);
  if (check.isFuture) {
    throw new Error('Tanggal masa depan belum dapat dicatat.');
  }
  if (check.isTooOld) {
    throw new Error('Riwayat lebih dari 7 hari lalu terkunci (maksimal 7 hari ke belakang).');
  }
}

export const logService = {
  /**
   * Mengambil semua log untuk tanggal tertentu.
   * @param {string} dateStr 'YYYY-MM-DD'
   * @param {Dexie} [targetDb=db]
   * @returns {Promise<Array<Object>>}
   */
  async getLogsForDate(dateStr, targetDb = db) {
    return targetDb.habit_logs.where('logDate').equals(dateStr).toArray();
  },

  /**
   * Mengambil semua log dalam rentang tanggal inklusif.
   * @param {string} startDateStr
   * @param {string} endDateStr
   * @param {Dexie} [targetDb=db]
   * @returns {Promise<Array<Object>>}
   */
  async getLogsBetweenDates(startDateStr, endDateStr, targetDb = db) {
    return targetDb.habit_logs
      .where('logDate')
      .between(startDateStr, endDateStr, true, true)
      .toArray();
  },

  /**
   * Mengambil seluruh log untuk kebiasaan tertentu.
   * @param {string} habitId
   * @param {Dexie} [targetDb=db]
   * @returns {Promise<Array<Object>>}
   */
  async getLogsForHabit(habitId, targetDb = db) {
    return targetDb.habit_logs.where('habitId').equals(habitId).toArray();
  },

  /**
   * Mengambil seluruh log di database.
   * @param {Dexie} [targetDb=db]
   * @returns {Promise<Array<Object>>}
   */
  async getAllLogs(targetDb = db) {
    return targetDb.habit_logs.toArray();
  },

  /**
   * Toggle centang kebiasaan tipe checkbox (SRS-FR-006).
   * - Jika sudah 'completed': HAPUS baris log dari database.
   * - Jika belum ada atau berstatus skipped: Buat/update baris log dengan status 'completed'.
   * @param {string} habitId
   * @param {string} [dateStr=getTodayString()]
   * @param {string} [todayStr=getTodayString()]
   * @param {Dexie} [targetDb=db]
   * @returns {Promise<{ action: 'deleted' | 'completed', log: Object | null }>}
   */
  async toggleCheckboxHabit(
    habitId,
    dateStr = getTodayString(),
    todayStr = getTodayString(),
    targetDb = db
  ) {
    assertWithinRetroactiveLimit(dateStr, todayStr);

    const habit = await targetDb.habits.get(habitId);
    if (!habit) {
      throw new Error('Kebiasaan tidak ditemukan.');
    }

    // Cari log yang ada untuk [habitId + logDate]
    const existing = await targetDb.habit_logs
      .where('[habitId+logDate]')
      .equals([habitId, dateStr])
      .first();

    if (existing && existing.status === 'completed') {
      // Pembatalan centang = Hapus baris log dari database (SRS-FR-006 & AGENTS.md 4.1)
      await targetDb.habit_logs.delete(existing.id);
      return { action: 'deleted', log: null };
    }

    const now = new Date().toISOString();
    if (existing) {
      // Ubah dari skipped menjadi completed
      await targetDb.habit_logs.update(existing.id, {
        status: 'completed',
        updatedAt: now,
      });
      return { action: 'completed', log: { ...existing, status: 'completed', updatedAt: now } };
    }

    // Tambah log baru
    const newLog = {
      id: generateId(),
      habitId,
      logDate: dateStr,
      status: 'completed',
      value: null,
      notes: '',
      createdAt: now,
      updatedAt: now,
    };

    await targetDb.habit_logs.add(newLog);
    return { action: 'completed', log: newLog };
  },

  /**
   * Mencatat nilai akumulasi kebiasaan tipe terukur / measurable (SRS-FR-007).
   * @param {string} habitId
   * @param {number} value
   * @param {string} [dateStr=getTodayString()]
   * @param {string} [todayStr=getTodayString()]
   * @param {Dexie} [targetDb=db]
   * @returns {Promise<{ action: 'deleted' | 'upserted', log: Object | null }>}
   */
  async logMeasurableHabit(
    habitId,
    value,
    dateStr = getTodayString(),
    todayStr = getTodayString(),
    targetDb = db
  ) {
    assertWithinRetroactiveLimit(dateStr, todayStr);

    const habit = await targetDb.habits.get(habitId);
    if (!habit) {
      throw new Error('Kebiasaan tidak ditemukan.');
    }

    const numValue = Number(value);
    const existing = await targetDb.habit_logs
      .where('[habitId+logDate]')
      .equals([habitId, dateStr])
      .first();

    // Jika nilai <= 0, hapus log (SRS-FR-007)
    if (isNaN(numValue) || numValue <= 0) {
      if (existing) {
        await targetDb.habit_logs.delete(existing.id);
      }
      return { action: 'deleted', log: null };
    }

    const isCompleted = habit.targetValue ? numValue >= habit.targetValue : true;
    const status = isCompleted ? 'completed' : 'pending';
    const now = new Date().toISOString();

    if (existing) {
      const patch = {
        value: numValue,
        status,
        updatedAt: now,
      };
      await targetDb.habit_logs.update(existing.id, patch);
      return { action: 'upserted', log: { ...existing, ...patch } };
    }

    const newLog = {
      id: generateId(),
      habitId,
      logDate: dateStr,
      status,
      value: numValue,
      notes: '',
      createdAt: now,
      updatedAt: now,
    };

    await targetDb.habit_logs.add(newLog);
    return { action: 'upserted', log: newLog };
  },

  /**
   * Menandai kebiasaan sebagai lewati / skipped (SRS-FR-008).
   * @param {string} habitId
   * @param {string} [dateStr=getTodayString()]
   * @param {string} [notes='']
   * @param {string} [todayStr=getTodayString()]
   * @param {Dexie} [targetDb=db]
   * @returns {Promise<Object>}
   */
  async skipHabit(
    habitId,
    dateStr = getTodayString(),
    notes = '',
    todayStr = getTodayString(),
    targetDb = db
  ) {
    assertWithinRetroactiveLimit(dateStr, todayStr);

    const habit = await targetDb.habits.get(habitId);
    if (!habit) {
      throw new Error('Kebiasaan tidak ditemukan.');
    }

    const existing = await targetDb.habit_logs
      .where('[habitId+logDate]')
      .equals([habitId, dateStr])
      .first();

    const now = new Date().toISOString();
    if (existing) {
      const patch = {
        status: 'skipped',
        notes: notes || existing.notes,
        updatedAt: now,
      };
      await targetDb.habit_logs.update(existing.id, patch);
      return { ...existing, ...patch };
    }

    const newLog = {
      id: generateId(),
      habitId,
      logDate: dateStr,
      status: 'skipped',
      value: null,
      notes,
      createdAt: now,
      updatedAt: now,
    };

    await targetDb.habit_logs.add(newLog);
    return newLog;
  },

  /**
   * Menghapus log tertentu.
   * @param {string} habitId
   * @param {string} dateStr
   * @param {Dexie} [targetDb=db]
   * @returns {Promise<boolean>}
   */
  async deleteLog(habitId, dateStr, targetDb = db) {
    const existing = await targetDb.habit_logs
      .where('[habitId+logDate]')
      .equals([habitId, dateStr])
      .first();

    if (existing) {
      await targetDb.habit_logs.delete(existing.id);
      return true;
    }
    return false;
  },
};
