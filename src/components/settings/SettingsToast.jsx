import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function SettingsToast({ message, isVisible }) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 max-w-sm w-auto px-4 py-2.5 rounded-full bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 text-xs font-semibold flex items-center justify-center gap-2 shadow-xl backdrop-blur-md z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
