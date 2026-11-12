import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Sliders,
  Bell,
  Check,
  Plus,
  Minus,
  BookOpen,
  Droplets,
  Footprints,
  Moon,
  Edit3,
  Coffee,
  Dumbbell,
  Anchor,
} from 'lucide-react';
import { id as i18n } from '../../i18n/id';

const DEFAULT_CATEGORIES = [
  'Mindfulness',
  'Health',
  'Education',
  'Productivity',
  'Personal Development',
  'Finance',
];

const ICONS = [
  { name: 'BookOpen', icon: BookOpen, label: 'Reading' },
  { name: 'Droplets', icon: Droplets, label: 'Hydration' },
  { name: 'Sparkles', icon: Sparkles, label: 'Mindfulness' },
  { name: 'Footprints', icon: Footprints, label: 'Walking' },
  { name: 'Moon', icon: Moon, label: 'Sleep' },
  { name: 'Edit3', icon: Edit3, label: 'Journal' },
  { name: 'Coffee', icon: Coffee, label: 'Routine' },
  { name: 'Dumbbell', icon: Dumbbell, label: 'Fitness' },
];

const COLORS = [
  { hex: '#006a46', name: 'Sage Green' },
  { hex: '#22c55e', name: 'Mint' },
  { hex: '#38bdf8', name: 'Sky Blue' },
  { hex: '#f97316', name: 'Warm Peach' },
  { hex: '#a855f7', name: 'Lavender' },
  { hex: '#eab308', name: 'Amber Sand' },
];

const DAYS_OF_WEEK = [
  { id: 1, label: 'M' },
  { id: 2, label: 'T' },
  { id: 3, label: 'W' },
  { id: 4, label: 'T' },
  { id: 5, label: 'F' },
  { id: 6, label: 'S' },
  { id: 7, label: 'S' },
];

const UNIT_SUGGESTIONS = ['Pages', 'Minutes', 'Glasses', 'Steps', 'km', 'ml'];

