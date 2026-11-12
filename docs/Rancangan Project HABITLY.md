# Rancangan Project HABITLY (Revisi)

Revisi 2: HABITLY menjadi aplikasi pribadi yang berjalan sepenuhnya di perangkat (local-first PWA): tanpa login, tanpa server, data di IndexedDB, bisa dipakai offline, dan biaya Rp0. Aturan logika dari revisi sebelumnya tetap dipakai, kecuali yang disebut di bagian Perubahan.

## 1. Ringkasan Project

- **Nama aplikasi:** HABITLY
- **Tagline:** Build Better Habits, Build a Better You.
- **Jenis:** PWA local-first untuk satu pengguna (pemilik), dipakai di laptop dan HP Android.
- **Konsep:** mencatat kebiasaan harian, memantau streak, melihat riwayat di kalender, dan mengevaluasi lewat analytics. Semua data tersimpan di perangkat.

**Prinsip utama:**

- `habit_logs` adalah satu-satunya sumber kebenaran. Progress, streak, kalender, dan analytics dihitung dari sana, bukan disimpan terpisah.
- Semua data hanya ada di IndexedDB perangkat. Tidak ada backend, akun, atau API eksternal.
- Tidak ada fitur utama yang memerlukan layanan berbayar.

## 2. Ketentuan Utama

| No | Ketentuan | Cara memenuhi |
| --- | --- | --- |
| 1 | Responsive laptop dan HP | Tailwind mobile-first; sidebar di laptop, bottom navigation di HP |
| 2 | Bisa dipasang di layar utama | PWA: web manifest + service worker (vite-plugin-pwa) |
| 3 | Bisa offline setelah pertama dibuka | Service worker menyimpan semua aset (precache); font dan ikon dilayani lokal |
| 4 | Data tersimpan di perangkat | IndexedDB lewat Dexie.js, plus permintaan penyimpanan persisten |
| 5 | Backup dan restore | Export/import file JSON dengan validasi, mode Ganti atau Gabung |
| 6 | Tanpa login dan register | Tidak ada autentikasi; aplikasi langsung membuka Dashboard |
| 7 | Tanpa sinkronisasi otomatis | Data per perangkat; pindah data manual lewat backup |
| 8 | Biaya Rp0 | React, Vite, Tailwind, Dexie, GitHub, GitHub Actions, GitHub Pages (repo publik); tanpa domain dan tanpa API berbayar |

## 3. Perubahan dari Revisi Sebelumnya

| Hal | Revisi 1 | Revisi 2 |
| --- | --- | --- |
| Penyimpanan | Supabase PostgreSQL | IndexedDB (Dexie.js) |
| Akun | Register, login, reset password | Dihapus |
| Keamanan data | RLS | Tidak diperlukan; validasi dipindah ke lapisan service |
| Hosting | Vercel | GitHub Pages, deploy lewat GitHub Actions |
| Tabel profiles dan trigger | Ada | Dihapus; pengaturan disimpan di store settings |
| Zona waktu | Tersimpan di profil (WIB) | Mengikuti zona waktu perangkat |
| Landing page | Ada | Dihapus; aplikasi langsung ke Dashboard |
| Backup | Tidak ada | Export/import JSON dan pengingat backup |
| PWA dan offline | Tidak ada | Wajib |

## 4. Aturan Logika (Keputusan Final)

Semua perhitungan harus mengikuti aturan ini.

### 4.1 Tipe kebiasaan dan definisi selesai

- Dua tipe (`habitType`): `checkbox` dan `measurable`.
- `checkbox`: selesai kalau dicentang. Contoh: bangun sebelum 05.00.
- `measurable`: punya `targetValue` dan `targetUnit` (menit, halaman, dll). Selesai kalau `value >= targetValue`. Jika belum tercapai, `value` tetap disimpan sebagai progres.

### 4.2 Status log

- Status yang disimpan hanya `completed` dan `skipped`.
- Missed tidak disimpan. Missed = hari terjadwal yang sudah lewat tanpa log `completed`.
- `skipped` netral: tidak masuk penyebut progress dan tidak memutus streak.
- Batal centang = hapus baris log.

### 4.3 Progress harian

`Progress = (kebiasaan terjadwal hari ini yang completed / kebiasaan terjadwal hari ini, tanpa skipped) × 100%`

