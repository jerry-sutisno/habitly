# Software Requirements Specification (SRS)
# Project: HABITLY (Local-First Habit Tracker PWA)

**Dokumen Referensi:** IEEE Std 830-1998 Compliant Specification  
**Versi:** 1.0  
**Tanggal:** 12 November 2026  
**Status:** Approved  
**Target Platform:** Mobile Browser (Android Chrome/Edge) & Desktop Browser (Chrome/Edge/Firefox)  
**Hosting / Runtime:** GitHub Pages (`https://jerry-sutisno.github.io/habitly/`), Local-First PWA  

---

## 1. Pendahuluan (Introduction)

### 1.1 Tujuan Dokumen (Purpose)
Dokumen Software Requirements Specification (SRS) ini merinci secara komprehensif seluruh kebutuhan fungsional, non-fungsional, arsitektur data, logika bisnis, dan antarmuka sistem untuk pengembangan aplikasi **HABITLY**. Dokumen ini menjadi acuan mutlak bagi tim rekayasa perangkat lunak (*software engineers*) dan AI agent dalam proses implementasi kode, pengujian otomatis, serta verifikasi deployment.

### 1.2 Cakupan Produk (Scope)
HABITLY adalah aplikasi pelacak kebiasaan (*habit tracker*) pribadi yang beroperasi penuh di sisi klien (*client-side only*) berbasis Progressive Web App (PWA). Aplikasi tidak memiliki server backend, tidak memerlukan autentikasi login/register, dan menyimpan seluruh datanya secara lokal di IndexedDB menggunakan Dexie.js. Biaya operasional adalah Rp0 dengan memanfaatkan hosting statis GitHub Pages dan workflow CI/CD GitHub Actions.

### 1.3 Definisi, Akronim, dan Singkatan
- **PWA:** *Progressive Web Application* – aplikasi web yang memiliki kapabilitas native seperti precache offline, instalasi di home screen, dan web app manifest.
- **IndexedDB:** Database transaksional NoSQL berbasis objek bawaan browser web modern.
- **Dexie.js:** Library wrapper minimalis dan performan untuk IndexedDB dengan dukungan TypeScript/JavaScript dan reactive hooks (`useLiveQuery`).
- **Single Source of Truth (SSoT):** Prinsip arsitektur di mana `habit_logs` menjadi satu-satunya tabel sumber data; metrik lain (streak, progress, analytics) adalah fungsi turunan (*computed purely*).
- **Retroactive Logging:** Kemampuan mencatat atau mengubah riwayat kebiasaan pada tanggal yang telah lewat (dibatasi maksimal 7 hari ke belakang).
- **HashRouter:** Mekanisme routing React Router berbasis hash URL (`#/path`) yang mencegah HTTP 404 pada hosting statis tanpa server-side rewrite.

---

## 2. Deskripsi Umum Sistem (Overall Description)

### 2.1 Arsitektur Sistem (System Architecture)
Sistem dirancang dengan arsitektur **Local-First Tiered Architecture**:

```
+-----------------------------------------------------------+
|                   Presentation Layer                      |
| (React 18/19, Tailwind CSS, Lucide Icons, Recharts)       |
+-----------------------------------------------------------+
                             |
                             v
+-----------------------------------------------------------+
|                     Service Layer                         |
| (habitService, logService, categoryService, backupService)|
+-----------------------------------------------------------+
               |                             |
               v                             v
+-----------------------------+ +---------------------------+
|      IndexedDB Layer        | |     Pure Calculation      |
|  (Dexie.js: 'habitly-db')   | | (utils: streak, progress, |
| - habits                    | |  calendar, analytics)     |
| - habit_logs                | +---------------------------+
| - categories                |
| - settings                  |
+-----------------------------+
```

### 2.2 Batasan Desain & Kendala (Constraints)
1. **Zero External Network Calls:** Tidak ada payload HTTP yang dikirim keluar perangkat saat aplikasi beroperasi. Semua aset statis dan font (@fontsource) harus dilayani secara lokal.
2. **Subpath GitHub Pages:** Aplikasi wajib mendukung base path `/habitly/` menggunakan `HashRouter`.
3. **Penyimpanan Browser:** IndexedDB terikat pada origin domain (`jerry-sutisno.github.io`). Aplikasi wajib meminta izin penyimpanan persisten (`navigator.storage.persist()`) untuk meminimalkan risiko penggusuran data oleh browser.
4. **Ukuran Touch Target:** Elemen interaktif sentuh minimal berdimensi $44 \times 44$ piksel sesuai standar WCAG 2.1 AA.

---

