/**
 * File Terpusat Seluruh Teks Antarmuka (UI Strings) Bahasa Indonesia
 * Sesuai panduan AGENTS.md & Instruksi Proyek HABITLY.
 *
 * Catatan penting:
 * - Tidak menerjemahkan hal teknis database/storage: 'completed', 'skipped',
 *   'checkbox', 'measurable', 'daily', 'selected_days', key database, dll.
 * - Nama produk "HABITLY" dan tagline resmi tetap dipertahankan.
 */

export const id = {
  common: {
    appName: 'HABITLY',
    appTagline: 'Build Better Habits, Build a Better You.',
    mindfulTracker: 'Mindful Tracker',
    offlineFirst: 'Offline-First',
    connected: 'Tersambung',
    offlineMode: 'Mode Offline',
    localDexie: 'Lokal Dexie',
    groundedPresent: 'Tenang & Sadar Penuh',
    activeRoutineNotice: 'Rutinitas aktif tersimpan lokal',
    save: 'Simpan',
    cancel: 'Batal',
    close: 'Tutup',
    delete: 'Hapus',
    edit: 'Ubah',
    confirm: 'Konfirmasi',
    back: 'Kembali',
    loading: 'Memuat...',
    empty: 'Belum ada data',
    daysSuffix: 'hari',
    lightMode: 'Mode Terang',
    darkMode: 'Mode Gelap',
    systemMode: 'Mode Sistem',
    share: 'Bagikan',
  },

  nav: {
    dashboard: 'Beranda',
    habits: 'Kebiasaan Saya',
    calendar: 'Kalender',
    analytics: 'Analitik',
    settings: 'Pengaturan',
  },

  dashboard: {
    cadenceText: 'Ritme Mindful',
    defaultGreeting: 'Selamat pagi',
    greetingSubtitle: 'Tarik napas, satu langkah dalam satu waktu.',
    addHabitButton: 'Tambah Kebiasaan',
    newHabit: 'Kebiasaan Baru',

    // Progress Card
    progressTitle: "Progres Hari Ini",
    peacefulMomentum: 'Momentum Tenang',
    progressDescription: 'Anda membuat kemajuan yang stabil dan tenang hari ini.',
    routinesLeft: (n) => `${n} rutinitas tersisa`,
    allCompleted: 'Semua rutinitas hari ini telah selesai!',

    // Stats Cards
    dailyStreak: 'Streak Harian',
    personalBest: 'Rekor Pribadi',
    streakDays: (n) => `${n} hari`,

    // Daily Checklist
    checklistTitle: 'Checklist Harian',
    allDoneBadge: 'Lengkap',
    emptyHabitsTitle: 'Belum Ada Kebiasaan Hari Ini',
    emptyHabitsSubtitle: 'Mulai tanam kebiasaan baru untuk membangun ritme harian yang bermakna.',
    addNewHabitAction: 'Tanam Kebiasaan Baru',
    markDoneLabel: (name) => `Tandai selesai ${name}`,
    targetReached: 'Target tercapai!',

    // Weekly Rhythm Chart
    weeklyRhythmTitle: 'Ritme Mingguan',
    weeklyRhythmSubtitle: 'Konsistensi penyelesaian 7 hari terakhir',
    averageLabel: 'Rata-rata',
    todayPill: 'Hari Ini',

    // Daily Anchor & Quote
    dailyAnchorTitle: 'Anchor Harian',
    dailyAnchorSubtitle: 'Tautkan niat Anda dengan rutinitas yang ada',
    mindfulReflectionTitle: 'Refleksi Singkat',

    // Backup Reminder Banner
    backupReminder: {
      title: 'Amankan Kemajuan Kebiasaan Anda',
      badge: 'Pengingat Cadangan',
      description: 'Data Anda tersimpan di penyimpanan offline peramban ini. Ekspor cadangan JSON secara berkala agar streaks Anda tetap aman.',
      actionButton: 'Cadangkan Sekarang',
      exportingButton: 'Mengekspor...',
    },
  },

  habits: {
    rhythmBadge: 'Ritme Anda',
    title: 'Kebiasaan Saya',
    activeCountBadge: (n) => `${n} rutinitas aktif`,
    newHabitButton: 'Kebiasaan Baru',

    // Focus Banner
    focusHeadline: (rate) => `Fokus Mingguan: ${rate}%`,
    focusSummary: (completed, total) => `${completed} dari ${total} selesai hari ini • Ritme tenang`,

    // Tabs
    tabActive: (n) => `Aktif (${n})`,
    tabArchived: (n) => `Diarsipkan (${n})`,
    tabActiveSubtitle: 'Kebiasaan aktif harian',
    tabArchivedSubtitle: 'Kebiasaan yang disembunyikan',

    // Empty States
    emptyArchivedTitle: 'Tidak Ada Kebiasaan yang Diarsipkan',
    emptyArchivedSubtitle: 'Kebiasaan yang Anda arsipkan akan tersimpan di sini.',
    emptyActiveTitle: 'Belum Ada Kebiasaan di Kategori Ini',
    emptyActiveSubtitle: 'Mulai kebiasaan baru yang bermakna dan bangun ritme hidup tenang.',
    addHabitCta: 'Tambah Kebiasaan',

    // Card Actions & Labels
    dailyFrequency: 'Setiap Hari',
    weekdayFrequency: 'Hari Kerja (Sen-Jum)',
    daysPerWeekFrequency: (n) => `${n} hari/minggu`,
    targetLabel: (val, unit) => `Target: ${val} ${unit}`,
    streakBadge: (n) => `${n} hari`,
    optionsAriaLabel: 'Opsi kebiasaan',
    editHabit: 'Edit Kebiasaan',
    archiveHabit: 'Arsipkan',
    unarchiveHabit: 'Pulihkan Arsip',
    deleteHabit: 'Hapus Permanen',
    confirmDelete: (name) =>
      `Hapus kebiasaan "${name || 'ini'}" secara permanen?\n\nPerhatian: Seluruh riwayat check-in kebiasaan ini akan terhapus bersih dari database.`,

    // Modal Add / Edit
    modal: {
      titleNew: 'Kebiasaan Baru',
      titleEdit: 'Edit Kebiasaan',
      subtitleNew: 'Tanam kebiasaan dan bangun ritme harian Anda',
      subtitleEdit: 'Perbarui detail dan ritme kebiasaan Anda',
      affirmationNewTitle: 'Mulai dengan santai',
      affirmationNewDesc: 'Konsistensi lebih bermakna daripada intensitas sesaat. Beri ruang bagi ritme alami Anda.',
      affirmationEditTitle: 'Konsistensi yang bertumbuh',
      affirmationEditDesc: 'Setiap pengulangan kecil memperkuat kebiasaan Anda secara sadar dan tenang.',

      nameLabel: 'Nama Kebiasaan',
      namePlaceholder: 'Contoh: Membaca 20 Halaman atau Jalan Pagi',
      nameRequiredError: 'Nama kebiasaan tidak boleh kosong.',

      categoryLabel: 'Kategori',
      categorySelected: (cat) => `Kategori ${cat} dipilih`,

      methodLabel: 'Metode Pencatatan',
      checkboxTitle: 'Centang Ya / Tidak',
      checkboxDesc: 'Centang sederhana jika rutinitas hari ini selesai.',
      measurableTitle: 'Target Numerik',
      measurableDesc: 'Catat angka kuantitas (menit, halaman, gelas, dll).',

      dailyTargetLabel: 'Target Harian',
      unitLabel: 'Satuan ukuran',
      unitPlaceholder: 'Halaman, ml, Menit, dll.',

      scheduleLabel: 'Jadwal Pengulangan',
      scheduleEveryday: 'Setiap Hari',
      scheduleWeekdays: 'Hari Kerja (Sen-Jum)',
      scheduleDaysPerWeek: (n) => `${n} hari per minggu`,
      scheduleRequiredError: 'Pilih minimal satu hari dalam seminggu untuk jadwal kebiasaan.',

      visualLabel: 'Identitas Visual',
      anchorLabel: 'Habit Anchor',
      anchorPlaceholder: 'Contoh: Dilakukan setelah minum teh herbal malam',
      anchorDesc: 'Menautkan kebiasaan pada rutinitas yang sudah ada meningkatkan keberhasilan hingga 64%.',

      saveButton: 'Simpan Perubahan',
      createButton: 'Tanam Kebiasaan Ini',
      cancelButton: 'Batal',
    },
  },

  calendar: {
    headerTitle: 'Kalender',
    todayButton: 'Hari Ini',
    prevMonthLabel: 'Bulan sebelumnya',
    nextMonthLabel: 'Bulan berikutnya',

    // Rhythm Banner
    monthlyRhythmTitle: 'Ritme Bulanan',
    consistencyRate: (rate) => `Tingkat Konsistensi: ${rate}%`,
    activeDaysCount: (n) => `${n} hari aktif tercatat`,
    trendText: (trend) => `${trend} dibanding bulan lalu`,

    // Weekday Names (Minggu dimulai Senin sesuai instruksi)
    weekdays: [
      { short: 'Sen', long: 'Senin' },
      { short: 'Sel', long: 'Selasa' },
      { short: 'Rab', long: 'Rabu' },
      { short: 'Kam', long: 'Kamis' },
      { short: 'Jum', long: 'Jumat' },
      { short: 'Sab', long: 'Sabtu' },
      { short: 'Min', long: 'Minggu' },
    ],

    // Date Statuses
    statusAllCompleted: 'Semua Selesai',
    statusPartial: 'Sebagian Selesai',
    statusNoneCompleted: 'Tidak Ada yang Selesai',
    statusNoSchedule: 'Tidak Ada Jadwal',
    statusFuture: 'Mendatang',
    todayBadge: 'Kini',

    // Legend
    legendTitle: 'Keterangan Status Tanggal (Ikon & Label)',
    legendSubtitle: 'Inklusif & Ramah Aksesibilitas',
    legendAllCompletedDesc: 'Semua target harian tercapai 100%',
    legendPartialDesc: 'Sebagian target terlaksana',
    legendNoneCompletedDesc: 'Hari terlewat tanpa penyelesaian',
    legendNoScheduleDesc: 'Hari istirahat atau tanpa target habit',

    // Detail Panel
    selectedDateTitle: (dateStr) => `Rincian Tanggal ${dateStr}`,
    emptyDateDetail: 'Tidak ada kebiasaan yang terjadwal pada tanggal ini.',
    sanctuaryTitle: 'Ruang Refleksi Kalender',
    sanctuaryMessage: 'Setiap hari adalah lembaran baru. Rayakan setiap langkah kecil yang konsisten.',
  },

  analytics: {
    progressBadge: 'Kemajuan Anda',
    title: 'Analitik',
    timeOptions: {
      '7d': '7 Hari',
      '30d': '30 Hari',
      '90d': '90 Hari',
    },

    // Completion Rate Card
    completionRateTitle: 'Tingkat Penyelesaian',
    momentumMessage: 'Anda membangun momentum yang kuat dan stabil.',
    trendComparison: (t) => `${t} vs periode sebelumnya`,

    // Daily Breakdown Chart
    dailyBreakdownTitle: 'Rincian Harian',
    subtitle7d: 'Kebiasaan selesai per hari (Minggu ini)',
    subtitleOther: 'Performa konsistensi berkala',
    chartLegendTarget: '100% Target',
    chartLegendPartial: 'Sebagian',
    dailyTargetSummary: (n) => `Target Harian: ${n} Habit`,
    todayIndicator: 'Hari Ini',

    // Category Breakdown
    categoryBreakdownTitle: 'Kinerja per Kategori',
    categoryBreakdownSubtitle: 'Tingkat penyelesaian kebiasaan berdasarkan rumpun kategori',

    // Highlight Cards
    bestHabitTitle: 'Kebiasaan Terbaik',
    bestHabitBadge: 'Top',
    streakCount: (n) => `${n} hari streak`,

    mostConsistentDayTitle: 'Hari Paling Konsisten',
    mostConsistentDayBadge: 'Puncak',
    avgRateLabel: (rate) => `Rata-rata ${rate}%`,

    perfectDaysTitle: 'Hari Sempurna',
    perfectDaysBadge: '100%',
    perfectDaysCount: (n) => `${n} Hari Sempurna`,
    perfectDaysDesc: 'Semua habit tercapai',

    totalCheckinsTitle: 'Total Check-in',
    totalCheckinsBadge: 'Aktivitas',
    totalCheckinsCount: (n) => `${n} Kali Selesai`,
    totalCheckinsDesc: 'Aktif tercatat',

    // Mindful Thought Card
    mindfulThoughtTitle: 'Pikiran Mindful',
    mindfulThoughtText: 'Perhatikan kemenangan-kemenangan kecil. Setiap repetisi mindful membentuk diri Anda di masa depan.',
    shareSuccessAlert: 'Tautan ringkasan analitik disalin ke papan klip!',
  },

  settings: {
    badge: 'Akun & Preferensi',
    title: 'Pengaturan',
    subtitle: 'Sesuaikan ruang personal, tampilan tema, dan penyimpanan data kebiasaan Anda',

    // Profile Card
    displayNameLabel: 'Nama Panggilan',
    membershipStatus: 'Anggota Aktif',
    reflectionTimeLabel: 'Waktu Refleksi Harian',
    nameInputPlaceholder: 'Masukkan nama Anda...',

    // Appearance
    appearanceTitle: 'Tampilan & Tema',
    appearanceSubtitle: 'Pilih nuansa antarmuka yang paling nyaman bagi mata Anda',
    themeLight: 'Terang',
    themeDark: 'Gelap',
    themeSystem: 'Sistem',

    // Backup & Restore
    backupRestoreTitle: 'Backup & Restore',
    lastSyncedLabel: (time) => `Sinkronisasi terakhir: ${time}`,
    syncModeLabel: 'Offline Lokal',
    backupDescription: 'Cadangkan rekaman kebiasaan, riwayat streaks, dan jurnal harian Anda ke dalam file JSON lokal yang aman.',
    exportBackupButton: 'Export Backup',
    restoreFileButton: 'Restore File',

    // App System & Storage
    installAppTitle: 'Install Habitly App',
    installAppSubtitle: 'Pasang di layar utama untuk akses cepat 100% offline',
    installButton: 'Install',
    installedBadge: 'Terpasang',
    installedStatus: 'Aktif',
    installedDesc: 'Aplikasi berjalan dalam mode PWA Standalone',

    persistentStorageTitle: 'Penyimpanan Persisten',
    persistentSafeBadge: 'Persisten (Aman)',
    persistentStandardBadge: 'Standar',
    persistentSafeDesc: 'Data terlindung dari pembersihan memori otomatis peramban.',
    persistentStandardDesc: 'Peramban dapat menghapus data jika ruang penyimpanan perangkat penuh.',
    protectDataButton: 'Lindungi Data',

    localStorageStatusTitle: 'Status Penyimpanan Lokal',
    storageUsageInfo: (used, habitsCount) => `${used} terpakai · ${habitsCount} kebiasaan tersimpan`,
    storageHealthy: 'Sehat',

    // Reminders
    gentleRemindersTitle: 'Pengingat Lembut',
    gentleRemindersSubtitle: 'Dapatkan pemberitahuan mindful harian saat tiba waktu refleksi',
    remindersActive: 'Pengingat Aktif',
    remindersQuiet: 'Mode Hening',

    // Danger Zone
    dangerZoneTag: 'Reset Data',
    dangerZoneTitle: 'Hapus Riwayat Perjalanan',
    dangerZoneDesc: 'Hapus seluruh riwayat check-in kebiasaan, milestone, dan data dari penyimpanan perangkat ini secara permanen.',
    deleteDataButton: 'Hapus Semua Data',
    resetConfirmPrompt: 'PERINGATAN: Aksi ini akan menghapus SELURUH kebiasaan dan riwayat log di perangkat ini secara permanen.\n\nKetik kata "HAPUS" untuk mengonfirmasi:',
    resetCancelledToast: 'Reset data dibatalkan (kata konfirmasi tidak sesuai).',
    resetSuccessToast: 'Seluruh data lokal berhasil dibersihkan.',

    footerVersion: (ver) => `Habitly ${ver} • Dibuat dengan sadar penuh`,
  },

  restoreModal: {
    title: 'Pulihkan Data (Restore)',
    subtitle: 'Pilih file JSON cadangan Habitly Anda',
    uploadPrompt: 'Klik untuk memilih berkas backup (.json)',
    parsing: 'Menganalisis berkas...',
    schemaNotice: 'Format berkas cadangan resmi Habitly (schema v1)',
    validationFailedTitle: 'Validasi Berkas Gagal',

    fileSummaryHabits: 'Kebiasaan',
    fileSummaryLogs: 'Catatan Log',
    fileSummaryCategories: 'Kategori',
    changeFile: 'Ganti file',
    exportedDate: (dt) => `Diekspor: ${dt}`,

    modeSelectionLabel: 'Pilih Metode Pemulihan:',
    replaceTitle: 'Ganti Semua (Replace)',
    replaceDesc: 'Mengosongkan semua data lama dan mengisi ulang sesuai berkas cadangan ini.',
    autoBackupNotice: 'Cadangkan data saat ini secara otomatis sebelum proses penggantian dimulai (sangat direkomendasikan).',

    mergeTitle: 'Gabung Data (Merge)',
    mergeDesc: 'Pertahankan data yang ada. Jika ada rekaman dengan ID sama, data dengan pembaruan paling baru (Last-Write-Wins) yang dipertahankan.',

    cancelButton: 'Batal',
    submitButton: 'Mulai Pemulihan',
    submittingButton: 'Memulihkan...',
  },

  pwa: {
    offlineAlert: 'Mode Offline Aktif — Seluruh data tetap tersimpan aman di perangkat Anda.',
    offlineReadyAlert: 'Habitly siap digunakan secara offline tanpa sambungan internet.',
    newVersionTitle: 'Versi Baru Tersedia!',
    newVersionDesc: 'Pembaruan Habitly telah diunduh di latar belakang. Muat ulang untuk menerapkan pembaruan terbaru.',
    laterButton: 'Nanti',
    reloadButton: 'Muat Ulang Sekarang',
  },
};
