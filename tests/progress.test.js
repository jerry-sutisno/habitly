import { describe, it, expect } from 'vitest';
import { calculateDailyProgress } from '../src/utils/progress';

describe('Daily Progress Utility (Pure Engine)', () => {
  it('mengembalikan 0% saat penyebut 0 (tidak ada kebiasaan terjadwal)', () => {
    const result = calculateDailyProgress([], []);
    expect(result.progressPercent).toBe(0);
    expect(result.totalScheduled).toBe(0);
    expect(result.effectiveDenominator).toBe(0);
  });

  it('mengembalikan 0% saat seluruh kebiasaan berstatus skipped (penyebut <= 0)', () => {
    const habits = [
      { id: 'h1', name: 'Meditation' },
      { id: 'h2', name: 'Workout' },
    ];
    const logs = [
      { habitId: 'h1', status: 'skipped' },
      { habitId: 'h2', status: 'skipped' },
    ];

    const result = calculateDailyProgress(habits, logs);
    expect(result.progressPercent).toBe(0);
    expect(result.skippedCount).toBe(2);
    expect(result.effectiveDenominator).toBe(0);
  });

  it('menghitung progres akurat dengan mengabaikan skipped dari penyebut', () => {
    const habits = [
      { id: 'h1', name: 'Meditation' },
      { id: 'h2', name: 'Drink Water' },
      { id: 'h3', name: 'Read Book' },
      { id: 'h4', name: 'Jogging' },
      { id: 'h5', name: 'Reflection' },
    ];

    // 3 completed, 1 skipped, 1 pending
    const logs = [
      { habitId: 'h1', status: 'completed' },
      { habitId: 'h2', status: 'completed' },
      { habitId: 'h3', status: 'completed' },
      { habitId: 'h4', status: 'skipped' }, // Jogging skipped
      // h5 pending (tanpa log)
    ];

    // Total scheduled = 5, Skipped = 1 -> Effective Denominator = 4
    // Completed = 3 -> 3/4 * 100% = 75%
    const result = calculateDailyProgress(habits, logs);
    expect(result.progressPercent).toBe(75);
    expect(result.completedCount).toBe(3);
    expect(result.skippedCount).toBe(1);
    expect(result.totalScheduled).toBe(5);
    expect(result.effectiveDenominator).toBe(4);
  });

  it('mencapai 100% jika seluruh jadwal yang tidak di-skip selesai', () => {
    const habits = [
      { id: 'h1', name: 'Meditation' },
      { id: 'h2', name: 'Reading' },
    ];
    const logs = [
      { habitId: 'h1', status: 'completed' },
      { habitId: 'h2', status: 'completed' },
    ];

    const result = calculateDailyProgress(habits, logs);
    expect(result.progressPercent).toBe(100);
    expect(result.completedCount).toBe(2);
  });
});
