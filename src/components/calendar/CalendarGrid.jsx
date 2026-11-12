import React from 'react';
import { Check, PieChart, X, Minus, Clock } from 'lucide-react';
import {
  STATUS_ALL_COMPLETED,
  STATUS_PARTIAL,
  STATUS_NONE_COMPLETED,
  STATUS_NO_SCHEDULE,
  STATUS_FUTURE,
  STATUS_META,
} from '../../services/calendarService';

const WEEKDAYS = [
  { short: 'Min', long: 'Minggu' },
  { short: 'Sen', long: 'Senin' },
  { short: 'Sel', long: 'Selasa' },
  { short: 'Rab', long: 'Rabu' },
  { short: 'Kam', long: 'Kamis' },
  { short: 'Jum', long: 'Jumat' },
  { short: 'Sab', long: 'Sabtu' },
];

function StatusIndicator({ status, completed, total }) {
  if (status === STATUS_ALL_COMPLETED) {
    return (
      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-[#54C28E] border border-emerald-500/30 text-[10px] font-bold">
        <Check className="w-3 h-3 stroke-[2.5]" />
        <span className="hidden sm:inline">Selesai</span>
      </div>
    );
  }

  if (status === STATUS_PARTIAL) {
    return (
      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-500/30 text-[10px] font-bold">
        <PieChart className="w-3 h-3 stroke-[2.5]" />
        <span>{completed}/{total}</span>
      </div>
    );
  }

  if (status === STATUS_NONE_COMPLETED) {
    return (
      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-400 border border-rose-500/30 text-[10px] font-bold">
        <X className="w-3 h-3 stroke-[2.5]" />
        <span className="hidden sm:inline">Terlewat</span>
      </div>
    );
  }

  if (status === STATUS_NO_SCHEDULE) {
    return (
      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300/40 dark:border-slate-700 text-[10px] font-medium">
        <Minus className="w-3 h-3" />
        <span className="hidden sm:inline">Libur</span>
      </div>
    );
  }

  // Future
  return (
    <div className="flex items-center gap-1 px-1 py-0.5 text-slate-500 dark:text-slate-400 text-[10px]">
      <Clock className="w-2.5 h-2.5" />
      <span className="text-[9px] hidden sm:inline">Nanti</span>
    </div>
  );
}

export default function CalendarGrid({
  totalDays = 31,
  firstDayOffset = 2, // Tuesday
  daysData = {},
  selectedDate = 24,
  todayDate = 24,
  onSelectDate,
}) {
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
  const emptySlots = Array.from({ length: firstDayOffset }, (_, i) => i);

  return (
    <div className="bg-white dark:bg-[#1B2129] rounded-2xl border border-slate-200/80 dark:border-[#2A323D] p-3 sm:p-5 shadow-sm">
      {/* Weekday Column Headers */}
      <div className="grid grid-cols-7 mb-2 text-center">
        {WEEKDAYS.map((day, idx) => (
          <div
            key={idx}
            className="py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider"
            title={day.long}
          >
            <span className="sm:hidden">{day.short[0]}</span>
            <span className="hidden sm:inline">{day.short}</span>
          </div>
        ))}
      </div>

      {/* Grid of Days */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
        {/* Leading empty slots for previous month offset */}
        {emptySlots.map((slot) => (
          <div
            key={`empty-${slot}`}
            className="min-h-[58px] sm:min-h-[82px] rounded-xl border border-dashed border-slate-200/40 dark:border-[#2A323D]/40 bg-slate-50/30 dark:bg-[#14181D]/30 opacity-40 pointer-events-none"
            aria-hidden="true"
          />
        ))}

        {/* Days of the month */}
        {daysArray.map((dateNum) => {
          const dayInfo = daysData[dateNum] || {
            status: STATUS_NO_SCHEDULE,
            completed: 0,
            total: 0,
          };
          const isToday = dateNum === todayDate;
          const isSelected = dateNum === selectedDate;
          const isFuture = dateNum > todayDate;

          const meta = STATUS_META[dayInfo.status] || STATUS_META[STATUS_NO_SCHEDULE];

          return (
            <button
              key={dateNum}
              type="button"
              onClick={() => onSelectDate(dateNum)}
              aria-label={`Tanggal ${dateNum} Oktober 2024, Status: ${meta.label}${isToday ? ', Hari Ini' : ''}`}
              className={`relative flex flex-col justify-between items-center sm:items-start p-1.5 sm:p-2.5 min-h-[62px] sm:min-h-[86px] rounded-xl text-left transition-all group ${
                isSelected
                  ? 'ring-2 ring-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500 dark:border-[#54C28E] shadow-sm'
                  : 'border border-slate-200/80 dark:border-[#2A323D] hover:border-emerald-300 dark:hover:border-emerald-700 bg-slate-50/50 dark:bg-[#14181D]/60 hover:bg-white dark:hover:bg-[#1E2630]'
              }`}
            >
              {/* Date Header / Badge */}
              <div className="flex items-center justify-between w-full">
                <span
                  className={`flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full text-xs font-bold ${
                    isToday
                      ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/40'
                      : isSelected
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : isFuture
                      ? 'text-slate-500 dark:text-slate-400'
                      : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {dateNum}
                </span>

                {isToday && (
                  <span className="hidden sm:inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-[#9ce3be]">
                    Kini
                  </span>
                )}
              </div>

              {/* Status Badge with ICON and LABEL */}
              <div className="mt-1 w-full flex justify-center sm:justify-start">
                <StatusIndicator
                  status={dayInfo.status}
                  completed={dayInfo.completed}
                  total={dayInfo.total}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