- Kebiasaan yang tidak dijadwalkan hari itu tidak masuk penyebut.
- Jika penyebut 0, tampilkan empty state, jangan membagi dengan nol.

### 4.4 Streak

- **Streak per kebiasaan** (halaman My Habits, plus best streak): hari terjadwal berturut-turut yang `completed`.
- **Current Streak di Dashboard**: hari berturut-turut di mana semua kebiasaan terjadwal hari itu selesai.
- Hari tanpa jadwal dan `skipped` tidak memutus streak.
- Hari ini yang belum selesai tidak memutus streak: streak dihitung sampai kemarin dan bertambah 1 jika hari ini sudah selesai.

### 4.5 Riwayat dan perubahan data

- Perhitungan satu kebiasaan dimulai dari `startDate` (tanggal lokal saat dibuat), supaya kebiasaan baru tidak dianggap gagal di hari sebelumnya.
- Jadwal yang diedit berlaku untuk perhitungan ke depan. Batasan v1 yang diterima: riwayat lama dihitung dengan jadwal terkini.
- Kebiasaan diarsipkan (`isArchived`, `archivedAt`): hilang dari checklist, log tetap tersimpan dan tetap dihitung di analytics untuk periode sebelum `archivedAt`.
- Hapus permanen = semua log kebiasaan itu ikut terhapus, dengan dialog konfirmasi. Arsipkan adalah pilihan utama.

### 4.6 Tanggal yang boleh dicatat

- Hari ini dan mundur maksimal 7 hari. Tanggal mendatang tidak boleh. Validasi di UI dan di service.

### 4.7 Tanggal dan zona waktu

- `logDate` disimpan sebagai teks `YYYY-MM-DD` dalam tanggal lokal perangkat. Buat satu fungsi `getTodayString()` di `utils/date` dan pakai di semua tempat. Jangan memakai `toISOString().slice(0,10)` karena hasilnya UTC.
- Timestamp (`createdAt`, `updatedAt`) disimpan dalam ISO UTC.
- Saat aplikasi dibuka kembali atau melewati tengah malam (event `visibilitychange`), tanggal hari ini dihitung ulang dan Dashboard diperbarui.
- Jika zona waktu perangkat berubah, data lama tidak diubah.

### 4.8 Status tanggal di Kalender

| Status | Kondisi | Label/ikon |
| --- | --- | --- |
| Semua selesai | Semua kebiasaan terjadwal completed | Ikon centang + label |
| Sebagian | Sebagian completed | Ikon setengah + label |
| Tidak ada yang selesai | Ada jadwal, sudah lewat, nol completed | Ikon silang + label |
| Tidak ada jadwal | Tidak ada kebiasaan terjadwal | Netral |
| Mendatang | Setelah hari ini | Netral, tidak bisa diisi |

Status tidak boleh hanya dibedakan dengan warna; selalu sertakan label atau ikon.

### 4.9 Analytics

- Filter rentang: 7 hari, 30 hari (default), 90 hari.
- **Completion Rate** = completed / jadwal yang sudah lewat (tanpa skipped) dalam rentang.
- **Weekly Performance** per minggu, **Monthly Performance** per bulan.
- **Best Habit**: completion rate tertinggi, hanya untuk kebiasaan dengan minimal 7 hari terjadwal di rentang itu.
- **Most Consistent Day**: hari dalam seminggu (Senin sampai Minggu) dengan completion rate tertinggi.
- **Total Completed**: jumlah log `completed` dalam rentang.
- Ambil log per rentang tanggal lewat index `logDate`, jangan memuat seluruh riwayat kalau tidak perlu.

## 5. Fitur dan Halaman

Aplikasi langsung membuka Dashboard, tanpa landing page dan tanpa login. Saat pertama dibuka, kategori bawaan dibuat otomatis dan muncul petunjuk singkat cara memasang aplikasi.

### 5.1 Dashboard

Sapaan (memakai nama panggilan jika diisi) dan tanggal hari ini, Today's Progress, Total Habits aktif, Current Streak, Daily Checklist (centang untuk checkbox, input angka untuk measurable), Weekly Overview, Recent Activity, dan banner pengingat backup.

### 5.2 My Habits

