import React from 'react';
import {
  Check,
  CheckCircle2,
  Circle,
  Lock,
  CalendarCheck,
  AlertCircle,
  Sparkles,
  Droplets,
  BookOpen,
  Footprints,
  Moon,
  Info,
} from 'lucide-react';
import { STATUS_META, STATUS_NO_SCHEDULE } from '../../services/calendarService';

const ICON_MAP = {
  Sparkles,
  Droplets,
  BookOpen,
  Footprints,
  Moon,
};

export default function SelectedDateDetail({
  dateDetail,
  onToggleHabit,
}) {
  if (!dateDetail) return null;

  const {
    date,
    formattedDate,
    status,
    completedCount,
    totalCount,
    habits = [],
    isReadOnly,
    isFuture,
    retroactiveNote,
  } = dateDetail;

  const statusMeta = STATUS_META[status] || STATUS_META[STATUS_NO_SCHEDULE];

  return (
    <div className="bg-white dark:bg-[#1B2129] rounded-2xl border border-slate-200/80 dark:border-[#2A323D] p-4 sm:p-6 shadow-sm space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#2A323D]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {formattedDate}
            </h3>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusMeta.colorClasses}`}
            >
              <span>{statusMeta.label}</span>
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
            {completedCount} dari {totalCount} kebiasaan harian telah diselesaikan
          </p>
        </div>

        {/* Retroactive Status Badge */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium self-start sm:self-auto ${
            isReadOnly
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300/40'
              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-[#54C28E] border border-emerald-300/40'
          }`}
        >
          {isReadOnly ? (
            <Lock className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <CalendarCheck className="w-3.5 h-3.5 shrink-0" />
          )}
          <span>{isReadOnly ? 'Hanya Baca' : 'Dapat Diedit'}</span>
        </div>
      </div>

      {/* Retroactive Info Banner */}
      <div
        className={`flex items-start gap-2.5 p-3 rounded-xl text-xs ${
          isReadOnly
            ? 'bg-slate-50 dark:bg-[#14181D] text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-[#2A323D]'
            : 'bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40'
        }`}
      >
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-slate-600 dark:text-slate-300" />
        <p className="leading-relaxed">
          {retroactiveNote}
        </p>
      </div>

      {/* Habit List for Date */}
      <div className="space-y-2.5 pt-1">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          Daftar Target Kebiasaan
        </h4>

        {habits.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-600 dark:text-slate-300">
            Tidak ada kebiasaan yang dijadwalkan pada tanggal ini.
          </div>
        ) : (
          <div className="space-y-2">
            {habits.map((habit) => {
              const IconComponent = ICON_MAP[habit.icon] || Sparkles;
              const isCompleted = habit.status === 'completed';

              return (
                <div
                  key={habit.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isCompleted
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200/60 dark:border-emerald-900/40'
                      : 'bg-slate-50/60 dark:bg-[#14181D]/60 border-slate-200/60 dark:border-[#2A323D]'
                  }`}
                >
                  {/* Left: Icon & Title */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-[#54C28E]'
                          : 'bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold truncate ${
                            isCompleted
                              ? 'text-slate-900 dark:text-slate-100 line-through opacity-70'
                              : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {habit.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                          {habit.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                        {habit.details}
                      </p>
                    </div>
                  </div>

                  {/* Right: Checkbox / Toggle Button */}
                  <button
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => onToggleHabit(date, habit.id)}
                    aria-label={`Tandai ${habit.name} ${isCompleted ? 'belum selesai' : 'selesai'}`}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                      isReadOnly
                        ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-500'
                        : isCompleted
                        ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-[#1E2630]'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Selesai</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-3.5 h-3.5" />
                        <span>Check-in</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
