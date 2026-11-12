import React, { useState, useEffect } from 'react';
import { Smartphone, HardDrive, DownloadCloud, ShieldCheck, ShieldAlert, Check, RefreshCw } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { id as i18n } from '../../i18n/id';

export default function AppSystemCard({
  storageUsed = '0.1 MB',
  storedHabitsCount = 0,
  storageStatus = i18n.settings.storageHealthy,
  isInstallable = false,
  isInstalled = false,
  onInstallClick,
  onPersistentStorageChanged,
}) {
  const [isPersisted, setIsPersisted] = useState(false);
  const [isRequestingPersist, setIsRequestingPersist] = useState(false);
  const [storageEstimate, setStorageEstimate] = useState(null);

  const checkPersistence = async () => {
    try {
      const persisted = await storageService.isPersisted();
      setIsPersisted(persisted);

      const estimate = await storageService.getStorageEstimate();
      setStorageEstimate(estimate);
    } catch (err) {
      console.warn('Gagal membaca status storage:', err);
    }
  };

  useEffect(() => {
    checkPersistence();
  }, []);

  const handleRequestPersistence = async () => {
    setIsRequestingPersist(true);
    try {
      const granted = await storageService.requestPersistence();
      setIsPersisted(granted);
      onPersistentStorageChanged?.(granted);
      await checkPersistence();
    } catch (err) {
      console.error('Gagal meminta persistent storage:', err);
    } finally {
      setIsRequestingPersist(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1B2129] rounded-2xl border border-slate-200/80 dark:border-[#2A323D] shadow-sm overflow-hidden flex flex-col space-y-0 divide-y divide-slate-100 dark:divide-[#2A323D]">
      {/* 1. Install App Row */}
      <div className="p-5 sm:p-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-[#54C28E] flex items-center justify-center shrink-0 border border-emerald-500/20">
            <DownloadCloud className="w-6 h-6" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                {i18n.settings.installAppTitle}
              </span>
              {isInstalled && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                  {i18n.settings.installedBadge}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {isInstalled
                ? i18n.settings.installedDesc
                : i18n.settings.installAppSubtitle}
            </span>
          </div>
        </div>

        {/* Install Button */}
        {isInstalled ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#14181D] text-slate-600 dark:text-slate-300 text-xs font-semibold shrink-0">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>{i18n.settings.installedStatus}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onInstallClick}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm active:scale-[0.97] transition-all shrink-0 flex items-center gap-1.5"
          >
            <DownloadCloud className="w-3.5 h-3.5" />
            <span>{i18n.settings.installButton}</span>
          </button>
        )}
      </div>

      {/* 2. Persistent Storage API Row */}
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
              isPersisted
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-[#54C28E] border-emerald-500/20'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-500/20'
            }`}
          >
            {isPersisted ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                {i18n.settings.persistentStorageTitle}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isPersisted
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                }`}
              >
                {isPersisted ? i18n.settings.persistentSafeBadge : i18n.settings.persistentStandardBadge}
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isPersisted
                ? i18n.settings.persistentSafeDesc
                : i18n.settings.persistentStandardDesc}
            </span>
          </div>
        </div>

        {!isPersisted && (
          <button
            type="button"
            onClick={handleRequestPersistence}
            disabled={isRequestingPersist}
            className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm shrink-0 flex items-center justify-center gap-1.5"
          >
            {isRequestingPersist ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Meminta...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{i18n.settings.protectDataButton}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* 3. Storage Usage & Health Row */}
      <div className="p-5 sm:p-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-[#14181D] text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-[#2A323D]">
            <HardDrive className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
              {i18n.settings.localStorageStatusTitle}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {i18n.settings.storageUsageInfo(storageEstimate?.usageMb || storageUsed, storedHabitsCount)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/20 px-2.5 py-1 rounded-full shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-[#54C28E] animate-pulse" />
          <span className="text-[11px] font-bold text-emerald-800 dark:text-[#9ce3be]">
            {storageStatus}
          </span>
        </div>
      </div>
    </div>
  );
}
