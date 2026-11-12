import React, { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { analyticsService } from '../services/analyticsService';
import AnalyticsHeader from '../components/analytics/AnalyticsHeader';
import CompletionRateCard from '../components/analytics/CompletionRateCard';
import DailyBreakdownChart from '../components/analytics/DailyBreakdownChart';
import MetricHighlightCards from '../components/analytics/MetricHighlightCards';
import CategoryBreakdownChart from '../components/analytics/CategoryBreakdownChart';
import MindfulThoughtCard from '../components/analytics/MindfulThoughtCard';

export default function AnalyticsPage() {
  const { theme, toggleTheme } = useTheme();
  const [timeRange, setTimeRange] = useState('7d');
  const [data, setData] = useState({
    completionRate: 84,
    trendText: '+6% vs minggu lalu',
    isTrendPositive: true,
    momentumMessage: "You're building strong, steady momentum this week.",
    dailyBreakdown: [],
    bestHabit: { name: 'Morning Meditation', category: 'Mindfulness', streak: 18, rate: 98 },
    mostConsistentDay: { day: 'Selasa', avgRate: 94, description: '94% avg rate' },
    stats: { totalCheckins: 28, perfectDays: 4, currentStreak: 18, bestStreak: 24 },
    categoryPerformance: [],
    mindfulThought: 'Notice the small victories. Every mindful repetition shapes your future self.',
  });

  const loadAnalytics = async () => {
    try {
      const res = await analyticsService.getAnalyticsData(timeRange);
      setData(res);
    } catch (err) {
      console.error('Error loading analytics:', err);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header: Title, Time Filter Pills (7d, 30d, 90d), Theme Toggle & Share */}
      <AnalyticsHeader
        timeRange={timeRange}
        onSelectTimeRange={setTimeRange}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Desktop 7 cols): Completion Rate, Recharts Daily Breakdown & Category Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          {/* Overall Completion Rate Card */}
          <CompletionRateCard
            completionRate={data.completionRate}
            trendText={data.trendText}
            isTrendPositive={data.isTrendPositive}
            momentumMessage={data.momentumMessage}
          />

          {/* Daily Breakdown Chart with Recharts */}
          <DailyBreakdownChart
            dailyData={data.dailyBreakdown}
            timeRange={timeRange}
          />

          {/* Category Performance Breakdown */}
          <CategoryBreakdownChart
            categoryData={data.categoryPerformance}
          />
        </div>

        {/* Right Column (Desktop 5 cols): Metric Highlights & Mindful Thought */}
        <div className="lg:col-span-5 space-y-6">
          {/* Highlights: Best Habit, Most Consistent Day, Perfect Days, Total Check-ins */}
          <MetricHighlightCards
            bestHabit={data.bestHabit}
            mostConsistentDay={data.mostConsistentDay}
            stats={data.stats}
          />

          {/* Mindful Sanctuary Thought Callout */}
          <MindfulThoughtCard
            thought={data.mindfulThought}
          />
        </div>
      </div>
    </div>
  );
}
