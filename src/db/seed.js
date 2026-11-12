import { db } from './db';
import { getTodayString, addDays } from '../utils/date';

export const DEFAULT_CATEGORIES = [
  { name: 'Health', color: '#006a46', icon: 'Heart' },
  { name: 'Education', color: '#276a4f', icon: 'BookOpen' },
  { name: 'Productivity', color: '#23845d', icon: 'CheckSquare' },
  { name: 'Personal Development', color: '#3b644f', icon: 'Sparkles' },
  { name: 'Finance', color: '#537d66', icon: 'Wallet' },
];

function generateId(prefix = 'id') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}-${Date.now()}`;
}

/**
 * Memastikan kategori bawaan tersedia di database.
 * @param {Dexie} [targetDb=db]
 * @returns {Promise<Array<Object>>}
 */
export async function seedDefaultCategories(targetDb = db) {
  const count = await targetDb.categories.count();
  if (count === 0) {
    const now = new Date().toISOString();
    const categoriesToSeed = DEFAULT_CATEGORIES.map((item) => ({
      id: generateId('cat'),
      name: item.name,
      color: item.color,
      icon: item.icon,
      isDefault: true,
      createdAt: now,
    }));

    await targetDb.categories.bulkAdd(categoriesToSeed);
    return categoriesToSeed;
  }

  return targetDb.categories.toArray();
}

/**
 * Melakukan pengisian data contoh (demo habits & logs)
 * HANYA digunakan untuk mode development lokal atau testing ketika diminta pengguna.
 * @param {Dexie} [targetDb=db]
 * @returns {Promise<boolean>}
 */
export async function seedDemoData(targetDb = db) {
  const categories = await seedDefaultCategories(targetDb);
  const habitsCount = await targetDb.habits.count();

  if (habitsCount > 0) {
    return false; // Sudah ada data
  }

  const healthCat = categories.find((c) => c.name === 'Health') || categories[0];
  const eduCat = categories.find((c) => c.name === 'Education') || categories[1] || categories[0];
  const devCat = categories.find((c) => c.name === 'Personal Development') || categories[3] || categories[0];

  const today = getTodayString();
  const startDate = addDays(today, -20);
  const now = new Date().toISOString();

  const initialHabits = [
    {
      id: generateId('hab'),
      name: 'Morning Meditation',
      description: '10 menit meditasi mindfulness untuk memulai hari dengan tenang',
      categoryId: devCat.id,
      habitType: 'checkbox',
      targetValue: null,
      targetUnit: null,
      frequency: 'daily',
      scheduledDays: [1, 2, 3, 4, 5, 6, 7],
      color: '#006a46',
      icon: 'Sparkles',
      isArchived: false,
      archivedAt: null,
      startDate,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId('hab'),
      name: 'Drink 2L Water',
      description: 'Menjaga hidrasi tubuh dengan minum minimal 2000 ml air putih',
      categoryId: healthCat.id,
      habitType: 'measurable',
      targetValue: 2000,
      targetUnit: 'ml',
      frequency: 'daily',
      scheduledDays: [1, 2, 3, 4, 5, 6, 7],
      color: '#23845d',
      icon: 'Droplets',
      isArchived: false,
      archivedAt: null,
      startDate,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId('hab'),
      name: 'Read 20 Pages',
      description: 'Membaca buku pengembangan diri minimal 20 halaman',
      categoryId: eduCat.id,
      habitType: 'checkbox',
      targetValue: null,
      targetUnit: null,
      frequency: 'daily',
      scheduledDays: [1, 2, 3, 4, 5, 6, 7],
      color: '#276a4f',
      icon: 'BookOpen',
      isArchived: false,
      archivedAt: null,
      startDate,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId('hab'),
      name: '30 Min Nature Walk',
      description: 'Berjalan kaki santai di udara segar',
      categoryId: healthCat.id,
      habitType: 'checkbox',
      targetValue: null,
      targetUnit: null,
      frequency: 'daily',
      scheduledDays: [1, 2, 3, 4, 5, 6, 7],
      color: '#3b644f',
      icon: 'Footprints',
      isArchived: false,
      archivedAt: null,
      startDate,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId('hab'),
      name: 'Evening Reflection',
      description: 'Menulis jurnal 3 hal yang disyukuri hari ini',
      categoryId: devCat.id,
      habitType: 'checkbox',
      targetValue: null,
      targetUnit: null,
      frequency: 'daily',
      scheduledDays: [1, 2, 3, 4, 5, 6, 7],
      color: '#537d66',
      icon: 'Moon',
      isArchived: false,
      archivedAt: null,
      startDate,
      createdAt: now,
      updatedAt: now,
    },
  ];

  await targetDb.habits.bulkAdd(initialHabits);

  // Tambahkan log historis untuk beberapa hari terakhir agar visualisasi kalender dan grafik langsung bermakna
  const initialLogs = [];
  for (let offset = -7; offset <= 0; offset++) {
    const logDate = addDays(today, offset);

    // Untuk hari ini (offset 0), tandai 3 kebiasaan pertama selesai
    if (offset === 0) {
      initialLogs.push(
        { id: generateId('log'), habitId: initialHabits[0].id, logDate, status: 'completed', value: null, notes: '', createdAt: now, updatedAt: now },
        { id: generateId('log'), habitId: initialHabits[1].id, logDate, status: 'completed', value: 2000, notes: '', createdAt: now, updatedAt: now },
        { id: generateId('log'), habitId: initialHabits[2].id, logDate, status: 'completed', value: null, notes: '', createdAt: now, updatedAt: now }
      );
    } else if (offset === -4) {
      // Hari -4 istirahat / skipped satu
      initialLogs.push(
        { id: generateId('log'), habitId: initialHabits[0].id, logDate, status: 'completed', value: null, notes: '', createdAt: now, updatedAt: now },
        { id: generateId('log'), habitId: initialHabits[1].id, logDate, status: 'completed', value: 2000, notes: '', createdAt: now, updatedAt: now },
        { id: generateId('log'), habitId: initialHabits[2].id, logDate, status: 'skipped', value: null, notes: 'Perjalanan dinas', createdAt: now, updatedAt: now },
        { id: generateId('log'), habitId: initialHabits[3].id, logDate, status: 'completed', value: null, notes: '', createdAt: now, updatedAt: now }
      );
    } else {
      // Hari lainnya selesai semua
      for (const h of initialHabits) {
        initialLogs.push({
          id: generateId('log'),
          habitId: h.id,
          logDate,
          status: 'completed',
          value: h.habitType === 'measurable' ? 2000 : null,
          notes: '',
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  }

  await targetDb.habit_logs.bulkAdd(initialLogs);
  return true;
}

export const seedInitialData = seedDemoData;

