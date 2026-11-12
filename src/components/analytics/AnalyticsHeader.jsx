import React from 'react';
import { Share2, Sun, Moon } from 'lucide-react';
import { id as i18n } from '../../i18n/id';

export default function AnalyticsHeader({
  timeRange = '7d',
  onSelectTimeRange,
  theme,
  onToggleTheme,
}) {
  const timeOptions = [
    { id: '7d', label: i18n.analytics.timeOptions['7d'] },
    { id: '30d', label: i18n.analytics.timeOptions['30d'] },
    { id: '90d', label: i18n.analytics.timeOptions['90d'] },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Title & Subtitle */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-[#9ce3be]">
          {i18n.analytics.progressBadge}
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {i18n.analytics.title}
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
            aria-label={theme === 'dark' ? i18n.common.lightMode : i18n.common.darkMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs font-medium shadow-sm min-h-[36px]"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600" />
            )}
            <span className="hidden sm:inline">
              {theme === 'dark' ? i18n.common.lightMode : i18n.common.darkMode}
            </span>
          </button>

          {/* Share Button (Stitch action) */}
          <button
            type="button"
            aria-label={i18n.common.share}
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `${i18n.common.appName} ${i18n.analytics.title}`,
                  text: 'Lihat progres konsistensi kebiasaan saya di Habitly!',
                  url: window.location.href,
                }).catch(() => {});
              } else {
                alert(i18n.analytics.shareSuccessAlert);
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
