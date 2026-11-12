import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';

export default function AppearanceCard({
  currentTheme = 'system',
  onSelectTheme,
}) {
  const themes = [
    { id: 'light', label: 'Light', icon: Sun, desc: 'Calm Light' },
    { id: 'dark', label: 'Dark', icon: Moon, desc: 'Dark Sanctuary' },
    { id: 'system', label: 'System', icon: Laptop, desc: 'Otomatis' },
  ];

  const activeThemeMeta = themes.find((t) => t.id === currentTheme) || themes[2];

  return (
    <div className="bg-white dark:bg-[#1B2129] rounded-2xl border border-slate-200/80 dark:border-[#2A323D] p-5 sm:p-6 shadow-sm space-y-3">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
            Tampilan (Appearance)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pilih suasana tema yang menenangkan mata Anda
          </p>
        </div>
        <span className="text-xs font-semibold text-emerald-800 dark:text-[#9ce3be] bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
          {activeThemeMeta.desc}
        </span>
      </div>

      {/* 3-Way Pill Switcher */}
      <div className="bg-slate-100 dark:bg-[#14181D] p-1.5 rounded-full flex items-center gap-1.5 border border-slate-200/60 dark:border-[#2A323D]">
        {themes.map((item) => {
          const Icon = item.icon;
          const isActive = currentTheme === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTheme(item.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-white dark:bg-[#1B2129] text-emerald-700 dark:text-[#54C28E] shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
