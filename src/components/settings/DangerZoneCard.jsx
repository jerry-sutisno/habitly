import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { id as i18n } from '../../i18n/id';

export default function DangerZoneCard({ onResetClick }) {
  return (
    <div className="bg-white dark:bg-[#1B2129] rounded-2xl border border-rose-200/80 dark:border-rose-950/60 p-5 sm:p-6 shadow-sm space-y-3">
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
          {i18n.settings.dangerZoneTag}
        </span>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
          {i18n.settings.dangerZoneTitle}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          {i18n.settings.dangerZoneDesc}
        </p>
      </div>

      <button
        type="button"
        onClick={onResetClick}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 text-xs sm:text-sm font-bold active:scale-[0.98] transition-all"
      >
        <Trash2 className="w-4 h-4" />
        <span>{i18n.settings.deleteDataButton}</span>
      </button>
    </div>
  );
}
