import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export default function MindfulThoughtCard({
  thought = "Notice the small victories. Every mindful repetition shapes your future self.",
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 dark:from-[#15241e] dark:via-[#1B2129] dark:to-[#141d1a] border border-emerald-500/20 dark:border-emerald-500/25 p-5 sm:p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-2xl bg-white dark:bg-[#203a2e] text-emerald-700 dark:text-[#54C28E] flex items-center justify-center shrink-0 shadow-sm border border-emerald-500/10">
          <Sparkles className="w-5 h-5 text-amber-500" />
        </div>

        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-[#9ce3be]">
              Mindful Thought
            </span>
          </div>

          <p className="text-sm font-medium italic text-slate-800 dark:text-slate-200 leading-relaxed">
            &ldquo;{thought}&rdquo;
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>Rayakan setiap progres kecil tanpa membebani diri.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