Tambah, edit, arsipkan, hapus. Field: nama, deskripsi, kategori, tipe, target + satuan (measurable), frekuensi (daily atau selected\_days), hari terpilih, warna, ikon. Menampilkan streak dan best streak per kebiasaan. Kategori bawaan: Health, Education, Productivity, Personal Development, Finance; boleh menambah kategori sendiri.

### 5.3 Calendar

Kalender bulanan dengan status tanggal sesuai 4.8, navigasi bulan, klik tanggal untuk melihat dan mengisi log (dalam batas 4.6), ringkasan tanggal terpilih, dan legenda berlabel.

### 5.4 Analytics

Komponen sesuai 4.9, semuanya dihitung dari `habit_logs`.

### 5.5 Settings

- Nama panggilan (opsional) dan tema Light / Dark / System.
- Backup dan Restore (bagian 8).
- Pasang aplikasi: tombol Install saat tersedia, plus panduan manual.
- Status penyimpanan: persisten atau tidak, dan perkiraan ukuran data.
- Versi aplikasi.
- Hapus semua data, dengan konfirmasi mengetik kata HAPUS.

### 5.6 Navigasi

Lima menu: Dashboard, My Habits, Calendar, Analytics, Settings. Sidebar di laptop, bottom navigation di HP.

## 6. PWA dan Offline

- **Plugin:** `vite-plugin-pwa` (Workbox, mode generateSW). Semua aset build (HTML, JS, CSS, ikon, font) di-precache.
- **Manifest:** name dan short\_name HABITLY, `display: standalone`, `start_url` dan `scope` mengikuti base path `/habitly/`, `theme_color`, `background_color`, ikon 192, 512, dan maskable 512.
- **Update:** `registerType: prompt`. Saat ada versi baru muncul pemberitahuan Muat ulang. Update aplikasi tidak menyentuh data IndexedDB.
- **Offline:** tidak ada request ke server mana pun saat dipakai. Font dipasang lokal (`@fontsource`), tidak memakai CDN. Indikator Offline kecil di header, tanpa membatasi fitur.
- **Router:** `HashRouter`, supaya refresh di halaman mana pun tidak 404 di GitHub Pages dan tetap jalan offline.
- **Pasang di Android:** Chrome, menu Install app atau Tambahkan ke layar utama. **Laptop:** ikon install di address bar Chrome atau Edge. iPhone bukan target.
- **Syarat teknis:** HTTPS (disediakan GitHub Pages) dan service worker terdaftar.
- **Penyimpanan persisten:** panggil `navigator.storage.persist()` saat pertama kali dan tampilkan hasilnya di Settings, untuk memperkecil risiko data dibersihkan browser.
- **Cara uji:** DevTools > Application > Service Workers dengan opsi Offline, Lighthouse untuk installability, lalu di HP: buka sekali saat online, aktifkan mode pesawat, buka lagi dan coba catat kebiasaan.

## 7. Penyimpanan Data (IndexedDB)

Database `habitly-db` memakai Dexie.js, skema versi 1, dan `useLiveQuery` supaya tampilan ikut berubah saat data berubah.

| Store | Key | Index | Isi utama |
| --- | --- | --- | --- |
| `habits` | `id` (uuid) | `categoryId`, `isArchived` | name, description, habitType, targetValue, targetUnit, frequency, scheduledDays, color, icon, isArchived, archivedAt, startDate, createdAt, updatedAt |
| `habit_logs` | `id` (uuid) | unik `[habitId+logDate]`, `logDate` | habitId, logDate, status, value, notes, createdAt, updatedAt |
| `categories` | `id` (uuid) | `name` | name, isDefault, createdAt |
| `settings` | `key` | - | displayName, theme, lastBackupAt |

Aturan:

- `id` dibuat dengan `crypto.randomUUID()`.
- Tanpa constraint database, aturan dijaga di service layer: status hanya `completed` atau `skipped`; `scheduledDays` berisi angka 1 sampai 7 (1 = Senin, 7 = Minggu) dan wajib terisi untuk `selected_days`; kebiasaan measurable wajib punya `targetValue`.
- Operasi berantai memakai transaksi Dexie: hapus kebiasaan sekaligus log-nya; hapus kategori sekaligus mengosongkan `categoryId` pada kebiasaan; log ganda dicegah oleh unique index dan upsert.
- Kategori bawaan dibuat sekali saat pertama kali, tidak diulang jika sudah ada.
- Perubahan skema lewat `db.version(n).stores().upgrade()`. Nomor skema ikut ditulis di file backup.
- Komponen tidak memanggil Dexie langsung; semua akses lewat `services/`.

