import React, { useState } from 'react';
import { Bell, Sparkles } from 'lucide-react';
import { id as i18n } from '../../i18n/id';

export default function GentleRemindersCard({
  initialEnabled = true,
  onToggle,
}) {
  const [enabled, setEnabled] = useState(initialEnabled);

  const handleToggle = () => {
    const nextVal = !enabled;
    setEnabled(nextVal);
    if (onToggle) onToggle(nextVal);
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-[#2A323D] bg-slate-50 dark:bg-[#14181D] p-5 sm:p-6 space-y-3">
      <div className="flex items-center gap-2 text-emerald-800 dark:text-[#9ce3be]">
        <Bell className="w-5 h-5 text-emerald-600 dark:text-[#54C28E]" />
        <span className="text-xs font-bold uppercase tracking-wider">
          {i18n.settings.gentleRemindersTitle}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xs leading-relaxed">
          {i18n.settings.gentleRemindersSubtitle}
        </p>

        {/* Toggle switch */}
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={enabled ? i18n.settings.remindersActive : i18n.settings.remindersQuiet}
          onClick={handleToggle}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            enabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
          }`}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
              enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
