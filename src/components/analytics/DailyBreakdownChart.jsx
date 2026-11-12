import React from 'react';
import { id as i18n } from '../../i18n/id';
import { BarChart3 } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 dark:bg-black/90 text-white px-3 py-2 rounded-xl text-xs shadow-xl border border-white/10 backdrop-blur-sm">
        <p className="font-bold text-emerald-400">{data.fullDay}</p>
        <p className="text-slate-200 mt-0.5">
          {data.completed} dari {data.total} kebiasaan ({data.rate}%)
        </p>
        {data.isToday && (
          <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-300 uppercase">
            • Hari Ini
          </span>
        )}
      </div>
    );
  }
  return null;
}

export default function DailyBreakdownChart({
  dailyData = [],
  timeRange = '7d',
}) {
  const hasData = dailyData.some((d) => d.total > 0);

  return (
    <div className="bg-white dark:bg-[#1B2129] rounded-2xl border border-slate-200/80 dark:border-[#2A323D] p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {i18n.analytics.dailyBreakdownTitle}
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {timeRange === '7d'
              ? i18n.analytics.subtitle7d
              : i18n.analytics.subtitleOther}
          </span>
        </div>

        {hasData && (
          <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-[#54C28E] animate-pulse" />
            <span className="text-[11px] font-semibold text-emerald-800 dark:text-[#9ce3be]">
              {i18n.analytics.todayIndicator}
            </span>
          </div>
        )}
      </div>

      {!hasData ? (
        <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#14181D] text-slate-400 dark:text-slate-500 flex items-center justify-center mb-1">
            <BarChart3 className="w-6 h-6" />
          </div>
          <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">Belum Ada Data Rincian Harian</p>
          <p className="max-w-xs text-slate-500 dark:text-slate-400">Grafik konsistensi akan tampil otomatis setelah Anda memiliki kebiasaan terjadwal.</p>
        </div>
      ) : (
        <>
          {/* Recharts Bar Chart Container */}
          <div className="h-56 sm:h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailyData}
                margin={{ top: 16, right: 8, left: -24, bottom: 0 }}
              >
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                  dy={6}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  domain={[0, (dataMax) => Math.max(dataMax, 5)]}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                <Bar
                  dataKey="completed"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={36}
                >
                  {dailyData.map((entry, index) => {
                    let fill = '#23845d'; // Primary emerald
                    if (entry.isToday) {
                      fill = '#006a46'; // Highlighted today
                    } else if (entry.rate === 100) {
                      fill = '#276a4f';
                    } else if (entry.rate < 50) {
                      fill = '#94A3B8'; // Muted for low
                    }
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={fill}
                        className="transition-all duration-300 hover:opacity-80"
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend / Micro summary below chart */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#2A323D] text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#006a46] dark:bg-[#54C28E]" />
                100% Target
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#23845d]" />
                Sebagian
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
