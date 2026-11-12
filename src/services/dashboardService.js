import { habitService } from './habitService';
import { logService } from './logService';
import { settingsService } from './settingsService';
import { getTodayString, addDays, getDayOfWeek, isDateScheduled } from '../utils/date';
import { calculateDailyProgress } from '../utils/progress';
import { calculateDashboardStreak } from '../utils/streak';
import { getDateStatus } from '../utils/calendar';

export const dashboardService = {
  /**
   * Mengambil data profil pengguna untuk sapaan Dashboard.
   * @returns {Promise<Object>}
   */
  async getProfile() {
    const settings = await settingsService.getSettings('general');
    const fullName = settings.displayName || 'Jerry Sutisno';
    const firstName = fullName.split(' ')[0] || 'Jerry';

    return {
      name: firstName,
      fullName,
      mindset: 'Tenang & Sadar Penuh',
      greetingSubtitle: 'Tarik napas, satu langkah dalam satu waktu.',
      cadenceText: 'Ritme Mindful',
    };
  },

  /**
   * Menghitung statistik harian secara murni dari data asli habit & logs.
   * @param {Array<Object>} habits
   * @returns {Promise<Object>}
   */
  async getStats(habits = []) {
    const today = getTodayString();
    const allHabits = habits.length > 0 ? habits : await habitService.getAllHabits({ includeArchived: false });
    const todayScheduled = allHabits.filter((h) => isDateScheduled(h, today));

    const todayLogs = await logService.getLogsForDate(today);
    const progress = calculateDailyProgress(todayScheduled, todayLogs);

    const allLogs = await logService.getAllLogs();
    const streakDays = calculateDashboardStreak(allHabits, allLogs, today);

    const pendingToday = progress.totalScheduled - progress.completedCount - progress.skippedCount;

    return {
      streakDays,
      personalBest: streakDays,
      totalActiveHabits: allHabits.length,
      scheduledToday: progress.totalScheduled,
      completedToday: progress.completedCount,
      pendingToday: Math.max(0, pendingToday),
      progressPercent: progress.progressPercent || 0,
      progressHeadline: allHabits.length === 0
        ? 'Mulai Langkah Pertama'
        : progress.progressPercent === 100
        ? 'Semua Selesai!'
        : 'Momentum Tenang',
      progressDescription: allHabits.length === 0
        ? 'Tanam kebiasaan baru untuk memulai perjalanan mindful Anda hari ini.'
        : progress.progressPercent === 100
        ? 'Luar biasa! Seluruh kebiasaan hari ini telah tercapai dengan penuh kesadaran.'
        : 'Anda membuat kemajuan yang stabil dan tenang hari ini.',
      routinesLeftText: allHabits.length === 0
        ? ''
        : pendingToday > 0
        ? `${pendingToday} rutinitas tenang tersisa`
        : 'Semua rutinitas hari ini selesai',
    };
  },

  /**
   * Mengambil kebiasaan yang terjadwal untuk hari ini.
   * @returns {Promise<Array<Object>>}
   */
  async getTodayHabits() {
    const habits = await habitService.getAllHabits({ includeArchived: false });
    const today = getTodayString();
    return habits.filter((h) => isDateScheduled(h, today));
  },

  /**
   * Toggle status habit hari ini.
   * @param {string} id
   * @returns {Promise<Array<Object>>}
   */
  async toggleHabit(id) {
    return habitService.toggleHabit(id);
  },

  /**
   * Menghasilkan pita kalender 7 hari (minggu berjalan) dengan status asli.
   * @returns {Promise<Array<Object>>}
   */
  async getWeekCalendar() {
    const today = getTodayString();
    const todayDow = getDayOfWeek(today); // 1 = Senin .. 7 = Minggu
    const mondayOffset = 1 - todayDow;

    const habits = await habitService.getAllHabits({ includeArchived: false });
    const allLogs = await logService.getAllLogs();

    const weekLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    const days = [];

    for (let i = 0; i < 7; i++) {
      const dateStr = addDays(today, mondayOffset + i);
      const isToday = dateStr === today;
      const statusObj = getDateStatus(dateStr, habits, allLogs, today);

      let statusUi = 'upcoming';
      if (statusObj.status === 'all_completed') statusUi = 'completed';
      else if (isToday) statusUi = 'active';
      else if (statusObj.status === 'partial') statusUi = 'partial';
      else if (statusObj.status === 'none_completed') statusUi = 'missed';

      const dateNum = Number(dateStr.split('-')[2]);

      days.push({
        day: weekLabels[i],
        date: dateNum,
        dateStr,
        status: statusUi,
        isToday,
      });
    }

    return days;
  },

  /**
   * Menghasilkan data grafik ritme mingguan 7 hari terakhir dari log asli.
   * @returns {Promise<Object>}
   */
  async getWeeklyRhythm() {
    const today = getTodayString();
    const habits = await habitService.getAllHabits({ includeArchived: false });
    const allLogs = await logService.getAllLogs();

    const weekLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const days = [];
    let totalCompleted = 0;
    let totalScheduled = 0;

    for (let offset = -6; offset <= 0; offset++) {
      const dateStr = addDays(today, offset);
      const isToday = offset === 0;
      const jsDay = new Date(dateStr).getDay();

      const statusObj = getDateStatus(dateStr, habits, allLogs, today);
      totalCompleted += statusObj.completedCount;
      totalScheduled += statusObj.effectiveTotal;

      const rate = statusObj.effectiveTotal > 0
        ? Math.round((statusObj.completedCount / statusObj.effectiveTotal) * 100)
        : 0;

      days.push({
        day: weekLabels[jsDay],
        completed: statusObj.completedCount,
        total: statusObj.effectiveTotal,
        height: `${rate}%`,
        highlight: isToday,
      });
    }

    const avgRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;

    return {
      summary: totalScheduled > 0
        ? `${totalCompleted} dari ${totalScheduled} rutinitas terjaga`
        : 'Belum ada rutinitas terjaga',
      average: `${avgRate}% Rata-rata`,
      days,
      isEmpty: habits.length === 0,
    };
  },

  getDailyQuote() {
    return {
      quote: '“Disiplin kecil yang diulang setiap hari dengan tenang membawa pada pencapaian yang bermakna.”',
      author: 'Habitly Daily Wisdom',
    };
  },

  getDailyAnchor() {
    return {
      title: 'Tautkan setelah Minum Teh / Kopi Pagi',
      description:
        'Menautkan kebiasaan refleksi segera setelah ritual pagi menciptakan kelanjutan perilaku otomatis tanpa beban pikiran.',
    };
  },
};
