import React from 'react';
import { TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';

export default function MonthlyRhythmBanner({
  consistencyRate = 82,
  activeDaysLogged = 22,
  trendText = '+4%',
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-5 sm:p-6 text-white shadow-md shadow-emerald-900/10">
      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-emerald-300/20 blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Headline & description */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="h-3 w-3 text-emerald-200" />
              Ritme Konsistensi Bulanan
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-400/30 text-xs font-medium text-emerald-100">
              <TrendingUp className="h-3 w-3" />
              {trendText} vs bln lalu
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {consistencyRate}% <span className="text-lg font-medium text-emerald-100">Konsistensi</span>
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" />
            <span>
              <strong>{activeDaysLogged} hari aktif</strong> berhasil tercatat dengan baik sepanjang bulan ini.
            </span>
          </p>
        </div>

        {/* Right Side: Progress Meter Bar */}
        <div className="w-full md:w-56 space-y-2 bg-black/10 dark:bg-black/20 p-3 rounded-xl backdrop-blur-sm border border-white/10">
          <div className="flex justify-between text-xs font-semibold text-emerald-100">
            <span>Pencapaian Ritme</span>
            <span>{consistencyRate}%</span>
          </div>
          <div className="h-2.5 w-full bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-300 to-teal-200 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${consistencyRate}%` }}
            />
          </div>
          <p className="text-[11px] text-emerald-200/80 text-right">
            Target: 80% per bulan
          </p>
        </div>
      </div>
    </div>
  );
}
