import React, { useState } from 'react';
import HabitCard from './HabitCard';
import { CheckCircle2, Plus } from 'lucide-react';
import { id as i18n } from '../../i18n/id';

export default function HabitChecklist({ habits = [], onToggleHabit, onAddHabitClick }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'completed'

  const completedCount = habits.filter((h) => h.status === 'completed').length;
  const totalCount = habits.length;

  const filterTabs = [
    { key: 'all', label: 'Semua' },
    { key: 'pending', label: 'Tertunda' },
    { key: 'completed', label: 'Selesai' },
  ];

  const filteredHabits = habits.filter((h) => {
    if (filter === 'completed') return h.status === 'completed';
    if (filter === 'pending') return h.status === 'pending';
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Section Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 flex-wrap min-w-0">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate">
            {i18n.dashboard.checklistTitle}
          </h2>
          <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-[#203a2e] text-emerald-800 dark:text-[#9ce3be] border border-emerald-500/20 text-xs font-semibold shrink-0">
            {completedCount} dari {totalCount} selesai
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-[#1B2129] border border-slate-200/80 dark:border-[#2A323D] p-1 rounded-full text-xs font-medium self-start sm:self-auto">
          {filterTabs.map((tab) => {
            const isActive = filter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`px-3.5 py-1.5 rounded-full transition-all ${
                  isActive
                    ? 'bg-white dark:bg-[#222933] text-emerald-700 dark:text-[#54C28E] border border-emerald-500/20 shadow-sm font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Habit List */}
      <div className="flex flex-col gap-3">
        {filteredHabits.length > 0 ? (
          filteredHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={onToggleHabit}
            />
          ))
        ) : habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 sm:p-10 rounded-2xl border-2 border-dashed border-slate-200 dark:border-[#2A323D] bg-white/40 dark:bg-[#14181D]/40 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-[#203a2e] text-emerald-600 dark:text-[#54C28E] flex items-center justify-center mb-3">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {i18n.dashboard.emptyHabitsTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs leading-relaxed">
              {i18n.dashboard.emptyHabitsSubtitle}
            </p>
            {onAddHabitClick && (
              <button
                type="button"
                onClick={onAddHabitClick}
                className="mt-4 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{i18n.dashboard.addNewHabitAction}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-[#2A323D] bg-white/50 dark:bg-[#14181D]/50 text-slate-400 text-sm">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            Tidak ada kebiasaan pada filter ini.
          </div>
        )}
      </div>
    </div>
  );
}
