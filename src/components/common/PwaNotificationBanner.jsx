import React from 'react';
import { RefreshCw, WifiOff, CheckCircle2, X } from 'lucide-react';
import { usePWA } from '../../hooks/usePWA';
import { id as i18n } from '../../i18n/id';

export default function PwaNotificationBanner({ pwaState }) {
  // Jika props pwaState tidak diberikan, gunakan hook secara internal
  const localPwa = usePWA();
  const {
    isOffline,
    needRefresh,
    offlineReady,
    reloadApp,
    dismissUpdate,
  } = pwaState || localPwa;

  return (
    <div className="fixed z-50 pointer-events-none inset-x-0 bottom-20 md:bottom-6 flex flex-col items-center gap-2.5 px-4 sm:px-6">
      {/* 1. Indikator Mode Offline */}
      {isOffline && (
        <div className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-amber-900/90 dark:bg-amber-950/95 text-amber-100 border border-amber-500/30 shadow-lg backdrop-blur-md text-xs font-medium animate-slide-up">
          <WifiOff className="w-4 h-4 text-amber-300 shrink-0 animate-pulse" />
          <span>{i18n.pwa.offlineAlert}</span>
        </div>
      )}

      {/* 2. Indikator Aplikasi Siap Offline */}
      {offlineReady && !needRefresh && (
        <div className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-emerald-800/90 dark:bg-emerald-950/95 text-emerald-100 border border-emerald-500/30 shadow-lg backdrop-blur-md text-xs font-medium animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{i18n.pwa.offlineReadyAlert}</span>
        </div>
      )}

      {/* 3. Notifikasi Update Tersedia (Versi Baru) */}
      {needRefresh && (
        <div className="pointer-events-auto max-w-md w-full p-4 rounded-3xl bg-slate-900/95 dark:bg-[#1B2129]/95 text-white border border-emerald-500/40 shadow-2xl backdrop-blur-xl animate-bounce-subtle">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <RefreshCw className="w-5 h-5 animate-spin" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-100">
                  {i18n.pwa.newVersionTitle}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  {i18n.pwa.newVersionDesc}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={dismissUpdate}
              aria-label="Tutup notifikasi"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3.5 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={dismissUpdate}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              {i18n.pwa.laterButton}
            </button>
            <button
              type="button"
              onClick={reloadApp}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{i18n.pwa.reloadButton}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
