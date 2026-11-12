import React from 'react';
import { Check, PieChart, X, Minus } from 'lucide-react';
import { id as i18n } from '../../i18n/id';
import {
  STATUS_ALL_COMPLETED,
  STATUS_PARTIAL,
  STATUS_NONE_COMPLETED,
  STATUS_NO_SCHEDULE,
} from '../../services/calendarService';

export default function CalendarLegend() {
  const legendItems = [
    {
      key: STATUS_ALL_COMPLETED,
      icon: Check,
      title: i18n.calendar.statusAllCompleted,
      description: i18n.calendar.legendAllCompletedDesc,
      badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-[#54C28E] border-emerald-500/30',
      iconColor: 'text-emerald-700 dark:text-[#54C28E]',
    },
    {
      key: STATUS_PARTIAL,
      icon: PieChart,
      title: i18n.calendar.statusPartial,
      description: i18n.calendar.legendPartialDesc,
      badgeClass: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30',
      iconColor: 'text-teal-700 dark:text-teal-300',
    },
    {
      key: STATUS_NONE_COMPLETED,
      icon: X,
      title: i18n.calendar.statusNoneCompleted,
      description: i18n.calendar.legendNoneCompletedDesc,
      badgeClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
      iconColor: 'text-rose-700 dark:text-rose-400',
    },
    {
      key: STATUS_NO_SCHEDULE,
      icon: Minus,
      title: i18n.calendar.statusNoSchedule,
      description: i18n.calendar.legendNoScheduleDesc,
      badgeClass: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-400/30',
      iconColor: 'text-slate-600 dark:text-slate-400',
    },
  ];

  return (
    <div className="bg-white dark:bg-[#1B2129] rounded-2xl border border-slate-200/80 dark:border-[#2A323D] p-4 sm:p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
          {i18n.calendar.legendTitle}
        </h3>
        <span className="text-[11px] text-slate-600 dark:text-slate-300 hidden sm:inline">
          {i18n.calendar.legendSubtitle}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        {legendItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-[#14181D] border border-slate-200/60 dark:border-[#2A323D]/60"
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${item.badgeClass}`}
                aria-hidden="true"
              >
                <Icon className={`w-4 h-4 ${item.iconColor}`} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {item.title}
                </div>
                <div className="text-[10px] text-slate-600 dark:text-slate-300 truncate">
                  {item.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
