import React from 'react';
import { Quote, Anchor } from 'lucide-react';

export default function MindfulQuoteCard({ quoteData, anchorData }) {
  const { quote, author } = quoteData || {};
  const { title, description } = anchorData || {};

  return (
    <div className="flex flex-col gap-4">
      {/* Daily Wisdom Quote Card */}
      {quote && (
        <div className="relative overflow-hidden p-5 rounded-2xl bg-slate-100/80 dark:bg-[#181D24] border border-slate-200/80 dark:border-[#2A323D] flex items-start gap-3.5 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-[#203a2e] text-emerald-700 dark:text-[#54C28E] border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Quote className="h-4 w-4" />
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
              {quote}
            </p>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 dark:text-[#54C28E]">
              — {author}
            </span>
          </div>
        </div>
      )}

      {/* Anchor of the Day Card */}
      {title && (
        <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-[#181D24] border border-emerald-200/50 dark:border-[#2A323D] flex flex-col gap-2 relative overflow-hidden shadow-sm">
          <div className="flex items-center gap-1.5 text-emerald-800 dark:text-[#54C28E]">
            <Anchor className="h-4 w-4" />
            <span className="text-[11px] uppercase tracking-wider font-bold">
              Anchor of the Day
            </span>
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {title}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {description}
          </p>
        </div>
      )}
    </div>
  );
}
