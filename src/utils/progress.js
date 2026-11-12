// Daily Progress Utility - Pure functions
// Complies with AGENTS.md 4.2 & SRS-FR-009

/**
 * Menghitung persentase progres harian berdasarkan kebiasaan terjadwal dan log hari tersebut.
 *
 * Formula:
 * Progress = (Jumlah Completed) / (Jumlah Scheduled - Jumlah Skipped) * 100%
 *
 * Edge Cases:
 * - Jika penyebut <= 0 (seluruh kebiasaan di-skip atau tidak ada kebiasaan terjadwal), return 0%.
 *
 * @param {Array<Object>} scheduledHabits - Daftar kebiasaan yang terjadwal hari ini
 * @param {Array<Object>} logsForDay - Daftar log untuk hari ini (status: 'completed' | 'skipped')
 * @returns {{
 *   progressPercent: number,
 *   completedCount: number,
 *   skippedCount: number,
 *   totalScheduled: number,
 *   effectiveDenominator: number
 * }}
 */
export function calculateDailyProgress(scheduledHabits = [], logsForDay = []) {
  const totalScheduled = scheduledHabits.length;
  if (totalScheduled === 0) {
    return {
      progressPercent: 0,
      completedCount: 0,
      skippedCount: 0,
      totalScheduled: 0,
      effectiveDenominator: 0,
    };
  }

  // Buat lookup status berdasarkan habitId
  const logMap = new Map();
  for (const log of logsForDay) {
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

  const effectiveDenominator = totalScheduled - skippedCount;

  // Kasus tepi penyebut <= 0
  if (effectiveDenominator <= 0) {
    return {
      progressPercent: 0,
      completedCount,
      skippedCount,
      totalScheduled,
      effectiveDenominator,
    };
  }

  const rawPercent = (completedCount / effectiveDenominator) * 100;
  const progressPercent = Math.min(100, Math.max(0, Math.round(rawPercent)));

  return {
    progressPercent,
    completedCount,
    skippedCount,
    totalScheduled,
    effectiveDenominator,
  };
}
