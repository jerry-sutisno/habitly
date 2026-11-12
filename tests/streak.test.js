import { describe, it, expect } from 'vitest';
import { calculateHabitStreak, calculateDashboardStreak } from '../src/utils/streak';

describe('Streak Calculation Utility (Pure Engine)', () => {
  const today = '2024-10-24'; // Kamis

  it('hari ini belum selesai TIDAK memutus streak (mempertahankan nilai sampai kemarin)', () => {
    const habit = {
      id: 'h1',
      frequency: 'daily',
      startDate: '2024-10-20',
    };

    // Log selesai berturut-turut pada 20, 21, 22, 23 (4 hari)
    // Hari ini 24 belum ada log (belum selesai)
    const logs = [
      { habitId: 'h1', logDate: '2024-10-20', status: 'completed' },
      { habitId: 'h1', logDate: '2024-10-21', status: 'completed' },
      { habitId: 'h1', logDate: '2024-10-22', status: 'completed' },
      { habitId: 'h1', logDate: '2024-10-23', status: 'completed' },
    ];

    const streak = calculateHabitStreak(habit, logs, today);
    expect(streak).toBe(4);
  });

  it('hari ini selesai menambah +1 pada streak', () => {
    const habit = {
      id: 'h1',
      frequency: 'daily',
      startDate: '2024-10-20',
    };

    const logs = [
      { habitId: 'h1', logDate: '2024-10-20', status: 'completed' },
      { habitId: 'h1', logDate: '2024-10-21', status: 'completed' },
      { habitId: 'h1', logDate: '2024-10-22', status: 'completed' },
      { habitId: 'h1', logDate: '2024-10-23', status: 'completed' },
      { habitId: 'h1', logDate: '2024-10-24', status: 'completed' }, // Hari ini selesai
    ];

    const streak = calculateHabitStreak(habit, logs, today);
    expect(streak).toBe(5);
  });

  it('hari tidak terjadwal TIDAK memutus streak (neutral skip)', () => {
    // Habit hanya dijadwalkan pada hari Selasa (2) dan Kamis (4)
    const habit = {
      id: 'h2',
      frequency: 'selected_days',
      scheduledDays: [2, 4],
      startDate: '2024-10-15',
    };

    // 2024-10-15 (Selasa) completed
    // 2024-10-16 (Rabu - tidak terjadwal)
    // 2024-10-17 (Kamis) completed
    // 2024-10-18 s/d 2024-10-21 (Jumat s/d Senin - tidak terjadwal)
    // 2024-10-22 (Selasa) completed
    // 2024-10-23 (Rabu - tidak terjadwal)
    // 2024-10-24 (Kamis = today) completed
    const logs = [
      { habitId: 'h2', logDate: '2024-10-15', status: 'completed' },
      { habitId: 'h2', logDate: '2024-10-17', status: 'completed' },
      { habitId: 'h2', logDate: '2024-10-22', status: 'completed' },
      { habitId: 'h2', logDate: '2024-10-24', status: 'completed' },
    ];

    const streak = calculateHabitStreak(habit, logs, today);
    expect(streak).toBe(4);
  });

  it('hari dengan status skipped TIDAK memutus streak (neutral skip)', () => {
    const habit = {
      id: 'h3',
      frequency: 'daily',
      startDate: '2024-10-20',
    };

    // 20 completed, 21 completed, 22 skipped, 23 completed, 24 belum selesai
    const logs = [
      { habitId: 'h3', logDate: '2024-10-20', status: 'completed' },
      { habitId: 'h3', logDate: '2024-10-21', status: 'completed' },
      { habitId: 'h3', logDate: '2024-10-22', status: 'skipped' }, // Skipped
      { habitId: 'h3', logDate: '2024-10-23', status: 'completed' },
    ];

    // Streak = 3 (tanggal 20, 21, 23; tgl 22 diabaikan, tgl 24 belum selesai)
    const streak = calculateHabitStreak(habit, logs, today);
    expect(streak).toBe(3);
  });

  it('hari terjadwal lampau tanpa log completed memutus rantai streak', () => {
    const habit = {
      id: 'h4',
      frequency: 'daily',
      startDate: '2024-10-15',
    };

    // 20 completed, 21 terlewat (tanpa log), 22 completed, 23 completed, 24 pending
    const logs = [
      { habitId: 'h4', logDate: '2024-10-20', status: 'completed' },
      // 2024-10-21 bolong / terlewat
      { habitId: 'h4', logDate: '2024-10-22', status: 'completed' },
      { habitId: 'h4', logDate: '2024-10-23', status: 'completed' },
    ];

    // Streak hanya menghitung 22 dan 23 -> streak = 2
    const streak = calculateHabitStreak(habit, logs, today);
    expect(streak).toBe(2);
  });

  it('mematuhi startDate: tidak menghitung sebelum startDate dan menangani habit baru', () => {
    // Habit baru dibuat hari ini
    const newHabitToday = {
      id: 'h5',
      frequency: 'daily',
      startDate: today,
    };

    // Kasus 1: Hari ini belum selesai -> 0
    expect(calculateHabitStreak(newHabitToday, [], today)).toBe(0);

    // Kasus 2: Hari ini selesai -> 1
    const logsToday = [{ habitId: 'h5', logDate: today, status: 'completed' }];
    expect(calculateHabitStreak(newHabitToday, logsToday, today)).toBe(1);

    // Kasus 3: startDate di masa depan -> 0
    const futureHabit = {
      id: 'h6',
      frequency: 'daily',
      startDate: '2024-10-25',
    };
    expect(calculateHabitStreak(futureHabit, [], today)).toBe(0);
  });

  it('menangani pergantian hari dan pergantian bulan', () => {
    const habit = {
      id: 'h7',
      frequency: 'daily',
      startDate: '2024-09-28',
    };

    // Streak melintasi batas September (30 hari) ke Oktober
    const logs = [
      { habitId: 'h7', logDate: '2024-09-29', status: 'completed' },
      { habitId: 'h7', logDate: '2024-09-30', status: 'completed' },
      { habitId: 'h7', logDate: '2024-10-01', status: 'completed' },
      { habitId: 'h7', logDate: '2024-10-02', status: 'completed' },
    ];

    expect(calculateHabitStreak(habit, logs, '2024-10-02')).toBe(4);
  });

  it('menghitung streak dashboard untuk hari-hari berturut-turut 100% selesai', () => {
    const habits = [
      { id: 'h1', frequency: 'daily', startDate: '2024-10-20' },
      { id: 'h2', frequency: 'daily', startDate: '2024-10-20' },
    ];

    // 21: both completed (100%)
    // 22: both completed (100%)
    // 23: 1 completed, 1 skipped -> effective denominator 1, completed 1 (100%)
    // 24 (today): h1 completed, h2 pending (belum 100%)
    const logs = [
      { habitId: 'h1', logDate: '2024-10-21', status: 'completed' },
      { habitId: 'h2', logDate: '2024-10-21', status: 'completed' },
      { habitId: 'h1', logDate: '2024-10-22', status: 'completed' },
      { habitId: 'h2', logDate: '2024-10-22', status: 'completed' },
      { habitId: 'h1', logDate: '2024-10-23', status: 'completed' },
      { habitId: 'h2', logDate: '2024-10-23', status: 'skipped' },
      { habitId: 'h1', logDate: '2024-10-24', status: 'completed' },
    ];

    // Streak = 3 (hari 21, 22, 23; hari ini belum 100% sehingga tidak putus dan bernilai 3)
    const dashboardStreak = calculateDashboardStreak(habits, logs, today);
    expect(dashboardStreak).toBe(3);
  });
});
