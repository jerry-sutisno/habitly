import { describe, it, expect } from 'vitest';
import {
  getDateStatus,
  STATUS_FUTURE,
  STATUS_NO_SCHEDULE,
  STATUS_ALL_COMPLETED,
  STATUS_PARTIAL,
  STATUS_NONE_COMPLETED,
} from '../src/utils/calendar';

describe('Calendar Status Utility (Pure Engine)', () => {
  const today = '2024-10-24';

  const sampleHabits = [
    { id: 'h1', frequency: 'daily', startDate: '2024-10-01' },
    { id: 'h2', frequency: 'daily', startDate: '2024-10-01' },
    { id: 'h3', frequency: 'selected_days', scheduledDays: [1, 3, 5], startDate: '2024-10-01' }, // Sen, Rab, Jum
  ];

  it('mengembalikan status future untuk tanggal di masa depan (T > today)', () => {
    const result = getDateStatus('2024-10-25', sampleHabits, [], today);
    expect(result.status).toBe(STATUS_FUTURE);
  });

  it('mengembalikan status no_schedule jika tidak ada habit terjadwal pada tanggal tersebut', () => {
    // Habit hanya hari Senin
    const mondayOnlyHabits = [
      { id: 'h1', frequency: 'selected_days', scheduledDays: [1], startDate: '2024-10-01' },
    ];
    // 2024-10-22 adalah Selasa
    const result = getDateStatus('2024-10-22', mondayOnlyHabits, [], today);
    expect(result.status).toBe(STATUS_NO_SCHEDULE);
    expect(result.totalScheduled).toBe(0);
  });

  it('mengembalikan status no_schedule jika seluruh kebiasaan terjadwal di-skip', () => {
    const dailyHabits = [
      { id: 'h1', frequency: 'daily', startDate: '2024-10-01' },
    ];
    const logs = [
      { habitId: 'h1', logDate: '2024-10-22', status: 'skipped' },
    ];

    const result = getDateStatus('2024-10-22', dailyHabits, logs, today);
    expect(result.status).toBe(STATUS_NO_SCHEDULE);
    expect(result.skippedCount).toBe(1);
    expect(result.effectiveTotal).toBe(0);
  });

  it('mengembalikan status all_completed jika 100% jadwal selesai', () => {
    // 2024-10-22 (Selasa): h1 & h2 terjadwal (h3 libur) -> 2 terjadwal
    const logs = [
      { habitId: 'h1', logDate: '2024-10-22', status: 'completed' },
      { habitId: 'h2', logDate: '2024-10-22', status: 'completed' },
    ];

    const result = getDateStatus('2024-10-22', sampleHabits, logs, today);
    expect(result.status).toBe(STATUS_ALL_COMPLETED);
    expect(result.completedCount).toBe(2);
    expect(result.totalScheduled).toBe(2);
  });

  it('mengembalikan status partial jika sebagian selesai', () => {
    // 2024-10-22: 2 terjadwal, hanya h1 selesai
    const logs = [
      { habitId: 'h1', logDate: '2024-10-22', status: 'completed' },
    ];

    const result = getDateStatus('2024-10-22', sampleHabits, logs, today);
    expect(result.status).toBe(STATUS_PARTIAL);
    expect(result.completedCount).toBe(1);
    expect(result.effectiveTotal).toBe(2);
  });

  it('mengembalikan status none_completed jika ada jadwal namun nol selesai', () => {
    // 2024-10-22: 2 terjadwal, belum ada log sama sekali
    const result = getDateStatus('2024-10-22', sampleHabits, [], today);
    expect(result.status).toBe(STATUS_NONE_COMPLETED);
    expect(result.completedCount).toBe(0);
    expect(result.totalScheduled).toBe(2);
  });
});
