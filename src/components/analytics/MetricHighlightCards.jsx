import React from 'react';
import { Flame, CheckCircle2, Award, CalendarCheck } from 'lucide-react';

export default function MetricHighlightCards({
  bestHabit,
  mostConsistentDay,
  stats,
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {/* Card 1: Best Habit */}
      <div className="bg-white dark:bg-[#1B2129] rounded-2xl border border-slate-200/80 dark:border-[#2A323D] p-4 sm:p-5 shadow-sm flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-[#54C28E] flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 fill-emerald-500/20" />
          </div>
          <span className="text-[10px] font-bold text-emerald-800 dark:text-[#9ce3be] bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">
            Top
          </span>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Best Habit
          </span>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
            {bestHabit?.name || 'Morning Meditation'}
          </h3>
        </div>

        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-[#54C28E]">
          <Flame className="w-4 h-4" />
          <span>{bestHabit?.streak || 18} day streak</span>
        </div>
      </div>

      {/* Card 2: Most Consistent Day */}
      <div className="bg-white dark:bg-[#1B2129] rounded-2xl border border-slate-200/80 dark:border-[#2A323D] p-4 sm:p-5 shadow-sm flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-500/20 px-2 py-0.5 rounded-full uppercase">
            Peak
          </span>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Most Consistent
          </span>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
            {mostConsistentDay?.day || 'Tuesdays'}
          </h3>
        </div>

        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300">
          <CheckCircle2 className="w-4 h-4" />
          <span>{mostConsistentDay?.description || '94% avg rate'}</span>
        </div>
      </div>

      {/* Card 3: Perfect Days */}
      <div className="bg-white dark:bg-[#1B2129] rounded-2xl border border-slate-200/80 dark:border-[#2A323D] p-4 sm:p-5 shadow-sm flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase">
            100%
          </span>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Perfect Days
          </span>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
            {stats?.perfectDays || 3} Hari Sempurna
          </h3>
        </div>

        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
          <span>Semua habit tercapai</span>
        </div>
      </div>

      {/* Card 4: Total Check-ins */}
      <div className="bg-white dark:bg-[#1B2129] rounded-2xl border border-slate-200/80 dark:border-[#2A323D] p-4 sm:p-5 shadow-sm flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-indigo-800 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase">
            Aktivitas
          </span>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Check-ins
          </span>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
            {stats?.totalCheckins || 28} Kali Selesai
          </h3>
        </div>

        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400">
          <span>Aktif tercatat</span>
        </div>
      </div>
    </div>
  );
}
