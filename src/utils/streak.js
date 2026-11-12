// Streak Utility - Pure functions
// Complies with AGENTS.md 4.3 & SRS-FR-010 / SRS-FR-011

import { addDays, isDateScheduled, getTodayString } from './date';

/**
 * Menghitung streak untuk satu kebiasaan spesifik.
 *
 * Aturan:
 * 1. Evaluasi mundur dari kemarin (today - 1) hingga habit.startDate.
 * 2. Hari tidak terjadwal diabaikan (neutral skip).
 * 3. Hari 'skipped' diabaikan (neutral skip, tidak memutus streak).
 * 4. Hari 'completed' menambah streak +1.
 * 5. Hari terjadwal lampau tanpa log 'completed' memutus rantai streak (loop berhenti).
 * 6. Evaluasi hari ini (today):
 *    - Jika hari ini terjadwal dan 'completed': streak +1.
 *    - Jika hari ini belum selesai (pending/skipped/tidak terjadwal): streak tidak putus, pakai nilai sampai kemarin.
 *
 * @param {Object} habit - Objek habit (harus memiliki id, frequency, scheduledDays, startDate)
 * @param {Array<Object>} logs - Seluruh log untuk habit ini atau log global (akan difilter berdasarkan habit.id)
 * @param {string} [todayStr=getTodayString()] - Tanggal hari ini 'YYYY-MM-DD'
 * @returns {number} Nilai streak saat ini (>= 0)
 */
export function calculateHabitStreak(habit, logs = [], todayStr = getTodayString()) {
  if (!habit || !habit.startDate || habit.startDate > todayStr) {
    return 0;
  }

  // Buat lookup map: logDate -> status
  const logMap = new Map();
  for (const log of logs) {
    if (log && log.habitId === habit.id && log.logDate) {
      logMap.set(log.logDate, log.status);
    }
  }

  let streak = 0;

  // 1. Evaluasi hari ini
  let todayCompletedBonus = false;
  if (isDateScheduled(habit, todayStr)) {
    const todayStatus = logMap.get(todayStr);
    if (todayStatus === 'completed') {
      todayCompletedBonus = true;
    }
  }

  // 2. Evaluasi mundur dari kemarin (today - 1) hingga habit.startDate
  let currentDate = addDays(todayStr, -1);

  while (currentDate >= habit.startDate) {
    // Periksa apakah tanggal ini terjadwal untuk habit
    if (isDateScheduled(habit, currentDate)) {
      const status = logMap.get(currentDate);

      if (status === 'completed') {
        streak++;
      } else if (status === 'skipped') {
        // Hari skipped tidak memutus streak dan tidak menambah (neutral skip)
      } else {
        // Hari terjadwal lampau tanpa completed memutus streak
        break;
      }
    }
    // Hari tidak terjadwal diabaikan (neutral skip)

    currentDate = addDays(currentDate, -1);
  }

  if (todayCompletedBonus) {
    streak++;
  }

  return streak;
}

/**
 * Menghitung streak konsistensi 100% harian pada Dashboard.
 *
 * Aturan:
 * - Menghitung hari berturut-turut di mana SELURUH kebiasaan terjadwal hari itu diselesaikan 100%.
 * - Hari tanpa jadwal dan hari di mana seluruh habit di-skip diabaikan (neutral skip).
 * - Evaluasi hari ini: Jika hari ini 100% selesai, tambah +1; jika belum selesai, streak tidak putus.
 *
 * @param {Array<Object>} habits - Seluruh kebiasaan aktif
 * @param {Array<Object>} logs - Seluruh log
 * @param {string} [todayStr=getTodayString()]
 * @returns {number} Nilai streak dashboard
 */
export function calculateDashboardStreak(habits = [], logs = [], todayStr = getTodayString()) {
  if (!Array.isArray(habits) || habits.length === 0) {
    return 0;
  }

  // Kelompokkan logs per tanggal: dateStr -> Map<habitId, status>
  const logsByDate = new Map();
  for (const log of logs) {
    if (log && log.logDate && log.habitId) {
      if (!logsByDate.has(log.logDate)) {
        logsByDate.set(log.logDate, new Map());
      }
      logsByDate.get(log.logDate).set(log.habitId, log.status);
    }
  }

  // Cari tanggal paling awal dari seluruh habit (earliest startDate)
  let earliestDate = todayStr;
  for (const habit of habits) {
    if (habit.startDate && habit.startDate < earliestDate) {
      earliestDate = habit.startDate;
    }
  }

  // Helper untuk mengevaluasi suatu tanggal
  const evaluateDay = (dateStr) => {
    const scheduled = habits.filter((h) => isDateScheduled(h, dateStr));
    if (scheduled.length === 0) {
      return 'neutral'; // Tidak ada jadwal
    }

    const dayLogMap = logsByDate.get(dateStr) || new Map();
    let completedCount = 0;
    let skippedCount = 0;

    for (const h of scheduled) {
      const status = dayLogMap.get(h.id);
      if (status === 'completed') completedCount++;
      else if (status === 'skipped') skippedCount++;
    }

    const effectiveDenominator = scheduled.length - skippedCount;
    if (effectiveDenominator <= 0) {
      return 'neutral'; // Seluruh jadwal di-skip
    }

    if (completedCount === effectiveDenominator) {
      return 'perfect'; // 100% selesai
    }

    return 'broken'; // Ada yang belum selesai
  };

  let streak = 0;

  // 1. Evaluasi hari ini
  const todayResult = evaluateDay(todayStr);
  const todayBonus = todayResult === 'perfect';

  // 2. Evaluasi mundur dari kemarin (today - 1)
  let currentDate = addDays(todayStr, -1);

  while (currentDate >= earliestDate) {
    const dayResult = evaluateDay(currentDate);

    if (dayResult === 'perfect') {
      streak++;
    } else if (dayResult === 'broken') {
      break;
    }
    // 'neutral' diabaikan

    currentDate = addDays(currentDate, -1);
  }

  if (todayBonus) {
    streak++;
  }

  return streak;
}
