import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { seedDefaultCategories, DEFAULT_CATEGORIES } from '../src/db/seed';
import { categoryService } from '../src/services/categoryService';
import { habitService } from '../src/services/habitService';
import { logService } from '../src/services/logService';
import { settingsService } from '../src/services/settingsService';
import { getTodayString, addDays } from '../src/utils/date';

describe('Data Layer & Dexie IndexedDB (SRS.md Schema & Transactions)', () => {
  let testDb;

  beforeEach(async () => {
    // Buat isolated database instance unik untuk tiap test
    const dbName = `test-db-${Math.random().toString(36).substring(2, 9)}`;
    testDb = new Dexie(dbName);
    testDb.version(1).stores({
      habits: 'id, categoryId, isArchived, createdAt',
      habit_logs: 'id, &[habitId+logDate], habitId, logDate',
      categories: 'id, name',
      settings: 'key',
    });
    await testDb.open();
  });

  it('berhasil melakukan seeding 5 kategori default sistem saat inisialisasi', async () => {
    const categories = await seedDefaultCategories(testDb);
    expect(categories.length).toBe(5);

    const names = categories.map((c) => c.name);
    for (const def of DEFAULT_CATEGORIES) {
      expect(names).toContain(def.name);
    }

    // Panggilan kedua tidak menduplikasi kategori
    const secondCall = await seedDefaultCategories(testDb);
    expect(secondCall.length).toBe(5);
  });

  describe('Category Service', () => {
    it('membuat kategori kustom dan menolak nama kosong / duplikat', async () => {
      await seedDefaultCategories(testDb);

      // Berhasil buat kategori baru
      const created = await categoryService.createCategory({ name: 'Mindfulness' }, testDb);
      expect(created.name).toBe('Mindfulness');
      expect(created.isDefault).toBe(false);

      // Tolak nama kosong
      await expect(categoryService.createCategory({ name: '   ' }, testDb)).rejects.toThrow(
        'Nama kategori tidak boleh kosong.'
      );

      // Tolak nama duplikat (case-insensitive)
      await expect(
        categoryService.createCategory({ name: 'mindfulness' }, testDb)
      ).rejects.toThrow('sudah ada');
    });

    it('menolak penghapusan kategori bawaan sistem (isDefault: true)', async () => {
      const seeded = await seedDefaultCategories(testDb);
      const defaultCat = seeded.find((c) => c.isDefault);

      await expect(categoryService.deleteCategory(defaultCat.id, testDb)).rejects.toThrow(
        'Kategori bawaan sistem tidak dapat dihapus.'
      );
    });

    it('transaksional: menolak penghapusan kategori yang sedang digunakan kebiasaan aktif', async () => {
      await seedDefaultCategories(testDb);
      const customCat = await categoryService.createCategory({ name: 'Creative Arts' }, testDb);

      // Buat habit yang mengacu pada customCat
      await habitService.createHabit(
        {
          name: 'Painting',
          categoryId: customCat.id,
          habitType: 'checkbox',
        },
        testDb
      );

      // Hapus kategori ditolak karena terikat dengan habit
      await expect(categoryService.deleteCategory(customCat.id, testDb)).rejects.toThrow(
        'sedang digunakan'
      );

      // Kategori tetap ada di database
      const checkCat = await testDb.categories.get(customCat.id);
      expect(checkCat).toBeDefined();
    });
  });

  describe('Habit Service', () => {
    it('membuat kebiasaan dengan validasi input sesuai SRS-FR-003', async () => {
      const seeded = await seedDefaultCategories(testDb);
      const categoryId = seeded[0].id;

      // Tolak nama kosong
      await expect(
        habitService.createHabit({ name: '', categoryId }, testDb)
      ).rejects.toThrow('Nama kebiasaan tidak boleh kosong.');

      // Tolak measurable tanpa targetValue valid
      await expect(
        habitService.createHabit(
          {
            name: 'Minum Air',
            categoryId,
            habitType: 'measurable',
            targetValue: 0,
            targetUnit: 'ml',
          },
          testDb
        )
      ).rejects.toThrow('lebih besar dari 0');

      // Tolak measurable tanpa targetUnit
      await expect(
        habitService.createHabit(
          {
            name: 'Minum Air',
            categoryId,
            habitType: 'measurable',
            targetValue: 2000,
            targetUnit: '   ',
          },
          testDb
        )
      ).rejects.toThrow('Satuan ukuran target (unit) wajib diisi.');

      // Tolak selected_days tanpa jadwal hari
      await expect(
        habitService.createHabit(
          {
            name: 'Gym',
            categoryId,
            frequency: 'selected_days',
            scheduledDays: [],
          },
          testDb
        )
      ).rejects.toThrow('Pilih minimal satu hari');

      // Berhasil membuat kebiasaan checkbox valid
      const habit = await habitService.createHabit(
        {
          name: 'Morning Meditation',
          categoryId,
          habitType: 'checkbox',
          frequency: 'daily',
        },
        testDb
      );

      expect(habit.id).toBeDefined();
      expect(habit.name).toBe('Morning Meditation');
      expect(habit.isArchived).toBe(false);
      expect(habit.startDate).toBe(getTodayString());
    });

    it('transaksi atomik hapus habit: menghapus habit BESERTA SELURUH log terkait (AGENTS.md 2.4)', async () => {
      const seeded = await seedDefaultCategories(testDb);
      const habit = await habitService.createHabit(
        {
          name: 'Daily Reading',
          categoryId: seeded[0].id,
          habitType: 'checkbox',
        },
        testDb
      );

      const today = getTodayString();
      const yesterday = addDays(today, -1);

      // Tambahkan beberapa log untuk habit ini
      await logService.toggleCheckboxHabit(habit.id, today, today, testDb);
      await logService.toggleCheckboxHabit(habit.id, yesterday, today, testDb);

      // Pastikan log tersimpan
      const logsBefore = await testDb.habit_logs.where('habitId').equals(habit.id).toArray();
      expect(logsBefore.length).toBe(2);

      // Hapus habit
      const result = await habitService.deleteHabit(habit.id, testDb);
      expect(result).toBe(true);

      // Verifikasi habit terhapus
      const habitAfter = await testDb.habits.get(habit.id);
      expect(habitAfter).toBeUndefined();

      // Verifikasi seluruh logs habit tersebut terhapus bersih secara atomik
      const logsAfter = await testDb.habit_logs.where('habitId').equals(habit.id).toArray();
      expect(logsAfter.length).toBe(0);
    });

    it('arsip dan pulihkan kebiasaan (SRS-FR-004)', async () => {
      const seeded = await seedDefaultCategories(testDb);
      const habit = await habitService.createHabit(
        {
          name: 'Journaling',
          categoryId: seeded[0].id,
        },
        testDb
      );

      // Arsipkan
      const archived = await habitService.archiveHabit(habit.id, testDb);
      expect(archived.isArchived).toBe(true);
      expect(archived.archivedAt).toBeTruthy();

      // getAllHabits tanpa includeArchived tidak menyertakannya
      const activeList = await habitService.getAllHabits({ includeArchived: false }, testDb);
      expect(activeList.find((h) => h.id === habit.id)).toBeUndefined();

      // Pulihkan
      const unarchived = await habitService.unarchiveHabit(habit.id, testDb);
      expect(unarchived.isArchived).toBe(false);
      expect(unarchived.archivedAt).toBeNull();
    });
  });

  describe('Log Service', () => {
    it('menegakkan batas retroaktif: menolak pencatatan > 7 hari lampau dan masa depan (SRS-FR-002)', async () => {
      const seeded = await seedDefaultCategories(testDb);
      const habit = await habitService.createHabit(
        {
          name: 'Jogging',
          categoryId: seeded[0].id,
        },
        testDb
      );

      const today = '2024-10-24';
      const futureDate = '2024-10-25';
      const tooOldDate = '2024-10-16'; // 8 hari ke belakang dari 24

      // Tolak tanggal masa depan
      await expect(
        logService.toggleCheckboxHabit(habit.id, futureDate, today, testDb)
      ).rejects.toThrow('Tanggal masa depan belum dapat dicatat.');

      // Tolak tanggal > 7 hari lalu
      await expect(
        logService.toggleCheckboxHabit(habit.id, tooOldDate, today, testDb)
      ).rejects.toThrow('Riwayat lebih dari 7 hari lalu terkunci');

      // Izinkan tepat 7 hari lalu (2024-10-17)
      const validPast = '2024-10-17';
      const logResult = await logService.toggleCheckboxHabit(habit.id, validPast, today, testDb);
      expect(logResult.action).toBe('completed');
    });

    it('toggle centang: mencatat completed, dan toggle kedua menghapus baris log dari database (SRS-FR-006)', async () => {
      const seeded = await seedDefaultCategories(testDb);
      const habit = await habitService.createHabit(
        {
          name: 'Hydration',
          categoryId: seeded[0].id,
        },
        testDb
      );

      const today = getTodayString();

      // 1. Centang pertama -> completed
      const check1 = await logService.toggleCheckboxHabit(habit.id, today, today, testDb);
      expect(check1.action).toBe('completed');
      expect(check1.log.status).toBe('completed');

      const logs1 = await testDb.habit_logs.where('habitId').equals(habit.id).toArray();
      expect(logs1.length).toBe(1);

      // 2. Centang kedua (pembatalan) -> baris log DIHAPUS dari database
      const check2 = await logService.toggleCheckboxHabit(habit.id, today, today, testDb);
      expect(check2.action).toBe('deleted');
      expect(check2.log).toBeNull();

      const logs2 = await testDb.habit_logs.where('habitId').equals(habit.id).toArray();
      expect(logs2.length).toBe(0);
    });

    it('mencatat kebiasaan measurable: target tercapai -> completed, nilai 0 -> log dihapus (SRS-FR-007)', async () => {
      const seeded = await seedDefaultCategories(testDb);
      const habit = await habitService.createHabit(
        {
          name: 'Minum Air',
          categoryId: seeded[0].id,
          habitType: 'measurable',
          targetValue: 2000,
          targetUnit: 'ml',
        },
        testDb
      );

      const today = getTodayString();

      // Nilai di bawah target -> status pending
      const log1 = await logService.logMeasurableHabit(habit.id, 1000, today, today, testDb);
      expect(log1.log.status).toBe('pending');
      expect(log1.log.value).toBe(1000);

      // Nilai mencapai target -> status completed
      const log2 = await logService.logMeasurableHabit(habit.id, 2000, today, today, testDb);
      expect(log2.log.status).toBe('completed');
      expect(log2.log.value).toBe(2000);

      // Nilai diubah ke 0 -> log dihapus
      const log3 = await logService.logMeasurableHabit(habit.id, 0, today, today, testDb);
      expect(log3.action).toBe('deleted');

      const logsAfter = await testDb.habit_logs.where('habitId').equals(habit.id).toArray();
      expect(logsAfter.length).toBe(0);
    });

    it('skip habit menyimpan record berstatus skipped (SRS-FR-008)', async () => {
      const seeded = await seedDefaultCategories(testDb);
      const habit = await habitService.createHabit(
        {
          name: 'Stretching',
          categoryId: seeded[0].id,
        },
        testDb
      );

      const today = getTodayString();
      const skipped = await logService.skipHabit(habit.id, today, 'Sedang istirahat', today, testDb);
      expect(skipped.status).toBe('skipped');
      expect(skipped.notes).toBe('Sedang istirahat');

      const logs = await testDb.habit_logs.where('habitId').equals(habit.id).toArray();
      expect(logs.length).toBe(1);
      expect(logs[0].status).toBe('skipped');
    });
  });

  describe('Settings Service', () => {
    it('mengambil dan memperbarui preferensi pengguna di IndexedDB', async () => {
      const settings = await settingsService.getSettings('general', testDb);
      expect(settings.displayName).toBe('Jerry Sutisno');

      // Update pengaturan
      await settingsService.updateSettings(
        'general',
        { displayName: 'Jerry S.', theme: 'dark' },
        testDb
      );

      const updated = await settingsService.getSettings('general', testDb);
      expect(updated.displayName).toBe('Jerry S.');
      expect(updated.theme).toBe('dark');
    });
  });
});