## 8. Backup dan Restore

### 8.1 Export

- Menghasilkan satu file JSON `habitly-backup-YYYY-MM-DD.json` lewat Blob, jadi jalan offline. Di Android, tawarkan juga Share (Web Share API) bila didukung, supaya mudah disimpan ke Google Drive.
- Struktur: `{ app: 'habitly', schemaVersion, exportedAt, data: { categories, habits, habit_logs, settings } }`.
- Setelah berhasil, `lastBackupAt` dicatat.

### 8.2 Restore

1. Pilih file backup.
2. Validasi: `app` bernilai habitly, `schemaVersion` tidak lebih baru dari aplikasi, struktur dan tipe data benar, setiap log merujuk ke kebiasaan yang ada, status dan `scheduledDays` valid. File tidak valid ditolak dengan pesan jelas, data tidak diubah.
3. Tampilkan ringkasan: tanggal backup, jumlah kebiasaan, jumlah log, rentang tanggal.
4. Pilih mode. **Ganti semua data** (default): wajib konfirmasi, dan aplikasi menawarkan mengunduh backup data saat ini lebih dulu. **Gabung**: data dengan id sama memakai versi `updatedAt` terbaru, data baru ditambahkan, log yang bentrok pada habitId + logDate diselesaikan dengan `updatedAt` terbaru.
5. Seluruh proses berjalan dalam satu transaksi. Jika gagal, data lama tidak berubah.

### 8.3 Pengingat dan alur pakai

- Banner di Dashboard muncul jika belum pernah backup atau `lastBackupAt` lebih dari 7 hari lalu; bisa ditutup.
- Pindah data antar perangkat: Export di perangkat asal, kirim file ke perangkat tujuan, Restore. Pakai mode Gabung jika kedua perangkat sama-sama punya data baru.
- Simpan file backup di tempat gratis di luar perangkat, misalnya Google Drive atau email ke diri sendiri.

## 9. Teknologi (Semua Gratis)

| Teknologi | Fungsi | Biaya |
| --- | --- | --- |
| React.js + Vite | Antarmuka dan build tool | Rp0 |
| Tailwind CSS | Styling dan responsive | Rp0 |
| React Router (HashRouter) | Navigasi antarhalaman | Rp0 |
| Dexie.js + dexie-react-hooks | Pembungkus IndexedDB dan data reaktif | Rp0 |
| vite-plugin-pwa (Workbox) | Manifest, service worker, caching offline | Rp0 |
| Recharts | Grafik statistik | Rp0 |
| Lucide React | Ikon | Rp0 |
| date-fns | Operasi tanggal | Rp0 |
| @fontsource | Font yang dilayani lokal, tanpa CDN | Rp0 |
| Vitest + fake-indexeddb | Unit test perhitungan dan data layer | Rp0 |
| Git, GitHub, GitHub Actions | Version control, build, dan deploy otomatis | Rp0 |
| GitHub Pages | Hosting HTTPS tanpa membeli domain | Rp0 (repo publik) |

Tidak ada API berbayar, tidak ada database cloud, dan tidak ada layanan yang memerlukan kartu kredit.

## 10. Deploy ke GitHub Pages

1. Buat repo publik `habitly`. GitHub Pages gratis untuk repo publik; data kebiasaan tersimpan di perangkat, bukan di repo, jadi aman.
2. Di `vite.config.js` set `base: '/habitly/'`.
3. Tambah workflow `.github/workflows/deploy.yml`: checkout, setup Node, `npm ci`, `npm run build`, upload folder `dist`, lalu deploy dengan `actions/deploy-pages`.
4. Di repo: Settings > Pages > Source: GitHub Actions.
5. Setiap push ke `main` otomatis deploy. Alamat aplikasi: `https://jerry-sutisno.github.io/habitly/`.
6. Buka alamat itu sekali di laptop dan di HP saat online, tunggu caching selesai, lalu pasang aplikasinya.

