import { db } from '../db/db';
import { validateBackupPayload, CURRENT_SCHEMA_VERSION } from '../utils/validation';
import { getTodayString } from '../utils/date';
import { settingsService } from './settingsService';

export const backupService = {
  /**
   * Membentuk struktur payload JSON cadangan dari database lokal.
   * Sesuai SRS-FR-015.
   * @param {Dexie} [targetDb=db]
   * @returns {Promise<Object>}
   */
  async createExportPayload(targetDb = db) {
    const categories = await targetDb.categories.toArray();
    const habits = await targetDb.habits.toArray();
    const habitLogs = await targetDb.habit_logs.toArray();
    const settings = await targetDb.settings.toArray();

    return {
      app: 'habitly',
      schemaVersion: CURRENT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      data: {
        categories,
        habits,
        habit_logs: habitLogs,
        settings,
      },
    };
  },

  /**
   * Melakukan ekspor data ke file JSON.
   * Mendukung Android Web Share API jika didukung, dengan fallback download otomatis.
   * Memperbarui timestamp lastBackupAt di store settings.
   * Sesuai SRS-FR-015 & Section 3.
   *
   * @param {Object} [options]
   * @param {Dexie} [options.targetDb=db]
   * @param {boolean} [options.shareIfSupported=true]
   * @returns {Promise<{ success: boolean, filename: string, payload: Object, method: string }>}
   */
  async exportBackup({ targetDb = db, shareIfSupported = true } = {}) {
    const payload = await this.createExportPayload(targetDb);
    const jsonString = JSON.stringify(payload, null, 2);

    // Perbarui metadata waktu backup terakhir di settings
    await settingsService.updateSettings('general', { lastBackupAt: payload.exportedAt }, targetDb);

    const todayStr = getTodayString();
    const filename = `habitly-backup-${todayStr}.json`;

    let method = 'download';

    // Periksa dukungan Web Share API (misal di Android Chrome / PWA)
    if (
      shareIfSupported &&
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function' &&
      typeof File !== 'undefined'
    ) {
      try {
        const file = new File([jsonString], filename, { type: 'application/json' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Habitly Backup',
            text: `Cadangan data Habitly (${todayStr})`,
            files: [file],
          });
          method = 'share';
          return { success: true, filename, payload, method };
        }
      } catch (err) {
        // Jika pengguna membatalkan dialog share, jangan download paksa
        if (err.name === 'AbortError') {
          return { success: true, filename, payload, method: 'cancelled' };
        }
        // Jika error lain pada share API, fallback ke unduh manual di bawah
        console.warn('Web Share API gagal, beralih ke unduh berkas:', err);
      }
    }

    // Fallback: File download otomatis via Blob
    if (typeof document !== 'undefined' && typeof URL !== 'undefined') {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      method = 'download';
    }

    return {
      success: true,
      filename,
      payload,
      method,
    };
  },

  /**
   * Membaca dan memvalidasi berkas cadangan dari File, Blob, string, atau Objek.
   * Mengembalikan ringkasan isi berkas untuk ditampilkan pada pratinjau konfirmasi restore.
   * Sesuai SRS-FR-016.
   *
   * @param {File|Blob|string|Object} fileOrData
   * @param {Dexie} [targetDb=db]
   * @returns {Promise<{ isValid: boolean, payload: Object, summary: Object }>}
   */
  async parseAndValidateBackupFile(fileOrData, targetDb = db) {
    let rawContent = fileOrData;

    // Jika input berupa File / Blob (dari <input type="file" />)
    if (fileOrData && typeof fileOrData === 'object' && typeof fileOrData.text === 'function') {
      rawContent = await fileOrData.text();
    } else if (fileOrData && typeof fileOrData === 'object' && typeof FileReader !== 'undefined' && fileOrData instanceof Blob) {
      rawContent = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Gagal membaca berkas.'));
        reader.readAsText(fileOrData);
      });
    }

    // Ambil daftar habit ID yang sudah ada di DB untuk mengakomodasi validasi mode merge
    const existingHabits = await targetDb.habits.toArray();
    const knownHabitIds = new Set(existingHabits.map((h) => h.id));

    return validateBackupPayload(rawContent, {
      allowExternalHabitIds: true,
      knownHabitIds,
    });
  },

  /**
   * Melakukan pemulihan (restore) data cadangan ke database IndexedDB.
   * Dijalankan dalam SATU transaksi Dexie ACID (NFR-REL-001, NFR-REL-002).
   *
   * Mode:
   * - 'replace' (SRS-FR-017): Mengosongkan semua 4 tabel lalu mengisinya dengan data backup.
   * - 'merge' (SRS-FR-018): Last-Write-Wins berdasarkan updatedAt untuk ID yang sama, sisipkan ID baru.
   *
   * @param {Object|string} payloadInput
   * @param {'replace'|'merge'} [mode='replace']
   * @param {Dexie} [targetDb=db]
   * @returns {Promise<{ success: boolean, mode: string, summary: Object }>}
   */
  async restoreBackup(payloadInput, mode = 'replace', targetDb = db) {
    // 1. Validasi awal sebelum memulai transaksi
    let payload = payloadInput;
    if (typeof payload === 'string') {
      payload = JSON.parse(payload);
    }

    // Ambil ID habit yang ada jika mode merge
    const existingHabitsBefore = await targetDb.habits.toArray();
    const knownHabitIds = new Set(existingHabitsBefore.map((h) => h.id));

    const { summary } = validateBackupPayload(payload, {
      allowExternalHabitIds: mode === 'merge',
      knownHabitIds,
    });

    const data = payload.data || {};
    const categories = data.categories || [];
    const habits = data.habits || [];
    const habitLogs = data.habit_logs || [];
    const settings = data.settings || [];

    // 2. Eksekusi transaksi atomik Dexie
    await targetDb.transaction(
      'rw',
      [targetDb.habits, targetDb.habit_logs, targetDb.categories, targetDb.settings],
      async () => {
        if (mode === 'replace') {
          // Kosongkan seluruh store
          await targetDb.habits.clear();
          await targetDb.habit_logs.clear();
          await targetDb.categories.clear();
          await targetDb.settings.clear();

          // Isi ulang dengan data cadangan
          if (categories.length > 0) {
            await targetDb.categories.bulkAdd(categories);
          }
          if (habits.length > 0) {
            await targetDb.habits.bulkAdd(habits);
          }
          if (habitLogs.length > 0) {
            await targetDb.habit_logs.bulkAdd(habitLogs);
          }
          if (settings.length > 0) {
            await targetDb.settings.bulkAdd(settings);
          }
        } else if (mode === 'merge') {
          // Gabung dengan aturan Last-Write-Wins
          const mergeItems = async (table, items, primaryKey = 'id') => {
            for (const item of items) {
              const keyVal = item[primaryKey];
              const existing = await table.get(keyVal);

              if (!existing) {
                // ID baru, sisipkan
                await table.put(item);
              } else {
                // Bandingkan updatedAt (atau createdAt jika tidak ada)
                const existingTime = new Date(
                  existing.updatedAt || existing.createdAt || 0
                ).getTime();
                const incomingTime = new Date(
                  item.updatedAt || item.createdAt || 0
                ).getTime();

                if (incomingTime >= existingTime) {
                  await table.put(item);
                }
              }
            }
          };

          await mergeItems(targetDb.categories, categories, 'id');
          await mergeItems(targetDb.habits, habits, 'id');
          await mergeItems(targetDb.habit_logs, habitLogs, 'id');
          await mergeItems(targetDb.settings, settings, 'key');
        } else {
          throw new Error(`Mode restore '${mode}' tidak dikenal. Pilih 'replace' atau 'merge'.`);
        }
      }
    );

    // Dispatch event agar UI di tab/komponen yang sedang aktif dapat memuat ulang
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('habitly-data-restored', { detail: { mode, summary } }));
    }

    return {
      success: true,
      mode,
      summary,
    };
  },

  /**
   * Menentukan apakah Banner Pengingat Backup perlu ditampilkan di Dashboard.
   * Banner muncul jika:
   * - Pengguna sudah memiliki setidaknya 1 kebiasaan aktif, DAN
   * - Belum pernah melakukan backup (lastBackupAt null/undefined), ATAU
   * - Backup terakhir sudah lebih dari `daysThreshold` hari lalu (default: 7 hari).
   *
   * @param {Dexie} [targetDb=db]
   * @param {number} [daysThreshold=7]
   * @returns {Promise<boolean>}
   */
  async shouldShowBackupReminder(targetDb = db, daysThreshold = 7) {
    const habitsCount = await targetDb.habits.count();
    if (habitsCount === 0) {
      return false;
    }

    const settings = await settingsService.getSettings('general', targetDb);
    if (!settings.lastBackupAt) {
      return true;
    }

    const lastBackupTime = new Date(settings.lastBackupAt).getTime();
    if (Number.isNaN(lastBackupTime)) {
      return true;
    }

    const now = Date.now();
    const diffDays = (now - lastBackupTime) / (1000 * 60 * 60 * 24);
    return diffDays >= daysThreshold;
  },
};
