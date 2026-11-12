import React from 'react';
import { Leaf, Sparkles } from 'lucide-react';

export default function FocusMetricBanner({ metrics }) {
  const {
    percentage = 86,
    completed = 6,
    total = 8,
    summary = '6 of 8 completed today • Calm pace',
    headline = 'Weekly Focus: 86%',
  } = metrics || {};

  return (
    <div className="w-full bg-white dark:bg-[#14181D] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-[#2A323D] shadow-sm flex items-center justify-between gap-4">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 dark:bg-[#203a2e] text-emerald-700 dark:text-[#54C28E] border border-emerald-500/20 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight truncate">
            {headline}
          </p>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {summary}
          </p>
        </div>
      </div>

      {/* Circular SVG Mini Progress */}
      <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
        <svg className="w-12 h-12 -rotate-90 transform" viewBox="0 0 36 36">
          <path
            className="text-slate-100 dark:text-[#222933]"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
          />
          <path
            className="text-emerald-600 dark:text-[#54C28E] transition-all duration-700 ease-out"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeDasharray={`${percentage}, 100`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-[11px] font-bold text-emerald-700 dark:text-[#54C28E]">
          {percentage}%
        </span>
      </div>
    </div>
  );
}
