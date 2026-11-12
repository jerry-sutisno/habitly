import React from 'react';
import {
  Check,
  Circle,
  Sparkles,
  Droplets,
  BookOpen,
  Footprints,
  Moon,
  Activity,
} from 'lucide-react';

const ICON_MAP = {
  Sparkles,
  Droplets,
  BookOpen,
  Footprints,
  Moon,
};

export default function HabitCard({ habit, onToggle }) {
  const isCompleted = habit.status === 'completed';
  const IconComponent = ICON_MAP[habit.icon] || Activity;

  return (
    <div
      onClick={() => onToggle(habit.id)}
      className="group flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1B2129] border border-slate-200/80 dark:border-[#2A323D] shadow-sm transition-all duration-200 cursor-pointer hover:border-emerald-500/40 hover:shadow-md active:scale-[0.99]"
    >
      {/* Icon & Habit Info */}
      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
        <div
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 border ${
            isCompleted
              ? 'bg-emerald-50 text-emerald-700 dark:bg-[#203a2e] dark:text-[#54C28E] border-emerald-500/20'
              : 'bg-slate-100 text-slate-600 dark:bg-[#222933] dark:text-emerald-400 border-slate-200 dark:border-[#2A323D]'
          }`}
        >
          <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>

        <div className="flex flex-col min-w-0">
          <span
            className={`text-sm sm:text-base font-semibold truncate transition-all ${
              isCompleted
                ? 'line-through text-slate-400 dark:text-slate-500'
                : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {habit.name}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              {habit.category}
            </span>
            <span className="text-slate-300 dark:text-slate-600">&bull;</span>
            <span className="truncate">{habit.details}</span>
          </div>
        </div>
      </div>

      {/* Checkbox Toggle Button */}
      <button
        type="button"
        aria-label={`Mark ${habit.name} as ${isCompleted ? 'pending' : 'completed'}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggle(habit.id);
        }}
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 active:scale-90 min-h-[44px] min-w-[44px] ${
          isCompleted
            ? 'bg-emerald-700 dark:bg-emerald-400 text-white dark:text-slate-950 shadow-sm'
            : 'border-2 border-slate-300 dark:border-slate-700 text-transparent hover:border-emerald-500 hover:text-emerald-500 dark:hover:border-emerald-400'
        }`}
      >
        {isCompleted ? (
          <Check className="h-5 w-5 stroke-[2.5]" />
        ) : (
          <Circle className="h-4 w-4 opacity-0 group-hover:opacity-40 transition-opacity" />
        )}
      </button>
    </div>
  );
}
