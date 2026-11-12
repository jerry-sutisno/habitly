// Calendar Status Utility - Pure functions
// Complies with AGENTS.md 4.4 & SRS-FR-012

import { isDateScheduled, getTodayString } from './date';

export const STATUS_FUTURE = 'future';
export const STATUS_NO_SCHEDULE = 'no_schedule';
export const STATUS_ALL_COMPLETED = 'all_completed';
export const STATUS_PARTIAL = 'partial';
export const STATUS_NONE_COMPLETED = 'none_completed';

/**
 * Menentukan status tanggal untuk sel kalender bulanan.
 *
 * @param {string} dateStr - Tanggal evaluasi 'YYYY-MM-DD'
 * @param {Array<Object>} habits - Daftar seluruh kebiasaan
 * @param {Array<Object>} logs - Seluruh log atau log untuk tanggal ini
 * @param {string} [todayStr=getTodayString()] - Tanggal hari ini 'YYYY-MM-DD'
 * @returns {{
 *   status: 'future' | 'no_schedule' | 'all_completed' | 'partial' | 'none_completed',
 *   completedCount: number,
 *   totalScheduled: number,
 *   skippedCount: number,
 *   effectiveTotal: number
 * }}
 */
export function getDateStatus(
  dateStr,
  habits = [],
  logs = [],
  todayStr = getTodayString()
) {
  // 1. Tanggal masa depan
  if (dateStr > todayStr) {
    return {
      status: STATUS_FUTURE,
      completedCount: 0,
      totalScheduled: 0,
      skippedCount: 0,
      effectiveTotal: 0,
    };
  }

  // 2. Ambil kebiasaan terjadwal pada tanggal ini
  const scheduledHabits = habits.filter((h) => isDateScheduled(h, dateStr));
  const totalScheduled = scheduledHabits.length;

  // 3. Jika tidak ada kebiasaan terjadwal
  if (totalScheduled === 0) {
    return {
      status: STATUS_NO_SCHEDULE,
      completedCount: 0,
      totalScheduled: 0,
      skippedCount: 0,
      effectiveTotal: 0,
    };
  }

  // 4. Cari log untuk tanggal ini
  const logsForDate = logs.filter((l) => l.logDate === dateStr);
  const logMap = new Map();
  for (const log of logsForDate) {
    if (log && log.habitId) {
      logMap.set(log.habitId, log.status);
    }
  }

  let completedCount = 0;
  let skippedCount = 0;

  for (const habit of scheduledHabits) {
    const status = logMap.get(habit.id);
    if (status === 'completed') {
      completedCount++;
    } else if (status === 'skipped') {
      skippedCount++;
    }
  }

  const effectiveTotal = totalScheduled - skippedCount;

  // Jika seluruh kebiasaan terjadwal di-skip
  if (effectiveTotal <= 0) {
    return {
      status: STATUS_NO_SCHEDULE,
      completedCount,
      totalScheduled,
      skippedCount,
      effectiveTotal,
    };
  }

  // Seluruh jadwal tercapai
  if (completedCount === effectiveTotal && completedCount > 0) {
    return {
      status: STATUS_ALL_COMPLETED,
      completedCount,
      totalScheduled,
      skippedCount,
      effectiveTotal,
    };
  }

  // Sebagian jadwal tercapai
  if (completedCount > 0) {
    return {
      status: STATUS_PARTIAL,
      completedCount,
      totalScheduled,
      skippedCount,
      effectiveTotal,
    };
  }

  // Nol jadwal tercapai
  return {
    status: STATUS_NONE_COMPLETED,
    completedCount,
    totalScheduled,
    skippedCount,
    effectiveTotal,
  };
}
