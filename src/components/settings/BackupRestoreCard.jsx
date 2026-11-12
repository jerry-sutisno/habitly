import React from 'react';
import { Download, Upload, Cloud, ShieldCheck } from 'lucide-react';
import { id as i18n } from '../../i18n/id';

export default function BackupRestoreCard({
  lastSynced = 'Hari ini, 08:45 WIB',
  syncMode = i18n.settings.syncModeLabel,
  onExportClick,
  onRestoreClick,
}) {
  return (
    <div className="bg-white dark:bg-[#1B2129] rounded-2xl border border-slate-200/80 dark:border-[#2A323D] p-5 sm:p-6 shadow-sm space-y-4">
      {/* Top Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-[#54C28E] flex items-center justify-center shrink-0 border border-emerald-500/20">
            <Cloud className="w-6 h-6" />
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {i18n.settings.backupRestoreTitle}
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {i18n.settings.lastSyncedLabel(lastSynced)}
            </span>
          </div>
        </div>

        <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-[#9ce3be] border border-emerald-500/20 text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0">
          {syncMode}
        </span>
      </div>

      {/* Security notice */}
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        {i18n.settings.backupDescription}
      </p>

      {/* Action Buttons: Export & Restore (UI Ready for Phase 3) */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          onClick={onExportClick}
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-[#14181D] dark:hover:bg-[#202731] text-emerald-700 dark:text-[#54C28E] text-xs sm:text-sm font-semibold transition-all border border-slate-200/60 dark:border-[#2A323D] active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          <span>{i18n.settings.exportBackupButton}</span>
        </button>

        <button
          type="button"
          onClick={onRestoreClick}
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-[#14181D] dark:hover:bg-[#202731] text-emerald-700 dark:text-[#54C28E] text-xs sm:text-sm font-semibold transition-all border border-slate-200/60 dark:border-[#2A323D] active:scale-[0.98]"
        >
          <Upload className="w-4 h-4" />
          <span>{i18n.settings.restoreFileButton}</span>
        </button>
      </div>
    </div>
  );
}
