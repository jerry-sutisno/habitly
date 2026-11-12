import React, { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { calendarService } from '../services/calendarService';
import CalendarHeader from '../components/calendar/CalendarHeader';
import MonthlyRhythmBanner from '../components/calendar/MonthlyRhythmBanner';
import CalendarGrid from '../components/calendar/CalendarGrid';
import CalendarLegend from '../components/calendar/CalendarLegend';
import SelectedDateDetail from '../components/calendar/SelectedDateDetail';
import QuietSanctuaryCallout from '../components/calendar/QuietSanctuaryCallout';

export default function CalendarPage() {
  const { theme, toggleTheme } = useTheme();

  const [overview, setOverview] = useState({
    monthName: 'Oktober 2024',
    year: 2024,
    month: 9,
    todayDate: 24,
    firstDayOffset: 2,
    totalDays: 31,
    consistencyRate: 82,
    activeDaysLogged: 22,
    trendText: '+4%',
  });
  const [daysData, setDaysData] = useState({});
  const [selectedDate, setSelectedDate] = useState(24);
  const [dateDetail, setDateDetail] = useState(null);

  const loadCalendarData = async () => {
    try {
      const ov = await calendarService.getMonthOverview(overview.year, overview.month);
      setOverview(ov);

      const days = await calendarService.getMonthDays(overview.year, overview.month);
      setDaysData(days);

      const detail = await calendarService.getDateDetails(selectedDate, overview.year, overview.month);
      setDateDetail(detail);
    } catch (err) {
      console.error('Error loading calendar data:', err);
    }
  };

  useEffect(() => {
    loadCalendarData();
  }, [overview.year, overview.month, selectedDate]);

  const handleSelectDate = async (dateNum) => {
    setSelectedDate(dateNum);
    const detail = await calendarService.getDateDetails(dateNum, overview.year, overview.month);
    setDateDetail(detail);
  };

  const handleToggleHabit = async (dateNum, habitId) => {
    await calendarService.toggleDateHabit(dateNum, habitId, overview.year, overview.month);
    await loadCalendarData();
  };

  const handleJumpToday = () => {
    setSelectedDate(overview.todayDate);
  };

  const handlePrevMonth = () => {
    setOverview((prev) => {
      const newMonth = prev.month === 0 ? 11 : prev.month - 1;
      const newYear = prev.month === 0 ? prev.year - 1 : prev.year;
      return { ...prev, month: newMonth, year: newYear };
    });
  };

  const handleNextMonth = () => {
    setOverview((prev) => {
      const newMonth = prev.month === 11 ? 0 : prev.month + 1;
      const newYear = prev.month === 11 ? prev.year + 1 : prev.year;
      return { ...prev, month: newMonth, year: newYear };
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header: Navigator, Today Button, Dark/Light Toggle */}
      <CalendarHeader
        monthName={overview.monthName}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onJumpToday={handleJumpToday}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Monthly Rhythm Consistency Banner */}
      <MonthlyRhythmBanner
        consistencyRate={overview.consistencyRate}
        activeDaysLogged={overview.activeDaysLogged}
        trendText={overview.trendText}
      />

      {/* Main Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Desktop 7 cols): Monthly Calendar Grid & Status Legend */}
        <div className="lg:col-span-7 space-y-6">
          <CalendarGrid
            totalDays={overview.totalDays}
            firstDayOffset={overview.firstDayOffset}
            daysData={daysData}
            selectedDate={selectedDate}
            todayDate={overview.todayDate}
            onSelectDate={handleSelectDate}
          />

          {/* Explicit Status Legend with Icons & Labels */}
          <CalendarLegend />
        </div>

        {/* Right Column (Desktop 5 cols): Selected Date Detail & Mindful Sanctuary */}
        <div className="lg:col-span-5 space-y-6">
          <SelectedDateDetail
            dateDetail={dateDetail}
            onToggleHabit={handleToggleHabit}
          />

          <QuietSanctuaryCallout />
        </div>
      </div>
    </div>
  );
}
