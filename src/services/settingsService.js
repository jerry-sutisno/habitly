import { db } from '../db/db';

const DEFAULT_SETTINGS = {
  key: 'general',
  displayName: 'Jerry Sutisno',
  theme: 'system',
  reflectionTime: '08:00 PM',
  remindersEnabled: true,
  membershipStatus: 'Active Member',
  lastBackupAt: null,
};

export const settingsService = {
  /**
   * Mengambil preferensi pengguna dari IndexedDB store 'settings'.
   * @param {string} [key='general']
   * @param {Dexie} [targetDb=db]
   * @returns {Promise<Object>}
   */
  async getSettings(key = 'general', targetDb = db) {
    const record = await targetDb.settings.get(key);
    // Fallback dari localStorage jika ada nama pengguna tersimpan
    const localSavedName = typeof localStorage !== 'undefined'
      ? localStorage.getItem('habitly-user-name')
      : null;

    if (!record) {
      return {
        ...DEFAULT_SETTINGS,
        displayName: localSavedName || DEFAULT_SETTINGS.displayName,
      };
    }

    return {
      ...DEFAULT_SETTINGS,
      ...record,
      displayName: record.displayName || localSavedName || DEFAULT_SETTINGS.displayName,
    };
  },

  /**
   * Memperbarui pengaturan pengguna.
   * @param {string} [key='general']
   * @param {Object} updates
   * @param {Dexie} [targetDb=db]
   * @returns {Promise<Object>}
   */
  async updateSettings(key = 'general', updates = {}, targetDb = db) {
    const existing = await this.getSettings(key, targetDb);
    const updated = {
      ...existing,
      ...updates,
      key,
      updatedAt: new Date().toISOString(),
    };

    await targetDb.settings.put(updated);

    // Sinkronisasi display name ke localStorage dan window event
    if (updates.displayName !== undefined) {
      const trimmedName = updates.displayName.trim() || 'Jerry Sutisno';
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('habitly-user-name', trimmedName);
      }
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(
          new CustomEvent('habitly-user-updated', { detail: { name: trimmedName } })
        );
      }
    }

    return updated;
  },

  /**
   * Menyimpan nama tampilan pengguna secara khusus.
   * @param {string} newName
   * @param {Dexie} [targetDb=db]
   * @returns {Promise<string>}
   */
  async saveDisplayName(newName, targetDb = db) {
    const trimmed = (newName || '').trim() || 'Jerry Sutisno';
    await this.updateSettings('general', { displayName: trimmed }, targetDb);
    return trimmed;
  },

  /**
   * Mendapatkan profil lengkap untuk layar Settings.
   * @param {Dexie} [targetDb=db]
   * @returns {Promise<Object>}
   */
  async getUserProfile(targetDb = db) {
    const settings = await this.getSettings('general', targetDb);
    const habitsCount = await targetDb.habits.count();
    const logsCount = await targetDb.habit_logs.count();

    // Estimasi ukuran storage sederhana
    const approxBytes = habitsCount * 400 + logsCount * 120 + 2000;
    const storageMb = (approxBytes / (1024 * 1024)).toFixed(1);

    // Format waktu backup terakhir
    let formattedBackup = 'Belum pernah';
    if (settings.lastBackupAt) {
      try {
        const dt = new Date(settings.lastBackupAt);
        formattedBackup = dt.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch (e) {
        formattedBackup = settings.lastBackupAt;
      }
    }

    return {
      displayName: settings.displayName,
      membershipStatus: settings.membershipStatus,
      avatarUrl: '',
      reflectionTime: settings.reflectionTime,
      remindersEnabled: settings.remindersEnabled,
      lastSynced: formattedBackup,
      lastBackupAt: settings.lastBackupAt,
      syncMode: 'Offline Lokal',
      storageUsed: `${Math.max(0.1, Number(storageMb))} MB`,
      storedHabitsCount: habitsCount,
      storageStatus: 'Healthy',
      appVersion: 'v2.4.0 (Calm Canvas)',
    };
  },
};
