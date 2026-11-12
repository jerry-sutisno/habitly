import React from 'react';
import { ArrowUpRight, ArrowDownRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function CompletionRateCard({
  completionRate = 84,
  trendText = '+6% vs last week',
  isTrendPositive = true,
  momentumMessage = "You're building strong, steady momentum this week.",
}) {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-[#1B2129] rounded-2xl border border-slate-200/80 dark:border-[#2A323D] p-5 sm:p-6 shadow-sm space-y-4">
      {/* Glow decorative effect */}
      <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-2xl pointer-events-none" />

      {/* Top row: Label, Display metric & Icon */}
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Overall Completion Rate
          </span>
          <div className="flex items-baseline gap-2.5 mt-1">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-emerald-700 dark:text-[#54C28E]">
              {completionRate}%
            </span>
            <span
              className={`inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isTrendPositive
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-[#54C28E]'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-400'
              }`}
            >
              {isTrendPositive ? (
                <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5 stroke-[2.5]" />
              )}
              {trendText}
            </span>
          </div>
        </div>

        {/* Spa/Lotus Icon Badge */}
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-[#203a2e] text-emerald-700 dark:text-[#54C28E] flex items-center justify-center shrink-0 border border-emerald-500/20">
          <Sparkles className="w-6 h-6" />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative z-10 space-y-1.5">
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-[#54C28E] dark:to-teal-400 h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Momentum micro-copy */}
      <div className="relative z-10 flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-[#54C28E] shrink-0" />
        <p className="leading-snug">{momentumMessage}</p>
      </div>
    </div>
  );
}
