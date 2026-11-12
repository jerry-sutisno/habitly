// Analytics Calculation Utility - Pure functions
// Complies with AGENTS.md 4 & SRS-FR-013 / SRS-FR-014

import { addDays, isDateScheduled, getDayOfWeek, getDayNameIndonesian } from './date';

/**
 * Menghitung tingkat penyelesaian keseluruhan (Completion Rate) dalam rentang tanggal.
 *
 * @param {Array<Object>} habits - Daftar kebiasaan
 * @param {Array<Object>} logs - Log dalam rentang
 * @param {string} startDateStr - Tanggal awal 'YYYY-MM-DD'
 * @param {string} endDateStr - Tanggal akhir 'YYYY-MM-DD'
 * @returns {number} Persentase 0 - 100
 */
export function calculateCompletionRate(habits = [], logs = [], startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr || startDateStr > endDateStr || habits.length === 0) {
    return 0;
  }

  // Buat lookup map: 'habitId:dateStr' -> status
  const logMap = new Map();
  for (const log of logs) {
    if (log && log.habitId && log.logDate) {
      logMap.set(`${log.habitId}:${log.logDate}`, log.status);
    }
  }

  let totalCompleted = 0;
  let totalDenominator = 0;

  let currentDate = startDateStr;
  while (currentDate <= endDateStr) {
    for (const habit of habits) {
      if (isDateScheduled(habit, currentDate)) {
        const status = logMap.get(`${habit.id}:${currentDate}`);
        if (status === 'skipped') {
          // Skipped tidak dimasukkan ke penyebut
        } else {
          totalDenominator++;
          if (status === 'completed') {
            totalCompleted++;
          }
        }
      }
    }
    currentDate = addDays(currentDate, 1);
  }

  if (totalDenominator <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round((totalCompleted / totalDenominator) * 100)));
}

/**
 * Menemukan kebiasaan terbaik (Best Habit) berdasarkan rasio penyelesaian dalam rentang waktu.
 * Sesuai SRS-FR-014: ambang batas minimal 7 hari terjadwal, dengan fallback jika data masih sedikit.
 *
 * @param {Array<Object>} habits
 * @param {Array<Object>} logs
 * @param {string} startDateStr
 * @param {string} endDateStr
 * @param {number} [minScheduledThreshold=7]
 * @returns {{
 *   habit: Object | null,
 *   rate: number,
 *   completedCount: number,
 *   scheduledCount: number,
 *   effectiveDenominator: number
 * }}
 */
export function getBestHabit(
  habits = [],
  logs = [],
  startDateStr,
  endDateStr,
  minScheduledThreshold = 7
) {
  if (!startDateStr || !endDateStr || startDateStr > endDateStr || habits.length === 0) {
    return { habit: null, rate: 0, completedCount: 0, scheduledCount: 0, effectiveDenominator: 0 };
  }

  // Buat lookup map: 'habitId:dateStr' -> status
  const logMap = new Map();
  for (const log of logs) {
    if (log && log.habitId && log.logDate) {
      logMap.set(`${log.habitId}:${log.logDate}`, log.status);
    }
  }

  const habitStats = habits.map((habit) => {
    let scheduledCount = 0;
    let completedCount = 0;
    let skippedCount = 0;

    let currentDate = startDateStr;
    while (currentDate <= endDateStr) {
      if (isDateScheduled(habit, currentDate)) {
        scheduledCount++;
        const status = logMap.get(`${habit.id}:${currentDate}`);
        if (status === 'completed') completedCount++;
        else if (status === 'skipped') skippedCount++;
      }
      currentDate = addDays(currentDate, 1);
    }

    const effectiveDenominator = scheduledCount - skippedCount;
    const rate =
      effectiveDenominator > 0
        ? Math.round((completedCount / effectiveDenominator) * 100)
        : 0;

    return {
      habit,
      rate,
      completedCount,
      scheduledCount,
      effectiveDenominator,
    };
  });

  // Filter yang memenuhi ambang batas minimal
  let qualified = habitStats.filter((h) => h.scheduledCount >= minScheduledThreshold && h.effectiveDenominator > 0);

  // Fallback jika belum ada yang memenuhi threshold: ambil yang memiliki minimal 1 jadwal
  if (qualified.length === 0) {
    qualified = habitStats.filter((h) => h.effectiveDenominator > 0);
  }

  if (qualified.length === 0) {
    return { habit: null, rate: 0, completedCount: 0, scheduledCount: 0, effectiveDenominator: 0 };
  }

  // Urutkan berdasarkan rate tertinggi, lalu completedCount terbanyak
  qualified.sort((a, b) => {
    if (b.rate !== a.rate) return b.rate - a.rate;
    return b.completedCount - a.completedCount;
  });

  return qualified[0];
}

