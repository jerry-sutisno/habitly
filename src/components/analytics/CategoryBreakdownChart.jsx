import React from 'react';
import { Layers } from 'lucide-react';

export default function CategoryBreakdownChart({ categoryData = [] }) {
  if (categoryData.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1B2129] rounded-2xl border border-slate-200/80 dark:border-[#2A323D] p-5 sm:p-6 shadow-sm space-y-3 text-center">
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#14181D] text-slate-400 mx-auto flex items-center justify-center">
          <Layers className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Belum Ada Kategori Aktif
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
          Kategori kebiasaan yang Anda jalani akan dianalisis di sini setelah Anda mulai membuat kebiasaan.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1B2129] rounded-2xl border border-slate-200/80 dark:border-[#2A323D] p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-[#54C28E] flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Kategori Kebiasaan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tingkat keberhasilan berdasarkan area fokus
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3.5 pt-1">
        {categoryData.map((cat, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {cat.name}
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {cat.rate}% ({cat.completed}/{cat.total})
              </span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${cat.rate}%`,
                  backgroundColor: cat.fill || '#006a46',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