## 3. Spesifikasi Kebutuhan Antarmuka Eksternal (External Interfaces)

### 3.1 Antarmuka Pengguna (UI)
- **Responsive Layout:**
  - *Desktop / Laptop ($\ge 768\text{px}$):* Sidebar navigasi di sisi kiri (lebar 240px–260px) dan konten utama di sisi kanan.
  - *Mobile ($< 768\text{px}$):* Bottom navigation bar dengan 5 ikon utama, mendukung safe area notch (`padding-bottom: env(safe-area-inset-bottom)`).
- **Tema Visual:**
  - Mendukung mode *Light*, *Dark*, dan *System* otomatis.
  - Warna aksen utama: Emerald / Hijau Konsistensi (#10B981 / #059669).
  - Indikator status kalender/checklist wajib menggunakan kombinasi warna, ikon, dan teks/label (aksesibilitas ramah buta warna).

### 3.2 Antarmuka Hardware & Browser API
1. **Web App Manifest & Service Worker:**
   - Plugin: `vite-plugin-pwa` dengan Workbox mode `generateSW`.
   - Strategi caching: Precache untuk HTML, JS, CSS, SVG, dan font WOFF2.
   - Event `registerType: 'prompt'` untuk memunculkan snackbar/modal update saat versi baru tersedia.
2. **StorageManager API:**
   - Memanggil `navigator.storage.persist()` saat runtime untuk memastikan kuota data tidak dibersihkan otomatis oleh OS/browser saat disk penuh.
   - Memanggil `navigator.storage.estimate()` untuk menampilkan perkiraan penggunaan memori IndexedDB pada menu Settings.
3. **Web Share API & File Download API:**
   - Android: Menjalankan `navigator.share({ files: [backupFile] })` jika didukung.
   - Desktop/Fallback: Menjalankan download otomatis via `URL.createObjectURL(blob)` dengan atribut `download="habitly-backup-YYYY-MM-DD.json"`.
4. **Visibility & Date Change Detection:**
   - Mendengarkan event `document.addEventListener('visibilitychange')` dan `window.addEventListener('focus')`.
   - Jika terjadi perubahan tanggal sistem saat aplikasi di latar belakang, state tanggal hari ini dihitung ulang secara otomatis tanpa mengharuskan restart aplikasi.

---

## 4. Spesifikasi Skema Database (Data Requirements)

Database IndexedDB diberi nama unik: **`habitly-db`** dengan Dexie skema Versi 1.

### 4.1 Definisi Store & Indeks
```javascript
const db = new Dexie('habitly-db');
db.version(1).stores({
  habits: 'id, categoryId, isArchived, createdAt',
  habit_logs: 'id, &[habitId+logDate], habitId, logDate',
  categories: 'id, name',
  settings: 'key'
});
```

### 4.2 Struktur Entitas Data

#### 4.2.1 Store: `habits`
| Atribut | Tipe Data | Wajib | Keterangan |
|---|---|---|---|
| `id` | String (UUIDv4) | Ya | Primary Key unik (`crypto.randomUUID()`) |
| `name` | String | Ya | Nama kebiasaan (maks 100 karakter) |
| `description` | String | Tidak | Catatan/alasan kebiasaan |
| `categoryId` | String (UUIDv4) | Ya | Relasi ke `categories.id` |
| `habitType` | Enum (`checkbox` \| `measurable`) | Ya | Tipe pengukuran |
| `targetValue` | Number | Kondisional | Wajib ada jika `habitType === 'measurable'` (nilai $> 0$) |
| `targetUnit` | String | Kondisional | Satuan ukuran (misal: "menit", "halaman", "gelas") |
| `frequency` | Enum (`daily` \| `selected_days`) | Ya | Pola frekuensi pengulangan |
| `scheduledDays` | Array of Number | Ya | Nilai `[1..7]` di mana 1 = Senin, 7 = Minggu. Wajib terisi jika `frequency === 'selected_days'` |
| `color` | String (Hex/Tailwind) | Ya | Warna visual kartu habit |
| `icon` | String | Ya | Nama identifikasi ikon Lucide |
| `isArchived` | Boolean | Ya | Default `false` |
| `archivedAt` | String (ISO 8601 UTC) | Tidak | Waktu habit diarsipkan |
| `startDate` | String (`YYYY-MM-DD`) | Ya | Tanggal lokal habit mulai berlaku |
| `createdAt` | String (ISO 8601 UTC) | Ya | Timestamp pembuatan |
| `updatedAt` | String (ISO 8601 UTC) | Ya | Timestamp pembaruan terakhir |

#### 4.2.2 Store: `habit_logs`
| Atribut | Tipe Data | Wajib | Keterangan |
|---|---|---|---|
| `id` | String (UUIDv4) | Ya | Primary Key unik |
| `habitId` | String (UUIDv4) | Ya | Foreign Key ke `habits.id` |
| `logDate` | String (`YYYY-MM-DD`) | Ya | Tanggal log lokal perangkat |
| `status` | Enum (`completed` \| `skipped`) | Ya | Status catatan |
| `value` | Number | Tidak | Nilai aktual untuk measurable (bisa null untuk checkbox) |
| `notes` | String | Tidak | Catatan singkat harian |
| `createdAt` | String (ISO 8601 UTC) | Ya | Timestamp pembuatan |
| `updatedAt` | String (ISO 8601 UTC) | Ya | Timestamp pembaruan |

> **Catatan Kunci:** Indeks unik majemuk `&[habitId+logDate]` menjamin secara tingkat penyimpanan bahwa tidak akan pernah ada lebih dari satu entri log untuk kebiasaan yang sama pada tanggal yang sama (*prevents duplicate logging*).

#### 4.2.3 Store: `categories`
| Atribut | Tipe Data | Wajib | Keterangan |
|---|---|---|---|
| `id` | String (UUIDv4) | Ya | Primary Key unik |
| `name` | String | Ya | Nama kategori unik |
| `isDefault` | Boolean | Ya | Penanda kategori bawaan sistem |
| `createdAt` | String (ISO 8601 UTC) | Ya | Timestamp pembuatan |

*Default Categories Seed:* `Health`, `Education`, `Productivity`, `Personal Development`, `Finance`.

#### 4.2.4 Store: `settings`
| Atribut | Tipe Data | Wajib | Keterangan |
|---|---|---|---|
| `key` | String | Ya | Primary Key (misal: `"general"`, `"backup"`) |
| `displayName`| String | Tidak | Nama panggilan pengguna (opsional) |
| `theme` | Enum (`light` \| `dark` \| `system`) | Ya | Preferensi tema antarmuka |
| `lastBackupAt`| String (ISO 8601 UTC) | Tidak | Timestamp ekspor backup terakhir |

---

## 5. Kebutuhan Fungsional Rinci (Functional Requirements)

### 5.1 Modul Tanggal & Waktu (Date Engine)
- **SRS-FR-001 (Format Tanggal Lokal):**
  - Seluruh pencatatan dan perbandingan tanggal kalender wajib berformat string `YYYY-MM-DD` dalam zona waktu lokal perangkat.
  - Wajib menyediakan utilitas terpusat `getTodayString(d = new Date())` di `src/utils/date.js`.
  - **Larangan Keras:** Dilarang menggunakan `new Date().toISOString().slice(0, 10)` karena menghasilkan tanggal UTC yang bergeser pada zona waktu GMT+7 / WIB malam hari.
- **SRS-FR-002 (Batas Retroaktif):**
  - Input log hanya diizinkan untuk tanggal $T$, dengan batasan $T_{\text{today}} - 7 \text{ hari} \le T \le T_{\text{today}}$.
  - Validasi wajib diterapkan di dua level: UI (komponen disabled/read-only) dan Service Layer (lempar *Error/Exception* jika melanggar).

### 5.2 Modul Manajemen Kebiasaan (Habit Service)
- **SRS-FR-003 (Pembuatan Kebiasaan):**
  - Sistem memvalidasi input: Nama tidak boleh kosong, jika tipe `measurable` maka `targetValue > 0` dan `targetUnit` wajib diisi.
  - Menetapkan `startDate = getTodayString()`.
- **SRS-FR-004 (Pengarsipan vs Penghapusan):**
  - *Arsip:* Menyetel `isArchived = true` dan `archivedAt = new Date().toISOString()`. Habit disembunyikan dari checklist harian, namun seluruh riwayat log tetap dipertahankan dan dihitung dalam analitik masa lalu.
  - *Hapus Permanen:* Wajib dijalankan dalam Dexie Transaction:
    ```javascript
    await db.transaction('rw', db.habits, db.habit_logs, async () => {
      await db.habit_logs.where('habitId').equals(id).delete();
      await db.habits.delete(id);
    });
    ```

### 5.3 Modul Pencatatan & Checklist Harian (Daily Checklist Service)
- **SRS-FR-005 (Penyaringan Hari Ini):**
  - Habit ditampilkan pada hari ini jika: `!isArchived` DAN `startDate <= today` DAN (`frequency === 'daily'` ATAU `scheduledDays.includes(dayOfWeek)` di mana Senin=1 .. Minggu=7).
- **SRS-FR-006 (Operasi Centang / Checkbox):**
  - Jika belum ada log: Buat record log baru `{ habitId, logDate: today, status: 'completed', createdAt, updatedAt }`.
  - Jika sudah ada log berstatus `completed`: Menghapus (*delete*) baris log tersebut dari database.
- **SRS-FR-007 (Operasi Nilai Terukur / Measurable):**
  - Pengguna memasukkan angka akumulasi.
  - Jika nilai $> 0$, lakukan *upsert* pada tabel `habit_logs`. Jika `value >= targetValue`, set `status = 'completed'`, selain itu set status progres tanpa completion.
  - Jika nilai diubah kembali ke 0, hapus log.
- **SRS-FR-008 (Operasi Skip):**
  - Pengguna menandai kebiasaan sebagai "Lewati" (*Skip*).
  - Simpan record dengan `status = 'skipped'`.

### 5.4 Modul Kalkulasi Progress & Streak (Pure Engine)
- **SRS-FR-009 (Perhitungan Progress Harian):**
  - Formula:
    $$\text{TodayProgress} = \frac{\sum \text{Habits Scheduled Today with status 'completed'}}{\sum \text{Habits Scheduled Today} - \sum \text{Habits with status 'skipped'}} \times 100$$
  - Jika nilai pembagi $(\text{Scheduled} - \text{Skipped}) \le 0$, kembalikan nilai 0 dan tampilkan *Empty State*.
- **SRS-FR-010 (Kalkulasi Streak per Habit):**
  - Mulai evaluasi dari tanggal kemarin mundur ke belakang hingga `startDate`.
  - Hari tanpa jadwal diabaikan (*neutral skip*).
  - Hari dengan status `skipped` diabaikan (*neutral skip*).
  - Hari dengan status `completed` menambah nilai streak $+1$.
  - Ditemukan hari terjadwal lampau tanpa log `completed` $\rightarrow$ hentikan evaluasi streak.
  - Evaluasi hari ini: Jika hari ini terjadwal dan sudah `completed`, tambahkan $+1$ ke streak. Jika hari ini belum completed, streak tidak terputus (tetap bernilai hitungan sampai kemarin).
- **SRS-FR-011 (Kalkulasi Current Streak Dashboard):**
  - Menghitung hari berturut-turut di mana seluruh kebiasaan yang terjadwal pada hari tersebut terselesaikan $100\%$.
  - Hari tanpa jadwal dan hari di mana semua habit di-skip tidak memutus streak.

### 5.5 Modul Kalender (Calendar Engine)
- **SRS-FR-012 (Status Tanggal):**
  Setiap sel tanggal $T$ pada kalender bulanan dievaluasi statusnya:
  1. Jika $T > T_{\text{today}}$: Return `STATUS_FUTURE` (nonaktif).
  2. Ambil seluruh habit aktif pada tanggal $T$ ($T \ge \text{startDate}$ dan memenuhi jadwal hari).
  3. Jika jumlah jadwal $= 0$: Return `STATUS_NO_SCHEDULE`.
  4. Ambil log pada tanggal $T$:
     - Jika seluruh jadwal yang tidak di-skip berstatus `completed`: Return `STATUS_ALL_COMPLETED`.
     - Jika jumlah log `completed` $> 0$ namun belum semua: Return `STATUS_PARTIAL`.
     - Jika jumlah log `completed` $= 0$ dan ada jadwal: Return `STATUS_NONE_COMPLETED`.

### 5.6 Modul Analitik (Analytics Service)
- **SRS-FR-013 (Pengambilan Data Rentang Waktu):**
  - Filter rentang: 7 Hari, 30 Hari (Default), 90 Hari.
  - Kueri IndexedDB wajib memanfaatkan indeks `logDate`:
    ```javascript
    db.habit_logs.where('logDate').between(startDateStr, endDateStr, true, true);
    ```
- **SRS-FR-014 (Best Habit & Most Consistent Day):**
  - *Best Habit:* Kebiasaan dengan rasio `(completed / scheduled)` tertinggi, dengan syarat ambang batas minimal 7 hari terjadwal dalam rentang tersebut.
  - *Most Consistent Day:* Agregasi rasio penyelesaian per hari (Senin s/d Minggu), menampilkan hari dengan persentase tertinggi.

### 5.7 Modul Backup & Restore (Data Portability Service)
- **SRS-FR-015 (Struktur Payload Export JSON):**
  ```json
  {
    "app": "habitly",
    "schemaVersion": 1,
    "exportedAt": "2026-11-12T03:04:00.000Z",
    "data": {
      "categories": [ ... ],
      "habits": [ ... ],
      "habit_logs": [ ... ],
      "settings": [ ... ]
    }
  }
  ```
- **SRS-FR-016 (Validasi Berkas Backup):**
  Sebelum proses restore, berkas JSON wajib melalui pipeline verifikasi:
  1. `payload.app === 'habitly'`
  2. `payload.schemaVersion <= CURRENT_SCHEMA_VERSION`
  3. Tipe data dan relasi foreign key valid (setiap `habit_logs.habitId` harus mereferensikan `habits.id` yang sah).
  4. Format `logDate` cocok dengan regex `^\d{4}-\d{2}-\d{2}$`.
- **SRS-FR-017 (Mode Restore Ganti Semua / Replace):**
  - Aplikasi menawarkan konfirmasi dan auto-download backup kondisi saat ini.
  - Seluruh tabel `habits`, `habit_logs`, `categories`, `settings` dikosongkan dan diisi ulang data backup dalam 1 transaksi Dexie.
- **SRS-FR-018 (Mode Restore Gabung / Merge):**
  - Untuk setiap entitas dengan `id` sama, pertahankan versi dengan nilai `updatedAt` paling baru (*last-write-wins*).
  - Entitas dengan `id` baru langsung disisipkan (*bulkPut*).

---

## 6. Kebutuhan Non-Fungsional Rinci (Non-Functional Requirements)

### 6.1 Kehandalan & Integritas Data (Reliability & Data Integrity)
- **NFR-REL-001:** Semua modifikasi data kaskade (hapus habit beserta log, bulk restore) wajib menggunakan Dexie ACID Transaction.
- **NFR-REL-002:** Jika terjadi kegagalan parser JSON saat import, transaksi harus langsung dibatalkan (*rollback*) tanpa ada satupun row yang berubah di IndexedDB.
- **NFR-REL-003:** Database upgrade antar versi masa depan wajib dilakukan melalui skema Dexie resmi: `db.version(n).stores(...).upgrade(tx => ...)`.

### 6.2 Performa (Performance)
- **NFR-PER-001:** Waktu eksekusi seluruh fungsi murni kalkulasi (*pure calculation engine*) untuk dataset 1 tahun (365 hari $\times$ 10 habits = 3.650 log) harus $< 30\text{ ms}$.
- **NFR-PER-002:** Ukuran bundle produksi aplikasi (Gzip compressed) harus $< 250\text{ KB}$ untuk script utama.
- **NFR-PER-003:** PWA Service worker wajib melayani request aplikasi dengan respon cache $< 50\text{ ms}$ saat kondisi offline.

### 6.3 Aksesibilitas & UI/UX (Usability)
- **NFR-USE-001:** Kontras rasio teks minimal 4.5:1 untuk teks normal sesuai WCAG 2.1 Level AA.
- **NFR-USE-002:** Setiap aksi destruktif (Hapus Habit, Hapus Semua Data) wajib menyertakan modal konfirmasi eksplisit (mengetik teks "HAPUS" untuk reset data).
- **NFR-USE-003:** Empty state interaktif wajib ditampilkan jika pengguna belum memiliki kebiasaan, riwayat log kosong, atau filter rentang tidak menghasilkan data.

---

## 7. Verifikasi & Strategi Pengujian (Verification & Testing)

1. **Unit Testing (Vitest):**
   - Menguji semua fungsi di `src/utils/` secara terisolasi tanpa DOM/Browser:
     - `calculateProgress()`: Pengujian penyebut 0, hari tanpa jadwal, skipped.
     - `calculateStreak()`: Pengujian kebiasaan baru (`startDate`), skipped days, missed days, hari ini belum selesai vs sudah selesai.
     - `getTodayString()`: Pengujian zona waktu lokal dan boundary tengah malam.
     - `validateBackupData()`: Pengujian payload JSON rusak, foreign key hilang, skema usang.
2. **Database Integration Testing (Vitest + `fake-indexeddb`):**
   - Menguji interaksi CRUD `Dexie` dan integritas transaksi atomic.
   - Pengujian *round-trip backup*: Ekspor data $\rightarrow$ Bersihkan DB $\rightarrow$ Restore $\rightarrow$ Pastikan data 100% identik.
3. **PWA & Offline Testing:**
   - Lighthouse Audit: Kategori *Progressive Web App* skor 100%.
   - Simulasi mode pesawat (*airplane mode*) pada browser Android fisik: verifikasi kemampuan buka aplikasi dan pencatatan log tanpa kendala.
