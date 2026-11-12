import React from 'react';
import { Share2, Sun, Moon } from 'lucide-react';

export default function AnalyticsHeader({
  timeRange = '7d',
  onSelectTimeRange,
  theme,
  onToggleTheme,
}) {
  const timeOptions = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Title & Subtitle */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-[#9ce3be]">
          Your Progress
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Analytics
        </h1>
      </div>

      {/* Action Controls: Filter Pills, Theme Toggle, Share */}
      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
        {/* Time Filter Pills */}
        <div className="inline-flex p-1 bg-slate-100 dark:bg-[#1B2129] rounded-full border border-slate-200/80 dark:border-[#2A323D] gap-1 shadow-sm">
          {timeOptions.map((opt) => {
            const isActive = timeRange === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelectTimeRange(opt.id)}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {/* Light/Dark Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs font-medium shadow-sm min-h-[36px]"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600" />
            )}
            <span className="hidden sm:inline">
              {theme === 'dark' ? 'Light' : 'Dark'}
            </span>
          </button>

          {/* Share Button (Stitch action) */}
          <button
            type="button"
            aria-label="Share Analytics"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Habitly Analytics',
                  text: 'Lihat progres konsistensi kebiasaan saya di Habitly!',
                  url: window.location.href,
                }).catch(() => {});
              } else {
                alert('Tautan ringkasan analitik disalin ke clipboard!');
              }
            }}
            className="w-9 h-9 rounded-full bg-white dark:bg-[#1B2129] border border-slate-200/80 dark:border-[#2A323D] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 flex items-center justify-center transition-all shadow-sm active:scale-95"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
