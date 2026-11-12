/**
 * Service untuk Persistent Storage API & Storage Quota.
 * Memastikan data lokal IndexedDB Habitly tidak dihapus otomatis oleh peramban.
 */

export const storageService = {
  /**
   * Memeriksa apakah penyimpanan persisten sudah aktif di peramban ini.
   * @returns {Promise<boolean>}
   */
  async isPersisted() {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persisted) {
      try {
        return await navigator.storage.persisted();
      } catch (err) {
        console.warn('Gagal memeriksa status persistent storage:', err);
        return false;
      }
    }
    return false;
  },

  /**
   * Meminta izin penyimpanan persisten kepada peramban.
   * @returns {Promise<boolean>} Mengembalikan true jika izin diberikan atau sudah aktif.
   */
  async requestPersistence() {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
      try {
        const isGranted = await navigator.storage.persist();
        return isGranted;
      } catch (err) {
        console.warn('Gagal meminta persistent storage:', err);
        return false;
      }
    }
    return false;
  },

  /**
   * Mengambil estimasi kuota dan penggunaan penyimpanan dari peramban.
   * @returns {Promise<{ usageBytes: number, quotaBytes: number, usageMb: string, quotaMb: string, percentUsed: number }>}
   */
  async getStorageEstimate() {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        const usageBytes = estimate.usage || 0;
        const quotaBytes = estimate.quota || 0;

        const usageMb = (usageBytes / (1024 * 1024)).toFixed(1);
        const quotaMb = (quotaBytes / (1024 * 1024)).toFixed(0);
        const percentUsed = quotaBytes > 0 ? ((usageBytes / quotaBytes) * 100).toFixed(2) : 0;

        return {
          usageBytes,
          quotaBytes,
          usageMb: `${usageMb} MB`,
          quotaMb: `${quotaMb} MB`,
          percentUsed: Number(percentUsed),
        };
      } catch (err) {
        console.warn('Gagal mendapatkan estimasi kuota penyimpanan:', err);
      }
    }

    return {
      usageBytes: 0,
      quotaBytes: 0,
      usageMb: '< 1 MB',
      quotaMb: 'Tersedia',
      percentUsed: 0,
    };
  },
};
