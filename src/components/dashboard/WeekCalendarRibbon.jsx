import React from 'react';

export default function WeekCalendarRibbon({ weekDays = [] }) {
  return (
    <div className="flex items-center justify-between bg-white dark:bg-[#14181D] p-2 sm:p-2.5 rounded-2xl border border-slate-200/80 dark:border-[#2A323D] shadow-sm">
      <div className="flex items-center justify-between w-full">
        {weekDays.map((item, idx) => {
          const isActive = item.isToday || item.status === 'active';
          return (
            <div
              key={idx}
              className={`flex flex-col items-center justify-center w-10 sm:w-12 h-14 rounded-2xl transition-all ${
                isActive
                  ? 'bg-emerald-700 dark:bg-emerald-400 text-white dark:text-slate-950 shadow-md shadow-emerald-700/25 dark:shadow-emerald-400/20 scale-105 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#222933]'
              }`}
            >
              <span
                className={`text-[11px] font-medium leading-none ${
                  isActive ? 'opacity-90' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {item.day}
              </span>
              <span className="text-sm font-bold mt-1 leading-none">
                {item.date}
              </span>
              {/* Dot indicator */}
              <span
                className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                  isActive
                    ? 'bg-white dark:bg-slate-950'
                    : item.status === 'completed'
                    ? 'bg-emerald-600 dark:bg-emerald-400'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              ></span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
