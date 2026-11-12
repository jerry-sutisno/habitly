import React from 'react';
import { Plus, Sun, Moon } from 'lucide-react';
import { id as i18n } from '../../i18n/id';

export default function GreetingHeader({
  profile,
  theme,
  onToggleTheme,
  onAddHabit,
}) {
  return (
    <div className="flex flex-col xl:flex-row items-start xl:items-end justify-between gap-4">
      {/* Greeting info */}
      <div className="flex flex-col gap-1 max-w-xl">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
            {profile.cadenceText || i18n.dashboard.cadenceText}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {i18n.dashboard.defaultGreeting}, {profile.name}
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
          {profile.greetingSubtitle || i18n.dashboard.greetingSubtitle}
        </p>
      </div>

      {/* Action Buttons: Theme Toggle & Add Habit */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
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

        {/* Quick Add Habit Button */}
        <button
          onClick={onAddHabit}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-400 dark:hover:bg-emerald-300 text-white dark:text-slate-950 font-semibold text-sm shadow-md shadow-emerald-700/20 dark:shadow-emerald-400/20 transition-all active:scale-95 min-h-[44px]"
        >
          <Plus className="h-4 w-4" />
          <span>{i18n.dashboard.addHabitButton}</span>
        </button>
      </div>
    </div>
  );
}
