import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { backupService } from '../src/services/backupService';
import { validateBackupPayload } from '../src/utils/validation';
import { seedDefaultCategories } from '../src/db/seed';
import { habitService } from '../src/services/habitService';
import { logService } from '../src/services/logService';
import { settingsService } from '../src/services/settingsService';
import { getTodayString } from '../src/utils/date';

describe('Backup & Restore Feature (SRS-FR-015, SRS-FR-016, SRS-FR-017, SRS-FR-018 & NFR-REL)', () => {
  let testDb;

  beforeEach(async () => {
    const dbName = `test-backup-${Math.random().toString(36).substring(2, 9)}`;
    testDb = new Dexie(dbName);
    testDb.version(1).stores({
      habits: 'id, categoryId, isArchived, createdAt',
      habit_logs: 'id, &[habitId+logDate], habitId, logDate',
      categories: 'id, name',
      settings: 'key',
    });
    await testDb.open();
  });

  describe('Validation Pipeline (SRS-FR-016)', () => {
    it('menolak JSON string yang rusak secara sintaksis', () => {
      const brokenJson = '{ app: "habitly", invalid_json: ';
      expect(() => validateBackupPayload(brokenJson)).toThrow('JSON rusak');
    });

    it('menolak berkas dengan identifier app yang bukan habitly', () => {
      const invalidAppPayload = {
        app: 'another-tracker',
        schemaVersion: 1,
        data: { categories: [], habits: [], habit_logs: [], settings: [] },
      };
      expect(() => validateBackupPayload(invalidAppPayload)).toThrow(
        "Bukan berkas cadangan Habitly yang sah (pengidentifikasi app 'another-tracker' tidak cocok)"
      );
    });

    it('menolak schemaVersion yang tidak didukung atau usang', () => {
      const unsupportedVersionPayload = {
        app: 'habitly',
        schemaVersion: 999,
        data: { categories: [], habits: [], habit_logs: [], settings: [] },
      };
      expect(() => validateBackupPayload(unsupportedVersionPayload)).toThrow(
        'Versi skema cadangan (999) tidak didukung'
      );
    });

    it('menolak format logDate yang tidak sesuai dengan regex YYYY-MM-DD', () => {
      const invalidDatePayload = {
        app: 'habitly',
        schemaVersion: 1,
        data: {
          categories: [],
          habits: [{ id: 'h1', name: 'Meditasi' }],
          habit_logs: [{ id: 'l1', habitId: 'h1', logDate: '12/11/2026', status: 'completed' }],
          settings: [],
        },
      };
      expect(() => validateBackupPayload(invalidDatePayload)).toThrow(
        'Wajib berformat YYYY-MM-DD'
      );
    });

    it('menolak integritas foreign key rusak jika habit_log mereferensikan habitId tak dikenal', () => {
      const orphanLogPayload = {
        app: 'habitly',
        schemaVersion: 1,
        data: {
          categories: [],
          habits: [{ id: 'h1', name: 'Meditasi' }],
          habit_logs: [{ id: 'l1', habitId: 'non-existent-habit', logDate: '2026-11-12', status: 'completed' }],
          settings: [],
        },
      };
      expect(() => validateBackupPayload(orphanLogPayload)).toThrow(
        "Integritas data rusak: log 'l1' mereferensikan habitId 'non-existent-habit'"
      );
    });
  });

  describe('Round-Trip Backup & Restore (SRS-FR-015, SRS-FR-017 & SRS-FR-002)', () => {
    it('round-trip: export data -> bersihkan database -> restore -> data 100% identik', async () => {
      // 1. Siapkan data awal lengkap di testDb
      const seededCategories = await seedDefaultCategories(testDb);
      const catId = seededCategories[0].id;

      const habit1 = await habitService.createHabit(
        {
          name: 'Morning Meditation',
          categoryId: catId,
          habitType: 'checkbox',
          frequency: 'daily',
        },
        testDb
      );

      const habit2 = await habitService.createHabit(
        {
          name: 'Drink Water',
          categoryId: catId,
          habitType: 'measurable',
          targetValue: 2000,
          targetUnit: 'ml',
        },
        testDb
      );

      const today = getTodayString();
      await logService.toggleCheckboxHabit(habit1.id, today, today, testDb);
      await logService.logMeasurableHabit(habit2.id, 1500, today, today, testDb);
      await settingsService.updateSettings('general', { displayName: 'Jerry Sutisno', theme: 'dark' }, testDb);

      // Ambil snapshot kondisi sebelum diekspor
      const initialHabits = await testDb.habits.toArray();
      const initialLogs = await testDb.habit_logs.toArray();
      const initialCategories = await testDb.categories.toArray();
      const initialSettings = await testDb.settings.toArray();

      expect(initialHabits.length).toBe(2);
      expect(initialLogs.length).toBe(2);
      expect(initialCategories.length).toBe(5);

      // 2. Ekspor ke payload
      const exportResult = await backupService.exportBackup({
        targetDb: testDb,
        shareIfSupported: false,
      });

      expect(exportResult.success).toBe(true);
      expect(exportResult.payload.app).toBe('habitly');
      expect(exportResult.payload.schemaVersion).toBe(1);
      expect(exportResult.payload.data.habits.length).toBe(2);
      expect(exportResult.payload.data.habit_logs.length).toBe(2);

      // Pastikan lastBackupAt tercatat di settings
      const settingsAfterExport = await testDb.settings.get('general');
      expect(settingsAfterExport.lastBackupAt).toBeDefined();

      // 3. Bersihkan seluruh data (wipe out completely)
      await testDb.habits.clear();
      await testDb.habit_logs.clear();
      await testDb.categories.clear();
      await testDb.settings.clear();

      expect(await testDb.habits.count()).toBe(0);
      expect(await testDb.habit_logs.count()).toBe(0);
      expect(await testDb.categories.count()).toBe(0);
      expect(await testDb.settings.count()).toBe(0);

      // 4. Restore berkas dengan mode 'replace'
      const restoreResult = await backupService.restoreBackup(
        exportResult.payload,
        'replace',
        testDb
      );

      expect(restoreResult.success).toBe(true);
      expect(restoreResult.summary.habitsCount).toBe(2);
      expect(restoreResult.summary.logsCount).toBe(2);

      // 5. Verifikasi bahwa data setelah restore 100% sama dengan initial
      const restoredHabits = await testDb.habits.toArray();
      const restoredLogs = await testDb.habit_logs.toArray();
      const restoredCategories = await testDb.categories.toArray();
      const restoredSettings = await testDb.settings.toArray();

      expect(restoredHabits).toEqual(initialHabits);
      expect(restoredLogs).toEqual(initialLogs);
      expect(restoredCategories).toEqual(initialCategories);
      expect(restoredSettings).toEqual(initialSettings);
    });

    it('transaksional & ACID rollback (NFR-REL-002): berkas rusak ditolak tanpa mengubah 1 row pun di database', async () => {
      // 1. Isi database dengan data valid
      const seeded = await seedDefaultCategories(testDb);
      const habit = await habitService.createHabit(
        { name: 'Belajar Coding', categoryId: seeded[0].id },
        testDb
      );

      const habitCountBefore = await testDb.habits.count();
      const catCountBefore = await testDb.categories.count();
      expect(habitCountBefore).toBe(1);

      // 2. Coba restore berkas rusak (log dengan foreign key salah)
      const corruptedPayload = {
        app: 'habitly',
        schemaVersion: 1,
        exportedAt: new Date().toISOString(),
        data: {
          categories: [{ id: 'new-cat', name: 'Baru', isDefault: false }],
          habits: [{ id: 'new-h', name: 'Baru', categoryId: 'new-cat' }],
          habit_logs: [
            {
              id: 'log-bad',
              habitId: 'non-existent-habit-id-xxx',
              logDate: '2026-11-12',
              status: 'completed',
            },
          ],
          settings: [],
        },
      };

      await expect(
        backupService.restoreBackup(corruptedPayload, 'replace', testDb)
      ).rejects.toThrow('Integritas data rusak');

      // 3. Pastikan database TIDAK tersentuh sama sekali (data lama masih utuh, data baru tidak masuk)
      expect(await testDb.habits.count()).toBe(habitCountBefore);
      expect(await testDb.categories.count()).toBe(catCountBefore);

      const existingHabit = await testDb.habits.get(habit.id);
      expect(existingHabit).toBeDefined();
      expect(existingHabit.name).toBe('Belajar Coding');

      const badCat = await testDb.categories.get('new-cat');
      expect(badCat).toBeUndefined();
    });
  });

  describe('Restore Mode Merge (SRS-FR-018 - Last-Write-Wins)', () => {
    it('mempertahankan entitas dengan updatedAt paling baru dan menambahkan entitas baru', async () => {
      const seeded = await seedDefaultCategories(testDb);
      const catId = seeded[0].id;

      // Habit 1: versi lokal diubah lebih baru
      const habit1 = await habitService.createHabit(
        { id: 'h-1', name: 'Baca Buku Versi Lokal', categoryId: catId },
        testDb
      );
      await testDb.habits.update('h-1', {
        name: 'Baca Buku Versi Lokal Update',
        updatedAt: '2026-11-12T10:00:00.000Z',
      });

      // Habit 2: versi lokal lebih lama
      const habit2 = await habitService.createHabit(
        { id: 'h-2', name: 'Yoga Versi Lama', categoryId: catId },
        testDb
      );
      await testDb.habits.update('h-2', {
        name: 'Yoga Versi Lama',
        updatedAt: '2026-11-10T08:00:00.000Z',
      });

      // Payload cadangan yang akan digabung:
      // - h-1 di payload memiliki updatedAt lebih usang (2026-11-11) -> versi lokal HARUS menang
      // - h-2 di payload memiliki updatedAt lebih baru (2026-11-12T15:00:00) -> versi payload HARUS menang
      // - h-3 baru ada di payload -> HARUS disisipkan
      const mergePayload = {
        app: 'habitly',
        schemaVersion: 1,
        exportedAt: '2026-11-12T16:00:00.000Z',
        data: {
          categories: [],
          habits: [
            {
              id: 'h-1',
              name: 'Baca Buku Versi Backup Lawas',
              categoryId: catId,
              updatedAt: '2026-11-11T09:00:00.000Z',
            },
            {
              id: 'h-2',
              name: 'Yoga Versi Backup Terbaru',
              categoryId: catId,
              updatedAt: '2026-11-12T15:00:00.000Z',
            },
            {
              id: 'h-3',
              name: 'Jalan Santai Baru',
              categoryId: catId,
              updatedAt: '2026-11-12T12:00:00.000Z',
            },
          ],
          habit_logs: [],
          settings: [],
        },
      };

      await backupService.restoreBackup(mergePayload, 'merge', testDb);

      // Verifikasi h-1: versi lokal tetap dipertahankan
      const checkH1 = await testDb.habits.get('h-1');
      expect(checkH1.name).toBe('Baca Buku Versi Lokal Update');

      // Verifikasi h-2: versi backup yang lebih baru meng-overwrite lokal
      const checkH2 = await testDb.habits.get('h-2');
      expect(checkH2.name).toBe('Yoga Versi Backup Terbaru');

      // Verifikasi h-3: entitas baru berhasil disisipkan
      const checkH3 = await testDb.habits.get('h-3');
      expect(checkH3.name).toBe('Jalan Santai Baru');
    });
  });

  describe('Backup Reminder Logic (shouldShowBackupReminder)', () => {
    it('mengembalikan false jika pengguna belum memiliki kebiasaan aktif', async () => {
      const show = await backupService.shouldShowBackupReminder(testDb);
      expect(show).toBe(false);
    });

    it('mengembalikan true jika ada kebiasaan tapi belum pernah backup (lastBackupAt kosong)', async () => {
      const seeded = await seedDefaultCategories(testDb);
      await habitService.createHabit({ name: 'Meditasi', categoryId: seeded[0].id }, testDb);

      const show = await backupService.shouldShowBackupReminder(testDb);
      expect(show).toBe(true);
    });

    it('mengembalikan false jika backup baru dilakukan baru-baru ini (< 7 hari)', async () => {
      const seeded = await seedDefaultCategories(testDb);
      await habitService.createHabit({ name: 'Meditasi', categoryId: seeded[0].id }, testDb);

      // Simpan backup 2 hari lalu
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
      await settingsService.updateSettings('general', { lastBackupAt: twoDaysAgo }, testDb);

      const show = await backupService.shouldShowBackupReminder(testDb);
      expect(show).toBe(false);
    });

    it('mengembalikan true jika backup terakhir sudah lebih dari 7 hari lalu', async () => {
      const seeded = await seedDefaultCategories(testDb);
      await habitService.createHabit({ name: 'Meditasi', categoryId: seeded[0].id }, testDb);

      // Simpan backup 8 hari lalu
      const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
      await settingsService.updateSettings('general', { lastBackupAt: eightDaysAgo }, testDb);

      const show = await backupService.shouldShowBackupReminder(testDb);
      expect(show).toBe(true);
    });
  });
});
