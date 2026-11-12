import React from 'react';
import { Heart, Sparkles, Compass } from 'lucide-react';

export default function QuietSanctuaryCallout() {
  return (
    <div className="rounded-2xl border border-emerald-500/20 dark:border-emerald-500/25 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50 dark:from-[#15241e] dark:via-[#1B2129] dark:to-[#141d1a] p-5 sm:p-6 shadow-sm">
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-[#54C28E] flex items-center justify-center shrink-0 mt-0.5">
          <Heart className="w-5 h-5" />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-[#9ce3be]">
              Refleksi Konsistensi
            </h4>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </div>

          <p className="text-sm font-medium italic text-slate-700 dark:text-slate-300 leading-relaxed">
            &ldquo;Konsistensi bertumbuh dari ketenangan dan kebaikan pada diri sendiri, bukan dari tuntutan kesempurnaan. Setiap langkah kecil yang Anda ambil hari ini adalah kemajuan nyata.&rdquo;
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Fokus pada ritme kebiasaan harian, bukan sekadar skor angka.
          </p>
        </div>
      </div>
    </div>
  );
}