Catatan penting:

- IndexedDB terikat ke origin `jerry-sutisno.github.io`, jadi nama database harus unik (`habitly-db`) agar tidak bentrok dengan situs GitHub Pages lain di akun yang sama.
- Mengganti username GitHub mengubah origin dan data tidak ikut pindah. Mengganti nama repo mengubah alamat dan aplikasi harus dipasang ulang. Lakukan backup sebelum perubahan semacam itu.

## 11. Desain UI/UX

**Arah desain:** Modern Minimalist ala produk SaaS profesional, mobile-first.

- Layout bersih, kartu statistik dengan hierarki jelas, warna utama hijau dengan warna netral, ikon Lucide yang seragam.
- Light, Dark, dan System; warna `theme-color` mengikuti tema.
- Area sentuh minimal 44 px, bottom navigation yang mudah dijangkau jempol, dan jarak aman untuk notch dan gesture bar (`env(safe-area-inset-*)`) pada mode standalone.
- Checklist harian harus bisa diselesaikan dalam sedikit ketukan, karena ini layar yang paling sering dibuka.
- Wajib ada loading state, empty state, error state, dan konfirmasi sebelum menghapus data.
- Indikator Offline yang tidak mengganggu dan tombol Install yang jelas di Settings.
- Status tidak hanya dibedakan dengan warna; selalu sertakan label atau ikon.
- Jangan menampilkan terlalu banyak grafik sekaligus; informasi terpenting tampil lebih dulu.

## 12. Struktur Folder

```text
habitly/
├── .github/workflows/deploy.yml
├── public/
│   ├── icons/                # 192, 512, maskable-512, apple-touch-icon
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── dashboard/
│   │   ├── habits/
│   │   ├── charts/
│   │   └── settings/
│   ├── layouts/
│   │   └── AppLayout.jsx
│   ├── pages/
│   │   ├── DashboardPage.jsx
│   │   ├── HabitsPage.jsx
│   │   ├── CalendarPage.jsx
│   │   ├── AnalyticsPage.jsx
│   │   └── SettingsPage.jsx
│   ├── db/                   # db.js (Dexie), seed.js, migrasi
│   ├── services/             # habit, log, category, settings, backup
│   ├── hooks/
│   ├── pwa/                  # registrasi SW, install prompt, status online
│   ├── utils/                # date, progress, streak, calendar, analytics, validation
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js            # base path + konfigurasi PWA
├── package.json
├── .gitignore
└── README.md
```

Rumus progress, streak, kalender, dan analytics ditulis sebagai fungsi murni di `utils/` dan dites dengan Vitest, karena bagian ini paling rawan bug. Logika backup/restore dan operasi database dites dengan `fake-indexeddb`.

## 13. Roadmap

Selesaikan dan uji satu fase sebelum lanjut.

### Phase 1: UI/UX Design

- [ ] Warna, font, dan design system (light dan dark).
- [ ] Wireframe Dashboard, My Habits, Calendar, Analytics, Settings.
- [ ] Layout laptop (sidebar) dan HP (bottom navigation).

### Phase 2: Setup dan Frontend (data dummy lewat `services/`)

- [ ] Project Vite + React, Tailwind, React Router (HashRouter).
- [ ] Komponen reusable dan semua halaman utama.
- [ ] Responsive laptop dan HP.

### Phase 3: Fungsi Perhitungan

- [ ] Tulis `utils/` untuk tanggal lokal, progress, streak, status kalender, dan analytics.
- [ ] Unit test Vitest untuk kasus tepi: hari tak terjadwal, skipped, hari ini belum selesai, penyebut 0, mulai dari `startDate`, pergantian hari.

### Phase 4: Data Layer IndexedDB

- [ ] Skema Dexie, seed kategori bawaan, dan aturan validasi.
- [ ] Services untuk habit, log, kategori, dan settings, termasuk transaksi hapus.
- [ ] Test data layer dengan `fake-indexeddb`, lalu ganti data dummy dengan data asli.

### Phase 5: Fitur Inti

- [ ] CRUD kebiasaan (tambah, edit, arsip, hapus).
- [ ] Checklist harian dengan upsert dan hapus log.
- [ ] Progress, streak, kalender, dan analytics dari data asli.
- [ ] Tema Light, Dark, System dan pengaturan nama panggilan.

