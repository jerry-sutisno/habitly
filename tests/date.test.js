import { describe, it, expect } from 'vitest';
import {
  getTodayString,
  parseDateString,
  addDays,
  getDayOfWeek,
  getDayNameIndonesian,
  isDateWithinRetroactiveLimit,
  isDateScheduled,
} from '../src/utils/date';

describe('Date Utilities (Pure Engine)', () => {
  it('getTodayString mengembalikan format YYYY-MM-DD dalam waktu lokal', () => {
    const fixedDate = new Date(2026, 10, 12, 23, 45, 0); // 12 November 2026 jam 23:45 lokal
    const result = getTodayString(fixedDate);
    expect(result).toBe('2026-11-12');
  });

  it('addDays menangani pergantian hari, batas bulan, dan pergantian tahun', () => {
    expect(addDays('2024-10-31', 1)).toBe('2024-11-01');
    expect(addDays('2024-12-31', 1)).toBe('2025-01-01');
    expect(addDays('2024-01-01', -1)).toBe('2023-12-31');
    // Tahun kabisat 2024
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
    expect(addDays('2024-02-29', 1)).toBe('2024-03-01');
  });

  it('getDayOfWeek memetakan 1=Senin hingga 7=Minggu sesuai SRS', () => {
    // 2024-10-21 adalah Senin
    expect(getDayOfWeek('2024-10-21')).toBe(1);
    expect(getDayNameIndonesian(1)).toBe('Senin');

    // 2024-10-27 adalah Minggu
    expect(getDayOfWeek('2024-10-27')).toBe(7);
    expect(getDayNameIndonesian(7)).toBe('Minggu');

    // 2024-10-24 adalah Kamis
    expect(getDayOfWeek('2024-10-24')).toBe(4);
    expect(getDayNameIndonesian(4)).toBe('Kamis');
  });

  it('isDateWithinRetroactiveLimit memvalidasi jendela retroaktif <= 7 hari', () => {
    const today = '2024-10-24';

    // Hari ini
    expect(isDateWithinRetroactiveLimit(today, today, 7)).toEqual({
      isValid: true,
      isFuture: false,
      isTooOld: false,
    });

    // 7 hari ke belakang (2024-10-17) masih diizinkan
    expect(isDateWithinRetroactiveLimit('2024-10-17', today, 7)).toEqual({
      isValid: true,
      isFuture: false,
      isTooOld: false,
    });

    // 8 hari ke belakang (2024-10-16) terkunci
    expect(isDateWithinRetroactiveLimit('2024-10-16', today, 7)).toEqual({
      isValid: false,
      isFuture: false,
      isTooOld: true,
    });

    // Masa depan (2024-10-25) tidak diizinkan
    expect(isDateWithinRetroactiveLimit('2024-10-25', today, 7)).toEqual({
      isValid: false,
      isFuture: true,
      isTooOld: false,
    });
  });

  it('isDateScheduled mematuhi startDate dan pola frekuensi kebiasaan', () => {
    const dailyHabit = {
      id: 'h1',
      frequency: 'daily',
      startDate: '2024-10-20',
    };

    // Sebelum startDate tidak terjadwal
    expect(isDateScheduled(dailyHabit, '2024-10-19')).toBe(false);
    // Mulai dari startDate terjadwal
    expect(isDateScheduled(dailyHabit, '2024-10-20')).toBe(true);
    expect(isDateScheduled(dailyHabit, '2024-10-24')).toBe(true);

    const selectedDaysHabit = {
      id: 'h2',
      frequency: 'selected_days',
      scheduledDays: [1, 3, 5], // Senin, Rabu, Jumat
      startDate: '2024-10-01',
    };

    // 2024-10-21 (Senin = 1) -> true
    expect(isDateScheduled(selectedDaysHabit, '2024-10-21')).toBe(true);
    // 2024-10-22 (Selasa = 2) -> false (hari tidak terjadwal)
    expect(isDateScheduled(selectedDaysHabit, '2024-10-22')).toBe(false);
    // 2024-10-23 (Rabu = 3) -> true
    expect(isDateScheduled(selectedDaysHabit, '2024-10-23')).toBe(true);
  });
});
