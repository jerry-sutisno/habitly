/**
 * Modul Validasi Integritas Data & Berkas Backup
 * Sesuai spesifikasi SRS-FR-016.
 */

export const CURRENT_SCHEMA_VERSION = 1;

/**
 * Validasi payload cadangan data Habitly.
 *
 * Aturan verifikasi SRS-FR-016:
 * 1. payload.app === 'habitly'
 * 2. payload.schemaVersion <= CURRENT_SCHEMA_VERSION (harus berupa bilangan positif)
 * 3. Tipe data dan relasi foreign key valid:
 *    - data.categories, data.habits, data.habit_logs, data.settings harus berupa Array.
 *    - Setiap habit_logs.habitId harus mereferensikan habits.id yang sah di dalam payload (atau di DB).
 * 4. Format logDate pada setiap habit_log wajib cocok dengan regex ^\d{4}-\d{2}-\d{2}$.
 *
 * @param {Object|string} inputPayload - Objek atau string JSON payload backup
 * @param {Object} [options]
 * @param {boolean} [options.allowExternalHabitIds=false] - Untuk mode merge jika habit sudah ada di DB
 * @param {Set<string>} [options.knownHabitIds=null]
 * @returns {{ isValid: boolean, payload: Object, summary: Object }}
 */
export function validateBackupPayload(inputPayload, options = {}) {
  const { allowExternalHabitIds = false, knownHabitIds = null } = options;

  let payload = inputPayload;

  // Jika input berupa JSON string, parse terlebih dahulu
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch (err) {
      throw new Error(`Format berkas tidak valid: JSON rusak (${err.message}).`);
    }
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Format berkas tidak valid: Payload cadangan harus berupa objek JSON.');
  }

  // 1. Verifikasi Identifier App
  if (payload.app !== 'habitly') {
    throw new Error(
      `Bukan berkas cadangan Habitly yang sah (pengidentifikasi app '${payload.app}' tidak cocok).`
    );
  }

  // 2. Verifikasi Schema Version
  if (
    typeof payload.schemaVersion !== 'number' ||
    payload.schemaVersion < 1 ||
    payload.schemaVersion > CURRENT_SCHEMA_VERSION
  ) {
    throw new Error(
      `Versi skema cadangan (${payload.schemaVersion}) tidak didukung. Versi aplikasi saat ini adalah ${CURRENT_SCHEMA_VERSION}.`
    );
  }

  // 3. Verifikasi struktur data
  if (!payload.data || typeof payload.data !== 'object') {
    throw new Error('Payload cadangan tidak memiliki objek data utama.');
  }

  const { categories, habits, habit_logs: habitLogs, settings } = payload.data;

  if (!Array.isArray(categories)) {
    throw new Error('Struktur data rusak: daftar categories harus berupa array.');
  }
  if (!Array.isArray(habits)) {
    throw new Error('Struktur data rusak: daftar habits harus berupa array.');
  }
  if (!Array.isArray(habitLogs)) {
    throw new Error('Struktur data rusak: daftar habit_logs harus berupa array.');
  }
  if (!Array.isArray(settings)) {
    throw new Error('Struktur data rusak: daftar settings harus berupa array.');
  }

  // Bangun set habit ID yang sah di dalam payload
  const payloadHabitIds = new Set(habits.map((h) => h && h.id).filter(Boolean));

  // 4. Verifikasi Log Tanggal dan Foreign Key
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  for (let i = 0; i < habitLogs.length; i++) {
    const log = habitLogs[i];

    if (!log || typeof log !== 'object') {
      throw new Error(`Log kebiasaan pada indeks ${i} tidak valid.`);
    }

    if (!log.logDate || !dateRegex.test(log.logDate)) {
      throw new Error(
        `Format logDate tidak valid pada log '${log.id || i}': '${log.logDate}'. Wajib berformat YYYY-MM-DD.`
      );
    }

    // Validasi Foreign Key habitId
    const habitId = log.habitId;
    const existsInPayload = payloadHabitIds.has(habitId);
    const existsInKnown = knownHabitIds && knownHabitIds.has(habitId);

    if (!existsInPayload && !(allowExternalHabitIds && existsInKnown)) {
      throw new Error(
        `Integritas data rusak: log '${log.id || i}' mereferensikan habitId '${habitId}' yang tidak ditemukan pada data kebiasaan.`
      );
    }
  }

  // Ringkasan isi file
  const summary = {
    app: payload.app,
    schemaVersion: payload.schemaVersion,
    exportedAt: payload.exportedAt || null,
    categoriesCount: categories.length,
    habitsCount: habits.length,
    logsCount: habitLogs.length,
    settingsCount: settings.length,
  };

  return {
    isValid: true,
    payload,
    summary,
  };
}