export default function AddHabitModal({
  isOpen,
  onClose,
  onSave,
  habitToEdit = null,
  availableCategories = [],
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Mindfulness');
  const [habitType, setHabitType] = useState('checkbox'); // 'checkbox' | 'measurable'
  const [targetValue, setTargetValue] = useState(20);
  const [targetUnit, setTargetUnit] = useState('Pages');
  const [scheduledDays, setScheduledDays] = useState([1, 2, 3, 4, 5, 6, 7]);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('20:30');
  const [selectedIcon, setSelectedIcon] = useState('Sparkles');
  const [selectedColor, setSelectedColor] = useState('#006a46');
  const [anchor, setAnchor] = useState('Evening herbal tea');

  const categoriesList = availableCategories.length > 0
    ? availableCategories.filter((c) => c !== 'All')
    : DEFAULT_CATEGORIES;

  useEffect(() => {
    if (habitToEdit) {
      setName(habitToEdit.name || '');
      setCategory(habitToEdit.category || categoriesList[0] || 'Mindfulness');
      setHabitType(habitToEdit.habitType || 'checkbox');
      setTargetValue(habitToEdit.targetValue || 20);
      setTargetUnit(habitToEdit.targetUnit || 'Pages');
      setScheduledDays(
        Array.isArray(habitToEdit.scheduledDays) && habitToEdit.scheduledDays.length > 0
          ? habitToEdit.scheduledDays
          : [1, 2, 3, 4, 5, 6, 7]
      );
      setSelectedIcon(habitToEdit.icon || 'Sparkles');
      setSelectedColor(habitToEdit.color || '#006a46');
      setAnchor(habitToEdit.description || habitToEdit.anchor || '');
    } else {
      // Reset form
      setName('');
      setCategory(categoriesList[0] || 'Mindfulness');
      setHabitType('checkbox');
      setTargetValue(20);
      setTargetUnit('Pages');
      setScheduledDays([1, 2, 3, 4, 5, 6, 7]);
      setSelectedIcon('Sparkles');
      setSelectedColor('#006a46');
      setAnchor('Evening herbal tea');
    }
  }, [habitToEdit, isOpen]);

  if (!isOpen) return null;

  const toggleDay = (dayId) => {
    setScheduledDays((prev) => {
      const next = prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId];
      return next.sort((a, b) => a - b);
    });
  };

  const handleStepper = (delta) => {
    setTargetValue((prev) => Math.max(1, prev + delta));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert(i18n.habits.modal.nameRequiredError);
      return;
    }
    if (scheduledDays.length === 0) {
      alert(i18n.habits.modal.scheduleRequiredError);
      return;
    }

    onSave({
      ...(habitToEdit ? { id: habitToEdit.id } : {}),
      name: name.trim(),
      category,
      habitType,
      targetValue: habitType === 'measurable' ? Number(targetValue) : null,
      targetUnit: habitType === 'measurable' ? targetUnit.trim() : null,
      frequency: scheduledDays.length === 7 ? 'daily' : 'selected_days',
      scheduledDays,
      icon: selectedIcon,
      color: selectedColor,
      description: anchor.trim(),
      anchor: anchor.trim(),
      reminderEnabled,
      reminderTime,
    });

    onClose();
  };

  const isEditMode = Boolean(habitToEdit);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex justify-center items-start sm:items-center p-2.5 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#14181D] rounded-3xl border border-slate-200/80 dark:border-[#2A323D] shadow-2xl p-4 sm:p-7 overflow-hidden my-3 sm:my-8 text-[#141d23] dark:text-[#F1F5F9] min-w-0">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 dark:border-[#2A323D] gap-2 min-w-0">
          <button
            type="button"
            onClick={onClose}
            aria-label={i18n.common.back}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 dark:bg-[#1B2129] flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="text-center min-w-0 flex-1 px-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
              {isEditMode ? i18n.habits.modal.titleEdit : i18n.habits.modal.titleNew}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-[#94A3B8] truncate">
              {isEditMode ? i18n.habits.modal.subtitleEdit : i18n.habits.modal.subtitleNew}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={i18n.common.close}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 dark:bg-[#1B2129] flex items-center justify-center text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5 pt-4 sm:pt-5 max-h-[75vh] overflow-y-auto pr-1 w-full min-w-0">
          {/* Affirmation Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-emerald-50 dark:bg-[#203a2e] border border-emerald-500/20 p-4 flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#14181D] text-emerald-700 dark:text-[#54C28E] flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-emerald-900 dark:text-[#9ce3be] leading-tight">
                {isEditMode ? i18n.habits.modal.affirmationEditTitle : i18n.habits.modal.affirmationNewTitle}
              </p>
              <p className="text-xs text-emerald-800/80 dark:text-slate-300 leading-snug mt-0.5">
                {isEditMode ? i18n.habits.modal.affirmationEditDesc : i18n.habits.modal.affirmationNewDesc}
              </p>
            </div>
          </div>

          {/* Habit Name Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {i18n.habits.modal.nameLabel}
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={i18n.habits.modal.namePlaceholder}
                className="w-full bg-slate-50 dark:bg-[#1B2129] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium text-sm rounded-2xl px-4 py-3 border border-slate-200 dark:border-[#2A323D] focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-400 transition-all"
              />
            </div>
          </div>

          {/* Category Picker */}
          <div className="flex flex-col gap-2 min-w-0 max-w-full">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {i18n.habits.modal.categoryLabel}
              </label>
              <span className="text-xs text-emerald-700 dark:text-[#54C28E] font-medium truncate ml-2">
                {i18n.habits.modal.categorySelected(category)}
              </span>
            </div>
            <div className="w-full min-w-0 max-w-full overflow-hidden">
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar w-full">
                {categoriesList.map((cat) => {
                  const isSelected = category.toLowerCase() === cat.toLowerCase();
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-emerald-700 text-white dark:bg-emerald-400 dark:text-slate-950 shadow-sm'
                          : 'bg-slate-100 dark:bg-[#1B2129] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#252C36]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Habit Type (Checkbox vs Measurable) */}
          <div className="flex flex-col gap-2 min-w-0">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {i18n.habits.modal.methodLabel}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 w-full">
              <button
                type="button"
                onClick={() => setHabitType('checkbox')}
                className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all min-w-0 ${
                  habitType === 'checkbox'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:border-emerald-400 dark:bg-[#203a2e]/30'
                    : 'border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#181D24] opacity-80'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2
                    className={`h-4 w-4 shrink-0 ${
                      habitType === 'checkbox'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-400'
                    }`}
                  />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {i18n.habits.modal.checkboxTitle}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  {i18n.habits.modal.checkboxDesc}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setHabitType('measurable')}
                className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all min-w-0 ${
                  habitType === 'measurable'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:border-emerald-400 dark:bg-[#203a2e]/30'
                    : 'border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#181D24] opacity-80'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sliders
                    className={`h-4 w-4 shrink-0 ${
                      habitType === 'measurable'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-400'
                    }`}
                  />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {i18n.habits.modal.measurableTitle}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  {i18n.habits.modal.measurableDesc}
                </p>
              </button>
            </div>
          </div>

          {/* Numeric Target Settings (if measurable) */}
          {habitType === 'measurable' && (
            <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-[#15221b] border border-emerald-500/20 flex flex-col gap-3 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                  {i18n.habits.modal.dailyTargetLabel}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleStepper(-5)}
                    className="w-8 h-8 rounded-full bg-white dark:bg-[#1B2129] border border-slate-200 dark:border-[#2A323D] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 active:scale-95"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-base font-bold text-emerald-800 dark:text-emerald-300 min-w-[40px] text-center">
                    {targetValue}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleStepper(5)}
                    className="w-8 h-8 rounded-full bg-white dark:bg-[#1B2129] border border-slate-200 dark:border-[#2A323D] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 active:scale-95"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Unit Input and Suggestions */}
              <div className="flex flex-col gap-1.5 min-w-0">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  {i18n.habits.modal.unitLabel}
                </label>
                <input
                  type="text"
                  value={targetUnit}
                  onChange={(e) => setTargetUnit(e.target.value)}
                  placeholder={i18n.habits.modal.unitPlaceholder}
                  className="w-full bg-white dark:bg-[#1B2129] text-slate-900 dark:text-slate-100 font-medium text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-[#2A323D] focus:outline-none"
                />
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {UNIT_SUGGESTIONS.map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => setTargetUnit(unit)}
                      className={`text-[10px] px-2 py-0.5 rounded-md border transition-all ${
                        targetUnit === unit
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white dark:bg-[#1B2129] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#2A323D]'
                      }`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Repeat Schedule (Days of Week) */}
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {i18n.habits.modal.scheduleLabel}
              </label>
              <span className="text-xs text-slate-500 dark:text-[#94A3B8]">
                {scheduledDays.length === 7
                  ? i18n.habits.modal.scheduleEveryday
                  : scheduledDays.length === 5 && !scheduledDays.includes(6) && !scheduledDays.includes(7)
                  ? i18n.habits.modal.scheduleWeekdays
                  : i18n.habits.modal.scheduleDaysPerWeek(scheduledDays.length)}
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-2 w-full">
              {DAYS_OF_WEEK.map((day) => {
                const isActive = scheduledDays.includes(day.id);
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => toggleDay(day.id)}
                    className={`h-9 sm:h-11 rounded-xl text-xs font-bold transition-all min-w-0 flex items-center justify-center p-0 ${
                      isActive
                        ? 'bg-emerald-700 text-white dark:bg-emerald-400 dark:text-slate-950 shadow-sm'
                        : 'bg-slate-100 dark:bg-[#1B2129] text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-[#252C36]'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visual Identity: Icon & Color */}
          <div className="flex flex-col gap-3 min-w-0 max-w-full">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {i18n.habits.modal.visualLabel}
            </label>

            {/* Icon Picker */}
            <div className="w-full min-w-0 max-w-full overflow-hidden">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar w-full">
                {ICONS.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedIcon === item.name;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setSelectedIcon(item.name)}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-[#203a2e] dark:text-emerald-300 shadow-sm'
                          : 'border-slate-200 dark:border-[#2A323D] bg-slate-50 dark:bg-[#1B2129] text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                      }`}
                      title={item.label}
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Palette */}
            <div className="flex items-center gap-2.5 sm:gap-3 pt-1 flex-wrap">
              {COLORS.map((col) => {
                const isSelected = selectedColor === col.hex;
                return (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => setSelectedColor(col.hex)}
                    style={{ backgroundColor: col.hex }}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-transform flex items-center justify-center shadow-sm shrink-0 ${
                      isSelected ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110' : 'hover:scale-105'
                    }`}
                    title={col.name}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Habit Anchor Field */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-[#181D24] border border-slate-200/80 dark:border-[#2A323D] flex flex-col gap-2 min-w-0">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-[#54C28E]">
              <Anchor className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {i18n.habits.modal.anchorLabel}
              </span>
            </div>
            <input
              type="text"
              value={anchor}
              onChange={(e) => setAnchor(e.target.value)}
              placeholder={i18n.habits.modal.anchorPlaceholder}
              className="w-full bg-white dark:bg-[#1B2129] text-slate-900 dark:text-slate-100 font-medium text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-[#2A323D] focus:outline-none"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {i18n.habits.modal.anchorDesc}
            </p>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 w-full">
            <button
              type="submit"
              className="w-full h-12 sm:h-13 py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-400 dark:hover:bg-emerald-300 text-white dark:text-slate-950 font-bold text-sm shadow-lg shadow-emerald-700/25 dark:shadow-emerald-400/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isEditMode ? (
                <>
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>{i18n.habits.modal.saveButton}</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>{i18n.habits.modal.createButton}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-semibold transition-colors"
            >
              {i18n.habits.modal.cancelButton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
