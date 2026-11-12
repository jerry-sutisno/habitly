# AGENTS.md — Development Guidelines for AI & Engineers
# Project: HABITLY (Local-First Habit Tracker PWA)

Dokumen ini adalah instruksi operasional, panduan arsitektur, dan aturan baku (*invariants*) bagi setiap **AI Agent** (Antigravity, Cursor, Claude Code, Copilot, dll.) dan insinyur pengembang yang bekerja pada repository **HABITLY**.

Sebelum menulis kode atau melakukan modifikasi apa pun, **baca dan patuhi seluruh panduan di bawah ini**.

---

## 1. Filosofi & Prinsip Inti Proyek

1. **Local-First & Zero Backend:**
   - Tidak ada server backend, tidak ada REST/GraphQL API eksternal, tidak ada autentikasi (login/register).
   - Seluruh data disimpan secara lokal di IndexedDB browser menggunakan library **Dexie.js**.
   - Biaya operasional adalah **Rp0**. Aplikasi di-host secara gratis di **GitHub Pages** melalui GitHub Actions.
2. **`habit_logs` Adalah Satu-satunya Sumber Kebenaran (Single Source of Truth):**
   - **DILARANG** menyimpan *current streak*, *best streak*, *daily progress*, atau *completion rate* ke dalam kolom database `habits`.
   - Semua metrik statistik dihitung secara murni (*pure calculation*) berdasarkan data baris di `habit_logs`.
3. **Kemandirian Offline Total (Offline-First):**
   - Aplikasi wajib dapat beroperasi penuh 100% tanpa sambungan internet setelah pertama kali dibuka.
   - **DILARANG** memuat font dari Google Fonts CDN atau skrip dari CDN pihak ketiga. Gunakan `@fontsource` untuk font lokal dan paket npm lokal untuk semua aset.
4. **Kedaulatan Data Pengguna:**
   - Mekanisme ekspor dan impor file JSON wajib tangguh, atomik, dan menyertakan validasi integritas skema.

---

## 2. Aturan Baku yang Tidak Boleh Dilanggar (Non-Negotiable Invariants)

### 2.1 Format Tanggal & Zona Waktu
- **Wajib:** Semua tanggal kalender disimpan dalam format string `YYYY-MM-DD` sesuai **zona waktu lokal perangkat**.
- **Wajib:** Gunakan fungsi terpusat `getTodayString(d = new Date())` di `src/utils/date.js`.
- ❌ **PELANGGARAN FATAL:** Dilarang menggunakan `new Date().toISOString().slice(0, 10)` untuk tanggal kalender, karena mengembalikan tanggal UTC yang akan bergeser 1 hari lebih lambat pada malam hari di zona waktu Indonesia (WIB/WITA/WIT).
- **Aturan Timestamp:** Kolom audit seperti `createdAt`, `updatedAt`, dan `archivedAt` disimpan dalam format ISO 8601 UTC string (`new Date().toISOString()`).

### 2.2 Isolasi Layer Arsitektur
- ❌ **PELANGGARAN:** Komponen UI (`src/pages/*`, `src/components/*`) **TIDAK BOLEH** memanggil database Dexie (`db.habits`, `db.habit_logs`) secara langsung.
- **Wajib:** Seluruh pembacaan dan modifikasi data wajib melalui lapisan `src/services/*` (misal: `habitService`, `logService`, `backupService`).
- **Pengecualian:** Penggunaan hook reaktif `useLiveQuery` dari `dexie-react-hooks` diizinkan di komponen/custom hooks dengan membungkus query service resmi.

### 2.3 Perhitungan Murni (Pure Utilities)
- Seluruh logika kalkulasi (streak, progress harian, status kalender, analitik) wajib diimplementasikan sebagai fungsi murni (*pure functions*) di `src/utils/`:
  - Tidak memiliki efek samping (*no side-effects*).
  - Tidak memanggil database di dalam utility.
  - Menerima parameter input array data murni dan mengembalikan hasil kalkulasi terstruktur.
- Setiap fungsi di `src/utils/` wajib memiliki cakupan unit test komprehensif di Vitest.

