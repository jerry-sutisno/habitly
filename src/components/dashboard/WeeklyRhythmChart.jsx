import React from 'react';

export default function WeeklyRhythmChart({ rhythmData }) {
  const {
    summary = '28 of 35 routines kept',
    average = '80% Avg',
    days = [],
  } = rhythmData || {};

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#14181D] border border-slate-200/80 dark:border-[#2A323D] shadow-sm flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-base font-bold text-slate-900 dark:text-slate-100">
            Weekly Rhythm
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {summary}
          </span>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-[#203a2e] text-emerald-800 dark:text-[#9ce3be] border border-emerald-500/20">
          {average}
        </span>
      </div>

      {/* 7-Day Bar Chart */}
      <div className="grid grid-cols-7 gap-2 pt-2 items-end h-36">
        {days.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center gap-1.5 h-full justify-end group"
          >
            <span
              className={`text-[10px] font-medium leading-none ${
                item.highlight
                  ? 'text-emerald-700 dark:text-[#54C28E] font-bold'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {item.completed}/{item.total}
            </span>

            {/* Bar container */}
            <div className="w-full bg-slate-100 dark:bg-[#222933] rounded-t-xl h-24 flex items-end overflow-hidden p-0.5">
              <div
                className={`w-full rounded-t-lg transition-all duration-500 group-hover:brightness-110 ${
                  item.highlight
                    ? 'bg-emerald-600 dark:bg-[#54C28E] shadow-sm shadow-emerald-500/30'
                    : item.completed === item.total
                    ? 'bg-emerald-700 dark:bg-emerald-500'
                    : 'bg-emerald-500/80 dark:bg-emerald-700/80'
                }`}
                style={{ height: item.height }}
              ></div>
            </div>

            <span
              className={`text-xs font-semibold mt-0.5 ${
                item.highlight
                  ? 'text-emerald-700 dark:text-[#54C28E] font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {item.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