/**
 * Menemukan hari dalam seminggu dengan konsistensi tertinggi (Most Consistent Day).
 * Sesuai SRS-FR-014.
 *
 * @param {Array<Object>} habits
 * @param {Array<Object>} logs
 * @param {string} startDateStr
 * @param {string} endDateStr
 * @returns {{
 *   dayOfWeek: number,
 *   dayName: string,
 *   avgRate: number,
 *   totalCompleted: number,
 *   totalScheduled: number,
 *   effectiveDenominator: number
 * }}
 */
export function getMostConsistentDay(habits = [], logs = [], startDateStr, endDateStr) {
  const dayBuckets = {
    1: { completed: 0, scheduled: 0, skipped: 0 },
    2: { completed: 0, scheduled: 0, skipped: 0 },
    3: { completed: 0, scheduled: 0, skipped: 0 },
    4: { completed: 0, scheduled: 0, skipped: 0 },
    5: { completed: 0, scheduled: 0, skipped: 0 },
    6: { completed: 0, scheduled: 0, skipped: 0 },
    7: { completed: 0, scheduled: 0, skipped: 0 },
  };

  if (!startDateStr || !endDateStr || startDateStr > endDateStr || habits.length === 0) {
    return {
      dayOfWeek: 2, // Default Selasa
      dayName: 'Selasa',
      avgRate: 0,
      totalCompleted: 0,
      totalScheduled: 0,
      effectiveDenominator: 0,
    };
  }

  // Buat lookup map: 'habitId:dateStr' -> status
  const logMap = new Map();
  for (const log of logs) {
    if (log && log.habitId && log.logDate) {
      logMap.set(`${log.habitId}:${log.logDate}`, log.status);
    }
  }

  let currentDate = startDateStr;
  while (currentDate <= endDateStr) {
    const dow = getDayOfWeek(currentDate);

    for (const habit of habits) {
      if (isDateScheduled(habit, currentDate)) {
        dayBuckets[dow].scheduled++;
        const status = logMap.get(`${habit.id}:${currentDate}`);
        if (status === 'completed') {
          dayBuckets[dow].completed++;
        } else if (status === 'skipped') {
          dayBuckets[dow].skipped++;
        }
      }
    }

    currentDate = addDays(currentDate, 1);
  }

  let bestDow = 2; // Default fallback Selasa
  let highestRate = -1;
  let bestStats = { totalCompleted: 0, totalScheduled: 0, effectiveDenominator: 0 };

  for (let dow = 1; dow <= 7; dow++) {
    const bucket = dayBuckets[dow];
    const effectiveDenominator = bucket.scheduled - bucket.skipped;
    const rate =
      effectiveDenominator > 0
        ? Math.round((bucket.completed / effectiveDenominator) * 100)
        : 0;

    if (effectiveDenominator > 0 && rate > highestRate) {
      highestRate = rate;
      bestDow = dow;
      bestStats = {
        totalCompleted: bucket.completed,
        totalScheduled: bucket.scheduled,
        effectiveDenominator,
      };
    }
  }

  return {
    dayOfWeek: bestDow,
    dayName: getDayNameIndonesian(bestDow),
    avgRate: Math.max(0, highestRate),
    totalCompleted: bestStats.totalCompleted,
    totalScheduled: bestStats.totalScheduled,
    effectiveDenominator: bestStats.effectiveDenominator,
  };
}
