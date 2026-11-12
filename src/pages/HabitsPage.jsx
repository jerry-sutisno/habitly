import React, { useState, useEffect } from 'react';
import { habitService } from '../services/habitService';
import { useTheme } from '../hooks/useTheme';
import HabitsHeader from '../components/habits/HabitsHeader';
import FocusMetricBanner from '../components/habits/FocusMetricBanner';
import CategoryPills from '../components/habits/CategoryPills';
import HabitListCard from '../components/habits/HabitListCard';
import AddHabitModal from '../components/habits/AddHabitModal';
import { Plus, CheckSquare, Archive, Sparkles } from 'lucide-react';
import { id as i18n } from '../i18n/id';

export default function HabitsPage() {
  const { theme, toggleTheme } = useTheme();

  // State from real habitService
  const [habits, setHabits] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [focusMetrics, setFocusMetrics] = useState({
    activeDays: 22,
    cadenceRate: '88% Rhythm',
    longestStreak: 18,
    focusSummary: 'Kebiasaan mindful aktif dipertahankan dengan konsisten',
  });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'archived'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  const loadHabitsData = async () => {
    try {
      const h = await habitService.getAllHabits({ includeArchived: true });
      setHabits(h);

      const cats = await habitService.getCategories();
      setCategories(cats);

      const m = await habitService.getFocusMetrics();
      setFocusMetrics(m);
    } catch (err) {
      console.error('Error loading habits:', err);
    }
  };

  useEffect(() => {
    loadHabitsData();
    const handleRestored = () => loadHabitsData();
    window.addEventListener('habitly-data-restored', handleRestored);
    return () => window.removeEventListener('habitly-data-restored', handleRestored);
  }, []);

  // Filter habits by archive status and category
  const filteredHabits = habits.filter((h) => {
    const matchesArchive = activeTab === 'archived' ? h.isArchived : !h.isArchived;
    if (!matchesArchive) return false;

    if (selectedCategory.toLowerCase() === 'all') return true;
    return (h.category || '').toLowerCase() === selectedCategory.toLowerCase();
  });

  const activeCount = habits.filter((h) => !h.isArchived).length;
  const archivedCount = habits.filter((h) => h.isArchived).length;

  const handleToggleHabit = async (id) => {
    await habitService.toggleHabit(id);
    await loadHabitsData();
  };

  const handleOpenAddModal = () => {
    setEditingHabit(null);
    setIsAddModalOpen(true);
  };

  const handleEditHabit = (habit) => {
    setEditingHabit(habit);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingHabit(null);
  };

  const handleSaveHabit = async (habitData) => {
    try {
      if (editingHabit) {
        await habitService.updateHabit(editingHabit.id, habitData);
      } else {
        await habitService.addHabit(habitData);
      }
      setIsAddModalOpen(false);
      setEditingHabit(null);
      await loadHabitsData();
    } catch (err) {
      alert(`Gagal menyimpan kebiasaan: ${err.message}`);
    }
  };

  const handleDeleteHabit = async (id, name) => {
    const confirmation = window.confirm(i18n.habits.confirmDelete(name));
    if (confirmation) {
      try {
        await habitService.deleteHabit(id);
        await loadHabitsData();
      } catch (err) {
        alert(`Gagal menghapus kebiasaan: ${err.message}`);
      }
    }
  };

  const handleArchiveHabit = async (id) => {
    try {
      await habitService.archiveHabit(id);
      await loadHabitsData();
    } catch (err) {
      alert(`Gagal mengarsipkan kebiasaan: ${err.message}`);
    }
  };

  const handleUnarchiveHabit = async (id) => {
    try {
      await habitService.unarchiveHabit(id);
      await loadHabitsData();
    } catch (err) {
      alert(`Gagal memulihkan kebiasaan: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col gap-6 relative pb-12">
      {/* 1. Page Header with Title, Active Count & Theme Toggle */}
      <HabitsHeader
        activeCount={activeCount}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenAddModal={handleOpenAddModal}
      />

      {/* 2. Calming Horizon Focus Metric Banner */}
      <FocusMetricBanner metrics={focusMetrics} />

      {/* 3. Tab Filter (Aktif vs Diarsipkan) & Category Pills */}
      <div className="flex flex-col gap-3 min-w-0 max-w-full">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Active vs Archived Segmented Control */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-[#1B2129] rounded-full border border-slate-200/80 dark:border-[#2A323D] max-w-full">
            <button
              type="button"
              onClick={() => setActiveTab('active')}
              className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'active'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {i18n.habits.tabActive(activeCount)}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('archived')}
              className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'archived'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {i18n.habits.tabArchived(archivedCount)}
            </button>
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
            {activeTab === 'archived'
              ? i18n.habits.tabArchivedSubtitle
              : i18n.habits.tabActiveSubtitle}
          </span>
        </div>

        {/* Category Filter Pills Container */}
        <div className="min-w-0 max-w-full">
          <CategoryPills
            categories={categories}
            habits={habits.filter((h) => (activeTab === 'archived' ? h.isArchived : !h.isArchived))}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>
      </div>

      {/* 4. Habit List Cards */}
      <div className="flex flex-col gap-3">
        {filteredHabits.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 sm:p-12 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              {activeTab === 'archived' ? (
                <Archive className="w-6 h-6" />
              ) : (
                <CheckSquare className="w-6 h-6" />
              )}
            </div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              {activeTab === 'archived'
                ? i18n.habits.emptyArchivedTitle
                : i18n.habits.emptyActiveTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
              {activeTab === 'archived'
                ? i18n.habits.emptyArchivedSubtitle
                : i18n.habits.emptyActiveSubtitle}
            </p>
            {activeTab === 'active' && (
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="mt-4 px-4 py-2 rounded-full bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm hover:bg-emerald-700 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{i18n.habits.addHabitCta}</span>
              </button>
            )}
          </div>
        ) : (
          filteredHabits.map((habit) => (
            <HabitListCard
              key={habit.id}
              habit={habit}
              onToggle={handleToggleHabit}
              onEdit={handleEditHabit}
              onDelete={handleDeleteHabit}
              onArchive={handleArchiveHabit}
              onUnarchive={handleUnarchiveHabit}
            />
          ))
        )}
      </div>

      {/* Floating Add Habit Button on Mobile */}
      {activeTab === 'active' && (
        <div className="sm:hidden fixed bottom-24 right-4 z-40">
          <button
            type="button"
            onClick={handleOpenAddModal}
            aria-label="Add new habit"
            className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center justify-center transition-transform active:scale-95"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Add / Edit Habit Modal */}
      <AddHabitModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveHabit}
        habitToEdit={editingHabit}
        availableCategories={categories}
      />
    </div>
  );
}
