import React from 'react';
import { Flame, CheckSquare } from 'lucide-react';
import { id as i18n } from '../../i18n/id';

export default function StatsCards({ stats }) {
  const {
    streakDays = 0,
    personalBest = 0,
    totalActiveHabits = 0,
    scheduledToday = 0,
  } = stats || {};

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Current Streak */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#14181D] border border-slate-200/80 dark:border-[#2A323D] shadow-sm flex flex-col justify-between gap-4 transition-all hover:border-emerald-500/30">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            {i18n.dashboard.dailyStreak}
          </span>
          <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-[#203a2e] text-emerald-700 dark:text-[#54C28E] border border-emerald-500/20 flex items-center justify-center">
            <Flame className="h-4 w-4 fill-current" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {streakDays}
            </span>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {i18n.common.daysSuffix}
            </span>
          </div>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 font-medium">
            {i18n.dashboard.personalBest}: {personalBest} {i18n.common.daysSuffix}
          </p>
        </div>
      </div>

      {/* Total Active Habits */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#14181D] border border-slate-200/80 dark:border-[#2A323D] shadow-sm flex flex-col justify-between gap-4 transition-all hover:border-emerald-500/30">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            Total Kebiasaan
          </span>
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#222933] text-slate-600 dark:text-emerald-400 border border-slate-200 dark:border-[#2A323D] flex items-center justify-center">
            <CheckSquare className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {totalActiveHabits}
            </span>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Aktif
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {scheduledToday} terjadwal hari ini
          </p>
        </div>
      </div>
    </div>
  );
}