### 2.4 Integritas Transaksi Database
- Operasi majemuk wajib dibungkus dalam Dexie Transaction:
  1. **Hapus Habit:** Wajib menghapus habit dan seluruh log-nya secara bersamaan dalam 1 transaksi.
  2. **Restore Backup (Mode Ganti):** Wajib mengosongkan store dan menyisipkan data baru dalam 1 transaksi. Jika ada kegagalan validasi, transaksi otomatis dibatalkan (*rollback*).

### 2.5 Batas Retroaktif Pencatatan
- Pengguna hanya boleh mencatat atau mengedit kebiasaan untuk **hari ini** dan maksimal **7 hari ke belakang** ($T_{\text{today}} - 7 \text{ hari}$).
- Tanggal masa depan ($T > T_{\text{today}}$) dilarang dicatat dan harus dinonaktifkan di UI serta divalidasi di service layer.

---

## 3. Arsitektur Folder & File

Pastikan struktur repository mematuhi skema berikut:

```text
habitly/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deploy ke GitHub Pages
├── public/
│   ├── icons/                  # 192, 512, maskable-512, apple-touch-icon
│   └── favicon.svg
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── common/             # Button, Modal, Card, Badge, EmptyState
│   │   ├── dashboard/          # TodayProgress, DailyChecklist, RecentActivity
│   │   ├── habits/             # HabitCard, HabitFormModal, CategoryBadge
│   │   ├── charts/             # WeeklyChart, MonthlyChart, ConsistencyChart
│   │   └── settings/           # BackupModal, RestoreModal, StorageInfo
│   ├── layouts/
│   │   └── AppLayout.jsx       # Layout responsive (Sidebar desktop, Bottom nav mobile)
│   ├── pages/
│   │   ├── DashboardPage.jsx
│   │   ├── HabitsPage.jsx
│   │   ├── CalendarPage.jsx
│   │   ├── AnalyticsPage.jsx
│   │   └── SettingsPage.jsx
│   ├── db/
│   │   ├── db.js               # Inisialisasi Dexie & skema stores
│   │   └── seed.js             # Seed kategori bawaan saat first launch
│   ├── services/               # Abstraksi akses database Dexie
│   │   ├── habitService.js
│   │   ├── logService.js
│   │   ├── categoryService.js
│   │   ├── settingsService.js
│   │   └── backupService.js
│   ├── hooks/                  # Custom hooks (useDateTick, usePWAInstall, useOnlineStatus)
│   ├── pwa/                    # Registrasi Service Worker & event prompt
│   ├── utils/                  # Pure calculation functions (Unit-tested)
│   │   ├── date.js             # getTodayString, dayOfWeek, formatLocaleDate
│   │   ├── progress.js         # calculateDailyProgress
│   │   ├── streak.js           # calculateHabitStreak, calculateDashboardStreak
│   │   ├── calendar.js         # getCalendarMonthGrid, getDateStatus
│   │   ├── analytics.js        # calculateCompletionRate, getBestHabit, getConsistentDay
│   │   └── validation.js       # validateBackupPayload, validateHabitInput
│   ├── App.jsx                 # Routing (HashRouter) & Theme Provider
│   ├── main.jsx                # Entry point
│   └── index.css               # Tailwind CSS & local font imports
├── tests/                      # Unit & integration tests
│   ├── date.test.js
│   ├── progress.test.js
│   ├── streak.test.js
│   ├── backup.test.js
│   └── db.test.js              # Tested with fake-indexeddb
├── index.html
├── vite.config.js              # Base path '/habitly/' + vite-plugin-pwa config
├── package.json
└── README.md
```

---

## 4. Spesifikasi Logika Bisnis (Kamus Perhitungan)

### 4.1 Status Log
- Hanya ada dua status valid yang disimpan di database: `'completed'` dan `'skipped'`.
- Status *missed* **TIDAK DISIMPAN** di database. Missed adalah kondisi virtual di mana suatu hari terjadwal telah lewat tanpa ada log `'completed'`.
- Pembatalan centang = **Hapus baris log** dari database (bukan mengubah status menjadi uncompleted/null).

### 4.2 Formula Progress Harian
$$\text{Progress} = \frac{\text{Jumlah Kebiasaan Terjadwal Hari Ini berstatus 'completed'}}{\text{Jumlah Kebiasaan Terjadwal Hari Ini} - \text{Jumlah berstatus 'skipped'}} \times 100\%$$
*Edge Case:* Jika penyebut $\le 0$ (misal seluruh kebiasaan di-skip atau tidak ada kebiasaan terjadwal), kembalikan `0%` dan tampilkan keterangan netral.

