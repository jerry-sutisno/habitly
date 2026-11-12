import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import { habitService } from '../services/habitService';
import { backupService } from '../services/backupService';
import { useTheme } from '../hooks/useTheme';
import GreetingHeader from '../components/dashboard/GreetingHeader';
import WeekCalendarRibbon from '../components/dashboard/WeekCalendarRibbon';
import DailyProgressCard from '../components/dashboard/DailyProgressCard';
import StatsCards from '../components/dashboard/StatsCards';
import HabitChecklist from '../components/dashboard/HabitChecklist';
import WeeklyRhythmChart from '../components/dashboard/WeeklyRhythmChart';
import MindfulQuoteCard from '../components/dashboard/MindfulQuoteCard';
import AddHabitModal from '../components/habits/AddHabitModal';
import BackupReminderBanner from '../components/dashboard/BackupReminderBanner';

export default function DashboardPage() {
  const { theme, toggleTheme } = useTheme();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showBackupReminder, setShowBackupReminder] = useState(false);

  // Real data state loaded via services
  const [profile, setProfile] = useState({
    name: 'Jerry',
    fullName: 'Jerry Sutisno',
    greetingSubtitle: 'Tarik napas, satu langkah dalam satu waktu.',
    cadenceText: 'Ritme Mindful',
  });
  const [habits, setHabits] = useState([]);
  const [stats, setStats] = useState({
    streakDays: 0,
    personalBest: 0,
    totalActiveHabits: 0,
    scheduledToday: 0,
    completedToday: 0,
    pendingToday: 0,
    progressPercent: 0,
    progressHeadline: 'Mulai Langkah Pertama',
    progressDescription: 'Tanam kebiasaan baru untuk memulai perjalanan mindful Anda hari ini.',
    routinesLeftText: '',
  });
  const [weekDays, setWeekDays] = useState([]);
  const [rhythmData, setRhythmData] = useState({
    summary: 'Memuat ritme...',
    average: '0% Rata-rata',
    days: [],
  });

  const quoteData = dashboardService.getDailyQuote();
  const anchorData = dashboardService.getDailyAnchor();

  const loadDashboardData = async () => {
    try {
      const p = await dashboardService.getProfile();
      setProfile(p);

      const h = await dashboardService.getTodayHabits();
      setHabits(h);

      const s = await dashboardService.getStats(h);
      setStats(s);

      const w = await dashboardService.getWeekCalendar();
      setWeekDays(w);

      const r = await dashboardService.getWeeklyRhythm();
      setRhythmData(r);

      const needsBackup = await backupService.shouldShowBackupReminder();
      setShowBackupReminder(needsBackup);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();

    const handleUserUpdate = () => {
      loadDashboardData();
    };
    window.addEventListener('habitly-user-updated', handleUserUpdate);
    window.addEventListener('habitly-data-restored', handleUserUpdate);
    return () => {
      window.removeEventListener('habitly-user-updated', handleUserUpdate);
      window.removeEventListener('habitly-data-restored', handleUserUpdate);
    };
  }, []);

  const handleToggleHabit = async (id) => {
    await dashboardService.toggleHabit(id);
    await loadDashboardData();
  };

  const handleSaveNewHabit = async (newHabitData) => {
    await habitService.addHabit(newHabitData);
    await loadDashboardData();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header Greeting & Actions */}
      <GreetingHeader
        profile={profile}
        theme={theme}
        onToggleTheme={toggleTheme}
        onAddHabit={() => setIsAddModalOpen(true)}
      />

      {/* Backup Reminder Banner (Shows when > 7 days or missing backup) */}
      {showBackupReminder && (
        <BackupReminderBanner
          onBackupComplete={() => {
            setShowBackupReminder(false);
          }}
        />
      )}

      {/* 2. Week Horizontal Calendar Ribbon */}
      <div className="w-full">
        <WeekCalendarRibbon weekDays={weekDays} />
      </div>

      {/* 3. Daily Progress Banner */}
      <DailyProgressCard stats={stats} />

      {/* 4. Two Small Stats Cards (Daily Streak & Best Streak) */}
      <StatsCards stats={stats} />

      {/* 5. Main Content 2-Column Grid on Laptop/Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Desktop 7 cols): Today Habit Checklist */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <HabitChecklist
            habits={habits}
            onToggleHabit={handleToggleHabit}
            onAddHabitClick={() => setIsAddModalOpen(true)}
          />
        </div>

        {/* Right Column (Desktop 5 cols): Weekly Rhythm Chart + Mindful Cards */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <WeeklyRhythmChart rhythmData={rhythmData} />
          <MindfulQuoteCard quoteData={quoteData} anchorData={anchorData} />
        </div>
      </div>

      {/* Add Habit Modal (Reusable across pages) */}
      <AddHabitModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveNewHabit}
      />
    </div>
  );
}
