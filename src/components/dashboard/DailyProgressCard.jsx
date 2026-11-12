import React from 'react';
import { Hourglass, Sparkles } from 'lucide-react';
import { id as i18n } from '../../i18n/id';

export default function DailyProgressCard({ stats }) {
  const {
    completedToday = 0,
    scheduledToday = 0,
    progressPercent = 0,
    progressHeadline = i18n.dashboard.peacefulMomentum,
    progressDescription = i18n.dashboard.progressDescription,
    routinesLeftText = '',
  } = stats || {};

  // Circumference for r=40 is 2 * PI * 40 = 251.327
  const circumference = 251.2;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#14181D] border border-slate-200/80 dark:border-[#2A323D] shadow-sm flex flex-col gap-4">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-[#203a2e] text-emerald-800 dark:text-[#9ce3be] border border-emerald-200/60 dark:border-emerald-500/20 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{i18n.dashboard.progressTitle}</span>
        </div>
      </div>

      {/* Circle + Description Section */}
      <div className="flex flex-col sm:flex-row items-center gap-5 my-1">
        {/* Circular Progress Ring */}
        <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              className="text-slate-100 dark:text-[#222933]"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="8"
            />
            {/* Foreground Fill Ring */}
            <circle
              className="text-emerald-600 dark:text-[#54C28E] transition-all duration-700 ease-out"
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-none">
              {progressPercent}%
            </span>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-400 mt-0.5">
              Selesai
            </span>
          </div>
        </div>

        {/* Text descriptions */}
        <div className="flex flex-col gap-1 min-w-0 text-center sm:text-left">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            {completedToday} dari {scheduledToday} selesai &bull; {progressHeadline}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {progressDescription}
          </p>
          {routinesLeftText && (
            <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-1 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
              <Hourglass className="h-3.5 w-3.5" />
              <span>{routinesLeftText}</span>
            </div>
          )}
        </div>
      </div>

      {/* Linear Track bar */}
      <div className="h-2 w-full bg-slate-100 dark:bg-[#222933] rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-600 dark:bg-[#54C28E] rounded-full transition-all duration-500 shadow-sm"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
    </div>
  );
}
