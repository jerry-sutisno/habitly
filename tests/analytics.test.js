import { describe, it, expect } from 'vitest';
import {
  calculateCompletionRate,
  getBestHabit,
  getMostConsistentDay,
} from '../src/utils/analytics';

describe('Analytics Calculation Utility (Pure Engine)', () => {
  const sampleHabits = [
    { id: 'h1', name: 'Meditation', frequency: 'daily', startDate: '2024-10-01' },
    { id: 'h2', name: 'Water', frequency: 'daily', startDate: '2024-10-01' },
  ];

  it('calculateCompletionRate mengembalikan 0 saat penyebut 0 (tanpa jadwal atau rentang kosong)', () => {
    expect(calculateCompletionRate([], [], '2024-10-01', '2024-10-07')).toBe(0);
    expect(calculateCompletionRate(sampleHabits, [], '2024-10-08', '2024-10-01')).toBe(0);
  });

  it('calculateCompletionRate mengeluarkan status skipped dari penyebut', () => {
    // 2 hari: 2024-10-01 & 2024-10-02
    // Tiap hari ada 2 habit -> total jadwal 4
    // Log: h1 tgl 1 completed, h2 tgl 1 skipped
    //      h1 tgl 2 completed, h2 tgl 2 pending
    // Denominator = 4 - 1 (skipped) = 3
    // Completed = 2 -> 2/3 * 100% = 67%
    const logs = [
      { habitId: 'h1', logDate: '2024-10-01', status: 'completed' },
      { habitId: 'h2', logDate: '2024-10-01', status: 'skipped' },
      { habitId: 'h1', logDate: '2024-10-02', status: 'completed' },
    ];

    const rate = calculateCompletionRate(sampleHabits, logs, '2024-10-01', '2024-10-02');
    expect(rate).toBe(67);
  });

  it('getBestHabit memilih kebiasaan dengan rasio tertinggi sesuai threshold 7 hari', () => {
    const habits = [
      { id: 'h1', name: 'Meditation', frequency: 'daily', startDate: '2024-10-01' },
      { id: 'h2', name: 'Exercise', frequency: 'daily', startDate: '2024-10-01' },
    ];

    // Rentang 7 hari: 2024-10-01 s/d 2024-10-07
    // h1: 7 hari completed (100%)
    // h2: 4 hari completed (57%)
    const logs = [
      ...['01', '02', '03', '04', '05', '06', '07'].map((d) => ({
        habitId: 'h1',
        logDate: `2024-10-${d}`,
        status: 'completed',
      })),
      ...['01', '02', '03', '04'].map((d) => ({
        habitId: 'h2',
        logDate: `2024-10-${d}`,
        status: 'completed',
      })),
    ];

    const best = getBestHabit(habits, logs, '2024-10-01', '2024-10-07', 7);
    expect(best.habit?.name).toBe('Meditation');
    expect(best.rate).toBe(100);
    expect(best.completedCount).toBe(7);
  });

  it('getBestHabit fallback ke habit dengan jadwal terbanyak jika belum ada yang mencapai threshold', () => {
    // Habit hanya 3 hari jadwal
    const habits = [
      { id: 'h1', name: 'Reading', frequency: 'daily', startDate: '2024-10-01' },
      { id: 'h2', name: 'Running', frequency: 'daily', startDate: '2024-10-01' },
    ];

    // Rentang 3 hari: 2024-10-01 s/d 2024-10-03
    const logs = [
      { habitId: 'h1', logDate: '2024-10-01', status: 'completed' },
      { habitId: 'h1', logDate: '2024-10-02', status: 'completed' },
      { habitId: 'h1', logDate: '2024-10-03', status: 'completed' },
      { habitId: 'h2', logDate: '2024-10-01', status: 'completed' },
    ];

    const best = getBestHabit(habits, logs, '2024-10-01', '2024-10-03', 7);
    expect(best.habit?.name).toBe('Reading');
    expect(best.rate).toBe(100);
    expect(best.completedCount).toBe(3);
  });

  it('getMostConsistentDay menentukan hari dengan persentase penyelesaian tertinggi', () => {
    const habits = [
      { id: 'h1', name: 'Meditation', frequency: 'daily', startDate: '2024-10-01' },
    ];

    // Rentang 14 hari: 2024-10-01 (Selasa) s/d 2024-10-14 (Senin)
    // Berikan log 100% hanya di hari Selasa (2024-10-01 dan 2024-10-08)
    const logs = [
      { habitId: 'h1', logDate: '2024-10-01', status: 'completed' }, // Selasa
      { habitId: 'h1', logDate: '2024-10-08', status: 'completed' }, // Selasa
      { habitId: 'h1', logDate: '2024-10-02', status: 'completed' }, // Rabu (1 dari 2)
    ];

    const consistentDay = getMostConsistentDay(habits, logs, '2024-10-01', '2024-10-14');
    expect(consistentDay.dayOfWeek).toBe(2);
    expect(consistentDay.dayName).toBe('Selasa');
    expect(consistentDay.avgRate).toBe(100);
    expect(consistentDay.totalCompleted).toBe(2);
  });
});
