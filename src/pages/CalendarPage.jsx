import React from 'react';
import { Calendar } from 'lucide-react';

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Calendar
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Riwayat visual status harian dan fitur pencatatan retroaktif hingga 7 hari lalu.
        </p>
      </header>

      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center bg-white/50 dark:bg-slate-900/50">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-4">
          <Calendar className="h-7 w-7" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          Halaman Calendar Kosong
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          Kerangka proyek telah aktif. Tampilan grid kalender bulanan dan modal detail tanggal akan diintegrasikan pada fase berikutnya.
        </p>
      </div>
    </div>
  );
}
