import React, { useState } from 'react';
import {
  Check,
  Circle,
  Clock,
  Sparkles,
  Droplets,
  BookOpen,
  Footprints,
  Moon,
  Coffee,
  PhoneOff,
  Dumbbell,
  Activity,
  MoreVertical,
  Trash2,
  Archive,
  ArchiveRestore,
  Edit2,
} from 'lucide-react';
import { id as i18n } from '../../i18n/id';

const ICON_MAP = {
  Sparkles,
  Droplets,
  BookOpen,
  Footprints,
  Moon,
  Coffee,
  PhoneOff,
  Dumbbell,
};

export default function HabitListCard({
  habit,
  onToggle,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const isCompleted = habit.status === 'completed';
  const IconComponent = ICON_MAP[habit.icon] || Activity;

  const frequencyLabel =
    habit.frequency === 'daily'
      ? i18n.habits.dailyFrequency
      : habit.scheduledDays?.length === 5 && !habit.scheduledDays?.includes(6) && !habit.scheduledDays?.includes(7)
      ? i18n.habits.weekdayFrequency
      : i18n.habits.daysPerWeekFrequency(habit.scheduledDays?.length || 0);

  return (
    <div className="habit-item group bg-white dark:bg-[#14181D] p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-[#2A323D] shadow-sm transition-all duration-200 hover:shadow-md hover:border-emerald-500/30 flex items-center justify-between gap-3 relative min-w-0">
      {/* Habit Info & Icon */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        <div
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 border ${
            isCompleted
              ? 'bg-emerald-50 text-emerald-700 dark:bg-[#203a2e] dark:text-[#54C28E] border-emerald-500/20'
              : 'bg-slate-100 text-slate-600 dark:bg-[#222933] dark:text-emerald-400 border-slate-200 dark:border-[#2A323D]'
          }`}
        >
          <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`text-sm sm:text-base font-semibold truncate transition-colors ${
                isCompleted
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {habit.name}
            </span>
          </div>

          {/* Badges Row */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 flex-wrap">
            {/* Category */}
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-[#203a2e] text-emerald-800 dark:text-[#9ce3be] border border-emerald-500/20 text-[10px] sm:text-[11px] font-semibold">
              {habit.category}
            </span>

            {/* Frequency */}
            <span className="text-slate-500 dark:text-[#94A3B8] text-[10px] sm:text-[11px] flex items-center gap-1 font-medium">
              <Clock className="h-3 w-3" />
              <span>{frequencyLabel}</span>
            </span>

            {/* Measurable Target or Streak */}
            {habit.habitType === 'measurable' && (
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#222933] text-teal-700 dark:text-teal-400 text-[10px] sm:text-[11px] font-semibold">
                {i18n.habits.targetLabel(habit.targetValue, habit.targetUnit)}
              </span>
            )}

            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#222933] text-emerald-700 dark:text-emerald-400 text-[10px] sm:text-[11px] font-semibold flex items-center gap-1">
              <span>🌿</span>
              <span>{i18n.habits.streakBadge(habit.streak || 0)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right Actions: Context Menu & Status Toggle Button */}
      <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
        {/* Context Menu Button */}
        <div className="relative">
          <button
            type="button"
            aria-label={i18n.habits.optionsAriaLabel}
            onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#222933] flex items-center justify-center transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-10 w-40 bg-white dark:bg-[#1B2129] border border-slate-200 dark:border-[#2A323D] rounded-xl shadow-lg z-30 py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
              {/* Edit Habit */}
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  onEdit?.(habit);
                }}
                className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#222933] flex items-center gap-2"
              >
                <Edit2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{i18n.habits.editHabit}</span>
              </button>

              {/* Archive / Unarchive */}
              {habit.isArchived ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onUnarchive?.(habit.id);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#222933] flex items-center gap-2"
                >
                  <ArchiveRestore className="h-3.5 w-3.5 text-teal-500" />
                  <span>{i18n.habits.unarchiveHabit}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onArchive?.(habit.id);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#222933] flex items-center gap-2"
                >
                  <Archive className="h-3.5 w-3.5 text-slate-400" />
                  <span>{i18n.habits.archiveHabit}</span>
                </button>
              )}

              {/* Delete with confirmation */}
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  onDelete?.(habit.id, habit.name);
                }}
                className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
              >
                <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                <span>{i18n.habits.deleteHabit}</span>
              </button>
            </div>
          )}
        </div>

        {/* Status Toggle Button */}
        {!habit.isArchived && (
          <button
            type="button"
            aria-label={`Tandai selesai ${habit.name}`}
            onClick={() => onToggle?.(habit.id)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm active:scale-95 min-h-[44px] min-w-[44px] ${
              isCompleted
                ? 'bg-emerald-700 dark:bg-emerald-400 text-white dark:text-slate-950 shadow-emerald-700/20'
                : 'border-2 border-slate-300 dark:border-slate-700 text-transparent hover:border-emerald-500 hover:text-emerald-500 dark:hover:border-emerald-400'
            }`}
          >
            {isCompleted ? (
              <Check className="h-5 w-5 stroke-[2.5]" />
            ) : (
              <Circle className="h-4 w-4 opacity-0 group-hover:opacity-40 transition-opacity" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
