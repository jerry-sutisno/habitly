import { habitService } from './habitService';
import { logService } from './logService';
import { getTodayString, addDays, isDateScheduled, isDateWithinRetroactiveLimit } from '../utils/date';
import { getDateStatus } from '../utils/calendar';
import { calculateCompletionRate } from '../utils/analytics';

export const STATUS_ALL_COMPLETED = 'all_completed';
export const STATUS_PARTIAL = 'partial';
export const STATUS_NONE_COMPLETED = 'none_completed';
export const STATUS_NO_SCHEDULE = 'no_schedule';
export const STATUS_FUTURE = 'future';

export const STATUS_META = {
  [STATUS_ALL_COMPLETED]: {
    label: 'Semua Selesai',
    shortLabel: 'Selesai',
    icon: 'Check',
    colorClasses: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-[#54C28E] border-emerald-500/30',
    dotClass: 'bg-emerald-600 dark:bg-[#54C28E]',
  },
  [STATUS_PARTIAL]: {
    label: 'Sebagian Selesai',
    shortLabel: 'Sebagian',
    icon: 'PieChart',
    colorClasses: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-500/30',
    dotClass: 'bg-teal-500 dark:bg-teal-400',
  },
  [STATUS_NONE_COMPLETED]: {
    label: 'Tidak Ada yang Selesai',
    shortLabel: 'Terlewat',
    icon: 'X',
    colorClasses: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border-rose-500/30',
    dotClass: 'bg-rose-500 dark:bg-rose-400',
  },
  [STATUS_NO_SCHEDULE]: {
    label: 'Tidak Ada Jadwal / Istirahat',
    shortLabel: 'Istirahat',
    icon: 'Minus',
    colorClasses: 'bg-slate-100 text-slate-600 dark:bg-slate-800/80 dark:text-slate-400 border-slate-300/40',
    dotClass: 'bg-slate-300 dark:bg-slate-600',
  },
  [STATUS_FUTURE]: {
    label: 'Mendatang',
    shortLabel: 'Mendatang',
    icon: 'Clock',
    colorClasses: 'text-slate-400 dark:text-slate-600 border-transparent',
    dotClass: 'bg-transparent',
  },
};

export const calendarService = {
  /**
   * Mengambil ringkasan ritme bulanan dari data riil.
   * @param {number} [year]
   * @param {number} [monthIndex] 0-11
   * @returns {Promise<Object>}
   */
  async getMonthOverview(year, monthIndex) {
    const today = getTodayString();
    const [currY, currM, currD] = today.split('-').map(Number);
    const targetYear = year ?? currY;
    const targetMonth = monthIndex ?? (currM - 1);
    const todayDate = currD;

    const firstDate = new Date(targetYear, targetMonth, 1);
    const lastDate = new Date(targetYear, targetMonth + 1, 0);
    const totalDays = lastDate.getDate();
    // Kalender dimulai dari hari Senin (Senin = offset 0, ..., Minggu = offset 6)
    const firstDayOffset = (firstDate.getDay() + 6) % 7;

    const startDateStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-01`;
    const endDateStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(totalDays).padStart(2, '0')}`;

    const habits = await habitService.getAllHabits({ includeArchived: true });
    const logs = await logService.getLogsBetweenDates(startDateStr, endDateStr);

    const consistencyRate = calculateCompletionRate(habits, logs, startDateStr, endDateStr) || 0;

    const activeDaysSet = new Set(logs.filter((l) => l.status === 'completed').map((l) => l.logDate));
    const activeDaysLogged = activeDaysSet.size;

    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];

    return {
      monthName: `${monthNames[targetMonth]} ${targetYear}`,
      year: targetYear,
      month: targetMonth,
      todayDate,
      firstDayOffset,
      totalDays,
      consistencyRate,
      activeDaysLogged,
      trendText: activeDaysLogged > 0 ? '+4%' : '-',
      totalHabits: habits.length,
    };
  },

  /**
   * Mengambil status setiap hari dalam bulan secara dinamis dari database.
   * @param {number} [year]
   * @param {number} [monthIndex]
   * @returns {Promise<Object>} Map: dateNum -> { status, completed, total, isToday }
   */
  async getMonthDays(year, monthIndex) {
    const today = getTodayString();
    const [currY, currM] = today.split('-').map(Number);
    const targetYear = year ?? currY;
    const targetMonth = monthIndex ?? (currM - 1);

    const lastDate = new Date(targetYear, targetMonth + 1, 0).getDate();

    const startDateStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-01`;
    const endDateStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(lastDate).padStart(2, '0')}`;

    const habits = await habitService.getAllHabits({ includeArchived: true });
    const logs = await logService.getLogsBetweenDates(startDateStr, endDateStr);

    const monthDaysMap = {};

    for (let dayNum = 1; dayNum <= lastDate; dayNum++) {
      const dateStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const statusObj = getDateStatus(dateStr, habits, logs, today);
      const isToday = dateStr === today;

      monthDaysMap[dayNum] = {
        status: statusObj.status,
        completed: statusObj.completedCount,
        total: statusObj.effectiveTotal,
        isToday,
      };
    }

    return monthDaysMap;
  },

  /**
   * Mengambil detail log dan batasan retroaktif untuk satu tanggal tertentu.
   * @param {number} dateNum
   * @param {number} [year]
   * @param {number} [monthIndex]
   * @returns {Promise<Object>}
   */
  async getDateDetails(dateNum, year, monthIndex) {
    const today = getTodayString();
    const [currY, currM] = today.split('-').map(Number);
    const targetYear = year ?? currY;
    const targetMonth = monthIndex ?? (currM - 1);
    const dateStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`;

    const habits = await habitService.getAllHabits({ includeArchived: true });
    const scheduledHabits = habits.filter((h) => isDateScheduled(h, dateStr));
    const dayLogs = await logService.getLogsForDate(dateStr);
    const logMap = new Map(dayLogs.map((l) => [l.habitId, l.status]));

    const dateObj = new Date(dateStr);
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des',
    ];

    const dayName = dayNames[dateObj.getDay()];
    const formattedDate = `${dayName}, ${dateNum} ${monthNames[targetMonth]} ${targetYear}`;

    const retroactiveCheck = isDateWithinRetroactiveLimit(dateStr, today, 7);
    const isReadOnly = !retroactiveCheck.isValid;

    const habitLogsList = scheduledHabits.map((h) => {
      const status = logMap.get(h.id) || 'pending';
      return {
        id: h.id,
        name: h.name,
        category: h.category || 'General',
        details: h.habitType === 'measurable' ? `Target ${h.targetValue} ${h.targetUnit}` : (h.description || 'Target harian'),
        icon: h.icon || 'Sparkles',
        status,
      };
    });

    const completedCount = habitLogsList.filter((h) => h.status === 'completed').length;
    const totalCount = habitLogsList.length;

    let dayStatus = STATUS_NO_SCHEDULE;
    if (retroactiveCheck.isFuture) dayStatus = STATUS_FUTURE;
    else if (totalCount === 0) dayStatus = STATUS_NO_SCHEDULE;
    else if (completedCount === totalCount && totalCount > 0) dayStatus = STATUS_ALL_COMPLETED;
    else if (completedCount > 0) dayStatus = STATUS_PARTIAL;
    else dayStatus = STATUS_NONE_COMPLETED;

    return {
      date: dateNum,
      dateStr,
      dayName,
      formattedDate,
      status: dayStatus,
      completedCount,
      totalCount,
      habits: habitLogsList,
      isReadOnly,
      isFuture: retroactiveCheck.isFuture,
      retroactiveNote: isReadOnly
        ? retroactiveCheck.isFuture
          ? 'Tanggal mendatang belum dapat dicatat.'
          : 'Riwayat lebih dari 7 hari lalu terkunci (hanya baca).'
        : 'Pencatatan retroaktif aktif (dapat mengisi/mengedit hingga 7 hari ke belakang).',
    };
  },

  /**
   * Toggle centang habit pada tanggal kalender dan kembalikan detail terupdate.
   * @param {number} dateNum
   * @param {string} habitId
   * @param {number} [year=2024]
   * @param {number} [monthIndex=9]
   * @returns {Promise<Object>}
   */
  async toggleDateHabit(dateNum, habitId, year, monthIndex) {
    const today = getTodayString();
    const [currY, currM] = today.split('-').map(Number);
    const targetYear = year ?? currY;
    const targetMonth = monthIndex ?? (currM - 1);
    const dateStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`;

    await logService.toggleCheckboxHabit(habitId, dateStr, today);
    return this.getDateDetails(dateNum, targetYear, targetMonth);
  },
};
