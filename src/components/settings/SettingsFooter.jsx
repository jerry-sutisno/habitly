import React from 'react';
import { Heart } from 'lucide-react';

export default function SettingsFooter({ appVersion = 'v2.4.0 (Calm Canvas)' }) {
  return (
    <div className="flex flex-col items-center justify-center pt-2 pb-6 text-center text-slate-400 dark:text-slate-500 gap-1">
      <span className="text-xs font-semibold tracking-tight text-slate-600 dark:text-slate-400">
        HABITLY · {appVersion}
      </span>
      <p className="text-[11px] flex items-center gap-1">
        <span>Dibuat untuk ritme hidup tenang dan kebiasaan berkesadaran</span>
        <Heart className="w-3 h-3 text-emerald-500 fill-emerald-500/20" />
      </p>
    </div>
  );
}
