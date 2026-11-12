import React, { useState } from 'react';
import { Cloud, Download, X, ShieldAlert } from 'lucide-react';
import { backupService } from '../../services/backupService';
import { id as i18n } from '../../i18n/id';

export default function BackupReminderBanner({ onBackupComplete }) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (isDismissed) return null;

  const handleExportNow = async () => {
    setIsExporting(true);
    try {
      const res = await backupService.exportBackup();
      if (res.success) {
        setIsDismissed(true);
        onBackupComplete?.(res);
      }
    } catch (err) {
      console.error('Failed to export backup from reminder banner:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-[#1B2129] border border-emerald-500/30 dark:border-emerald-500/20 p-4 sm:p-5 transition-all shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Icon & Description */}
        <div className="flex items-start gap-3.5 min-w-0 pr-6 sm:pr-0">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 dark:bg-[#006a46] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 sm:mt-0">
            <Cloud className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                {i18n.dashboard.backupReminder.title}
              </h4>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                {i18n.dashboard.backupReminder.badge}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              {i18n.dashboard.backupReminder.description}
            </p>
          </div>
        </div>

        {/* Right: Quick Action & Dismiss */}
        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleExportNow}
            disabled={isExporting}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? i18n.dashboard.backupReminder.exportingButton : i18n.dashboard.backupReminder.actionButton}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            aria-label={i18n.common.close}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-[#202731] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