### 4.3 Logika Streak
- **Streak per Habit:**
  - Menghitung hari terjadwal berturut-turut yang berstatus `'completed'` mundur dari hari kemarin hingga `startDate` habit.
  - Hari tidak terjadwal dan hari `'skipped'` **tidak memutus streak** (diabaikan).
  - Hari pertama yang terjadwal tanpa log `'completed'` memutus rantai streak.
  - **Hari Ini:** Jika hari ini terjadwal dan sudah `'completed'`, tambahkan $+1$ pada streak. Jika hari ini belum selesai, streak tidak terputus (tetap memakai nilai sampai kemarin).
- **Current Streak di Dashboard:**
  - Menghitung hari berturut-turut di mana **seluruh** kebiasaan terjadwal hari itu berhasil diselesaikan $100\%$.

### 4.4 Status Sel Kalender
Untuk setiap tanggal $T$:
1. $T > T_{\text{today}}$ $\rightarrow$ `future` (disable klik).
2. Kebiasaan aktif terjadwal pada $T == 0$ $\rightarrow$ `no_schedule`.
3. Seluruh jadwal yang tidak di-skip completed $\rightarrow$ `all_completed`.
4. Log completed $> 0$ namun belum semua $\rightarrow$ `partial`.
5. Ada jadwal, sudah lewat, nol completed $\rightarrow$ `none_completed`.

---

## 5. Konvensi Kode & Styling

### 5.1 Standar Frontend
- Gunakan **Tailwind CSS** dengan pendekatan *mobile-first*:
  - Minimal area sentuh: `min-h-[44px] min-w-[44px]`.
  - Padding bottom navigasi HP: `pb-[calc(4rem+env(safe-area-inset-bottom))]`.
- Warna Aksen Utama: Emerald / Green palette (`emerald-600`, `emerald-500`, `emerald-400`).
- Semua status wajib menyertakan **ikon Lucide** dan **label teks**. Jangan hanya mengandalkan kode warna.
- Komponen wajib menangani 4 state: **Loading**, **Empty**, **Error**, dan **Success**.

### 5.2 Standar PWA & GitHub Pages
- Di `vite.config.js`:
  ```javascript
  export default defineConfig({
    base: '/habitly/', // Wajib ada untuk GitHub Pages subpath
    plugins: [
      react(),
      VitePWA({
        registerType: 'prompt',
        manifest: {
          name: 'HABITLY',
          short_name: 'HABITLY',
          description: 'Build Better Habits, Build a Better You.',
          theme_color: '#10B981',
          background_color: '#0F172A',
          display: 'standalone',
          start_url: '/habitly/',
          scope: '/habitly/',
          icons: [
            { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
          ]
        }
      })
    ]
  });
  ```
- Di `src/App.jsx`: Selalu gunakan `<HashRouter>` bukan `<BrowserRouter>` guna menghindari masalah URL rewrites di GitHub Pages.

---

## 6. Protokol Verifikasi AI Agent (Checklist Sebelum Selesai)

Sebelum menandai suatu fase atau task selesai, AI Agent wajib memverifikasi hal-hal berikut:

1. **Jalankan Unit Test:**
   ```bash
   npm run test
   ```
   Pastikan seluruh test untuk `utils/date.js`, `utils/progress.js`, `utils/streak.js`, dan `utils/validation.js` lolos (100% pass).
2. **Uji Transaksional Database:**
   Pastikan integrasi Dexie dengan `fake-indexeddb` lolos tanpa *unhandled promise rejections*.
3. **Cek Bundle & Build:**
   ```bash
   npm run build
   ```
   Pastikan tidak ada path impor yang salah (case-sensitive) dan build selesai tanpa error.
4. **Verifikasi Zero Network Request:**
   Periksa tab Network; pastikan tidak ada panggilan fetch ke URL eksternal selain aset lokal PWA.
5. **Verifikasi Round-Trip Backup:**
   Pastikan JSON hasil Export dapat di-import kembali melalui mode Ganti (*Replace*) maupun Gabung (*Merge*) tanpa kehilangan satu byte data pun.
