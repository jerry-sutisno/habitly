import React from 'react';
import { Plus, Sun, Moon } from 'lucide-react';
import { id as i18n } from '../../i18n/id';

export default function HabitsHeader({
  activeCount = 8,
  theme,
  onToggleTheme,
  onOpenAddModal,
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 sm:gap-4 w-full min-w-0">
      {/* Title & Subtitle */}
      <div className="flex flex-col min-w-0 max-w-full">
        <span className="text-xs uppercase tracking-wider text-emerald-800 dark:text-[#54C28E] font-bold">
          {i18n.habits.rhythmBadge}
        </span>
        <div className="flex items-center gap-2 sm:gap-3 mt-0.5 flex-wrap min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate">
            {i18n.habits.title}
          </h1>
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-50 dark:bg-[#203a2e] text-emerald-800 dark:text-[#9ce3be] border border-emerald-500/20 text-xs font-semibold shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-[#54C28E] animate-pulse"></span>
            <span>{i18n.habits.activeCountBadge(activeCount)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons: Theme Toggle & Add Habit */}
      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
        {/* Dark/Light mode toggle */}
        <button
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="flex items-center gap-2 px-3 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-xs font-medium shadow-sm min-h-[44px]"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="h-4 w-4 text-amber-400" />
              <span className="hidden sm:inline">{i18n.common.lightMode}</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-slate-600" />
              <span className="hidden sm:inline">{i18n.common.darkMode}</span>
            </>
          )}
        </button>

        {/* Add Habit CTA Button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-400 dark:hover:bg-emerald-300 text-white dark:text-slate-950 font-bold text-sm shadow-md shadow-emerald-700/20 dark:shadow-emerald-400/20 transition-all active:scale-95 min-h-[44px]"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>{i18n.habits.newHabitButton}</span>
        </button>
      </div>
    </div>
  );
}
