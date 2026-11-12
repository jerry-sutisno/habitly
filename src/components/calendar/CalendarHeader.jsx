import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sun, Moon } from 'lucide-react';

export default function CalendarHeader({
  monthName = 'October 2024',
  onPrevMonth,
  onNextMonth,
  onJumpToday,
  theme,
  onToggleTheme,
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Month Navigator */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start min-w-0">
        <button
          type="button"
          aria-label="Previous month"
          onClick={onPrevMonth}
          className="w-9 h-9 rounded-full bg-white dark:bg-[#1B2129] border border-slate-200/80 dark:border-[#2A323D] text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#222933] flex items-center justify-center transition-colors shadow-sm shrink-0"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 px-2 min-w-0 flex-1 sm:flex-initial sm:min-w-[170px] text-center truncate">
          {monthName}
        </h1>

        <button
          type="button"
          aria-label="Next month"
          onClick={onNextMonth}
          className="w-9 h-9 rounded-full bg-white dark:bg-[#1B2129] border border-slate-200/80 dark:border-[#2A323D] text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#222933] flex items-center justify-center transition-colors shadow-sm shrink-0"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Action Buttons: Jump to Today & Theme Toggle */}
      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
        {/* Dark/Light mode toggle */}
        <button
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="flex items-center gap-2 px-3 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs font-medium shadow-sm min-h-[40px]"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="h-4 w-4 text-amber-400" />
              <span className="hidden sm:inline">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-slate-600" />
              <span className="hidden sm:inline">Dark Mode</span>
            </>
          )}
        </button>

        {/* Jump to Today Button */}
        <button
          type="button"
          onClick={onJumpToday}
          className="px-4 py-2 rounded-full bg-emerald-50 dark:bg-[#203a2e] text-emerald-800 dark:text-[#9ce3be] border border-emerald-500/25 text-xs font-bold tracking-tight flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 min-h-[40px]"
        >
          <CalendarIcon className="h-3.5 w-3.5" />
          <span>Hari Ini</span>
        </button>
      </div>
    </div>
  );
}
