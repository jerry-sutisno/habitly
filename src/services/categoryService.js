import { db } from '../db/db';
import { seedDefaultCategories } from '../db/seed';

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'cat-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now();
}

export const categoryService = {
  /**
   * Mengambil semua kategori. Otomatis men-seed kategori bawaan jika masih kosong.
   * @param {Dexie} [targetDb=db]
   * @returns {Promise<Array<Object>>}
   */
  async getAllCategories(targetDb = db) {
    await seedDefaultCategories(targetDb);
    return targetDb.categories.toArray();
  },

  /**
   * Mengambil satu kategori berdasarkan ID.
   * @param {string} id
   * @param {Dexie} [targetDb=db]
   * @returns {Promise<Object|null>}
   */
  async getCategoryById(id, targetDb = db) {
    if (!id) return null;
    const cat = await targetDb.categories.get(id);
    return cat || null;
  },

  /**
   * Membuat kategori baru dengan validasi nama unik dan tidak kosong.
   * @param {{ name: string, color?: string, icon?: string }} data
   * @param {Dexie} [targetDb=db]
   * @returns {Promise<Object>}
   */
  async createCategory({ name, color = '#23845d', icon = 'Tag' }, targetDb = db) {
    const trimmed = (name || '').trim();
    if (!trimmed) {
      throw new Error('Nama kategori tidak boleh kosong.');
    }
    if (trimmed.length > 50) {
      throw new Error('Nama kategori maksimal 50 karakter.');
    }

    // Cek duplikasi (case-insensitive)
    const existing = await targetDb.categories
      .filter((c) => c.name.toLowerCase() === trimmed.toLowerCase())
      .first();

    if (existing) {
      throw new Error(`Kategori dengan nama "${trimmed}" sudah ada.`);
    }

    const newCategory = {
      id: generateId(),
      name: trimmed,
      color,
      icon,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };

    await targetDb.categories.add(newCategory);
    return newCategory;
  },

  /**
   * Memperbarui kategori.
   * @param {string} id
   * @param {{ name?: string, color?: string, icon?: string }} updates
   * @param {Dexie} [targetDb=db]
   * @returns {Promise<Object>}
   */
  async updateCategory(id, updates, targetDb = db) {
    const category = await targetDb.categories.get(id);
    if (!category) {
      throw new Error('Kategori tidak ditemukan.');
    }

    const patch = {};
    if (updates.name !== undefined) {
      const trimmed = updates.name.trim();
      if (!trimmed) throw new Error('Nama kategori tidak boleh kosong.');
      if (trimmed.length > 50) throw new Error('Nama kategori maksimal 50 karakter.');

      // Cek duplikasi nama jika nama berubah
      if (trimmed.toLowerCase() !== category.name.toLowerCase()) {
        const existing = await targetDb.categories
          .filter((c) => c.name.toLowerCase() === trimmed.toLowerCase())
          .first();
        if (existing) {
          throw new Error(`Kategori dengan nama "${trimmed}" sudah ada.`);
        }
      }
      patch.name = trimmed;
    }

    if (updates.color !== undefined) patch.color = updates.color;
    if (updates.icon !== undefined) patch.icon = updates.icon;

    await targetDb.categories.update(id, patch);
    return { ...category, ...patch };
  },

  /**
   * Menghapus kategori secara aman dalam transaksi.
   * Kategori bawaan sistem dilarang dihapus.
   * Kategori yang sedang digunakan oleh kebiasaan dilarang dihapus.
   * @param {string} id
   * @param {Dexie} [targetDb=db]
   * @returns {Promise<boolean>}
   */
  async deleteCategory(id, targetDb = db) {
    return targetDb.transaction('rw', targetDb.categories, targetDb.habits, async () => {
      const category = await targetDb.categories.get(id);
      if (!category) {
        throw new Error('Kategori tidak ditemukan.');
      }

      if (category.isDefault) {
        throw new Error('Kategori bawaan sistem tidak dapat dihapus.');
      }

      // Periksa apakah ada habit yang menggunakan kategori ini
      const attachedHabitsCount = await targetDb.habits
        .where('categoryId')
        .equals(id)
        .count();

      if (attachedHabitsCount > 0) {
        throw new Error(
          `Kategori "${category.name}" sedang digunakan oleh ${attachedHabitsCount} kebiasaan dan tidak dapat dihapus.`
        );
      }

      await targetDb.categories.delete(id);
      return true;
    });
  },
};
