import React from 'react';
import { id as i18n } from '../../i18n/id';

export default function SettingsHeader() {
  return (
    <div className="flex flex-col pt-1">
      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-[#9ce3be]">
        {i18n.settings.badge}
      </span>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
        {i18n.settings.title}
      </h1>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
        {i18n.settings.subtitle}
      </p>
    </div>
  );
}
