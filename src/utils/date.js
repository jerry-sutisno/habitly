// Date Utility - Pure functions for localized calendar calculations
// Complies with AGENTS.md 2.1 & SRS-FR-001 / SRS-FR-002

/**
 * Mengembalikan string tanggal 'YYYY-MM-DD' berdasarkan waktu lokal perangkat (bukan UTC slice).
 * @param {Date} [d=new Date()]
 * @returns {string} 'YYYY-MM-DD'
 */
export function getTodayString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Mengubah 'YYYY-MM-DD' menjadi objek Date lokal (jam 00:00:00).
 * @param {string} dateStr
 * @returns {Date}
 */
export function parseDateString(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Menambahkan atau mengurangkan hari dari string tanggal 'YYYY-MM-DD'.
 * @param {string} dateStr
 * @param {number} days
 * @returns {string}
 */
export function addDays(dateStr, days) {
  const date = parseDateString(dateStr);
  date.setDate(date.getDate() + days);
  return getTodayString(date);
}

/**
 * Mengembalikan indeks hari dalam seminggu: 1 = Senin, 2 = Selasa, ..., 7 = Minggu.
 * Sesuai skema SRS.md 4.2.1 (scheduledDays 1..7).
 * @param {string} dateStr
 * @returns {number} 1..7
 */
export function getDayOfWeek(dateStr) {
  const date = parseDateString(dateStr);
  const jsDay = date.getDay(); // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
  return jsDay === 0 ? 7 : jsDay;
}

/**
 * Mendapatkan nama hari dalam bahasa Indonesia.
 * @param {number} dayNumber 1..7
 * @returns {string}
 */
export function getDayNameIndonesian(dayNumber) {
  const names = {
    1: 'Senin',
    2: 'Selasa',
    3: 'Rabu',
    4: 'Kamis',
    5: 'Jumat',
    6: 'Sabtu',
    7: 'Minggu',
  };
  return names[dayNumber] || '';
}

/**
 * Memeriksa apakah suatu tanggal berada di dalam jendela retroaktif (maksimal 7 hari ke belakang).
 * @param {string} targetDateStr
 * @param {string} [todayStr=getTodayString()]
 * @param {number} [maxDaysBack=7]
 * @returns {{ isValid: boolean, isFuture: boolean, isTooOld: boolean }}
 */
export function isDateWithinRetroactiveLimit(
  targetDateStr,
  todayStr = getTodayString(),
  maxDaysBack = 7
) {
  if (targetDateStr > todayStr) {
    return { isValid: false, isFuture: true, isTooOld: false };
  }

  const minAllowedDate = addDays(todayStr, -maxDaysBack);
  if (targetDateStr < minAllowedDate) {
    return { isValid: false, isFuture: false, isTooOld: true };
  }

  return { isValid: true, isFuture: false, isTooOld: false };
}

/**
 * Memeriksa apakah suatu kebiasaan terjadwal pada tanggal tertentu.
 * @param {Object} habit
 * @param {string} dateStr
 * @returns {boolean}
 */
export function isDateScheduled(habit, dateStr) {
  if (!habit) return false;

  // Tanggal sebelum startDate tidak terjadwal
  if (habit.startDate && dateStr < habit.startDate) {
    return false;
  }

  // Jika kebiasaan diarsipkan dan ada archivedAt, cek tanggal arsip lokal
  if (habit.isArchived && habit.archivedAt) {
    const archiveDateStr = getTodayString(new Date(habit.archivedAt));
    if (dateStr > archiveDateStr) {
      return false;
    }
  }

  if (habit.frequency === 'daily') {
    return true;
  }

  if (habit.frequency === 'selected_days') {
    const dayOfWeek = getDayOfWeek(dateStr);
    return Array.isArray(habit.scheduledDays) && habit.scheduledDays.includes(dayOfWeek);
  }

  return false;
}