### Phase 6: Backup dan Restore

- [ ] Export JSON dan Share di Android.
- [ ] Import dengan validasi, ringkasan, mode Ganti dan Gabung, dalam satu transaksi.
- [ ] Pengingat backup di Dashboard.
- [ ] Test round-trip: export lalu import menghasilkan data yang sama.

### Phase 7: PWA dan Offline

- [ ] Manifest dan ikon (192, 512, maskable).
- [ ] Service worker, precache, dan notifikasi update.
- [ ] Tombol Install, indikator Offline, permintaan penyimpanan persisten.
- [ ] Uji offline di DevTools dan Lighthouse installability.

### Phase 8: Deploy dan Uji di Perangkat

- [ ] Repo publik, `base: '/habitly/'`, workflow GitHub Actions, aktifkan Pages.
- [ ] Pasang di laptop dan di HP Android.
- [ ] Uji mode pesawat: buka aplikasi, catat kebiasaan, tutup dan buka lagi.
- [ ] Uji backup di satu perangkat dan restore di perangkat lain.
- [ ] Tulis README (fitur, teknologi, cara pasang, cara backup, link demo, screenshot).

## 14. Standar Siap Pakai

- Semua halaman bisa dibuka dan dinavigasi di laptop dan HP.
- Aplikasi bisa dipasang di layar utama Android dan di laptop.
- Setelah dibuka sekali saat online, aplikasi terbuka dan berfungsi penuh saat offline.
- Data tetap ada setelah aplikasi ditutup dan perangkat dihidupkan ulang.
- Checklist tidak membuat log ganda.
- Progress, streak, kalender, dan grafik memakai data sebenarnya dan sesuai aturan bagian 4.
- Tanggal hari ini benar di zona waktu perangkat, termasuk saat pergantian hari.
- Export lalu Restore mengembalikan data yang sama persis; file rusak ditolak tanpa mengubah data.
- Tidak ada request ke layanan berbayar atau server eksternal saat aplikasi dipakai.
- Tidak ada tombol utama yang hanya menjadi pajangan.
- README lengkap.

## 15. Batasan dan Risiko

| Risiko | Penyebab | Mitigasi |
| --- | --- | --- |
| Data hilang | Browser data dibersihkan, aplikasi dicopot, atau HP rusak/hilang | Backup rutin, pengingat 7 hari, simpan file di Google Drive |
| Data dihapus otomatis browser | Penyimpanan tidak persisten saat memori penuh | Minta `navigator.storage.persist()` dan tampilkan status di Settings |
| Data tidak muncul di perangkat lain | Tidak ada sinkronisasi | Pindah manual lewat Export dan Restore (mode Gabung) |
| Data tidak ikut saat alamat berubah | Origin atau nama repo diganti | Jangan ganti username/nama repo; backup dulu jika terpaksa |
| Data tidak tersimpan | Mode penyamaran/incognito | Pakai jendela browser biasa atau aplikasi yang sudah dipasang |
| Tampilan lama setelah update | Service worker menyimpan versi lama | Notifikasi Muat ulang saat versi baru tersedia |
| Pengingat harian tidak ada | Notifikasi andal di web butuh server push | Di luar v1; pakai alarm HP sementara |

## 16. Pengembangan Lanjutan (di luar v1)

Ekspor CSV, target mingguan dan bulanan, badges, enkripsi file backup dengan password (Web Crypto), kunci PIN, auto-backup ke folder di laptop (File System Access API), dan pengingat harian.

## 17. Definisi Singkat

HABITLY adalah aplikasi web Habit Tracker pribadi yang berjalan sepenuhnya di perangkat sebagai PWA: tanpa login dan tanpa server, data tersimpan di IndexedDB, bisa dipakai offline, bisa di-backup dan di-restore lewat file JSON, dan di-hosting gratis di GitHub Pages. Dibuat dengan React, Vite, Tailwind CSS, dan Dexie.js, dengan biaya Rp0.

---

**Catatan pengerjaan:** Selesaikan satu fase dan uji sebelum lanjut. Prioritaskan aplikasi yang benar-benar berfungsi di HP dan laptop dibanding banyak fitur yang belum matang.
