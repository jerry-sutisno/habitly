import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BarChart3,
  Settings,
  Sparkles,
  User,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { usePWA } from '../hooks/usePWA';
import PwaNotificationBanner from '../components/common/PwaNotificationBanner';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'My Habits', path: '/habits', icon: CheckSquare },
  { name: 'Calendar', path: '/calendar', icon: Calendar },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function AppLayout({ children }) {
  const pwaState = usePWA();
  const { isOffline } = pwaState;

  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('habitly-user-name') || 'Jerry Sutisno';
  });

  useEffect(() => {
    const handleUserUpdate = (e) => {
      if (e.detail?.name) {
        setUserName(e.detail.name);
      }
    };
    window.addEventListener('habitly-user-updated', handleUserUpdate);
    return () => window.removeEventListener('habitly-user-updated', handleUserUpdate);
  }, []);
  return (
    <div className="flex min-h-screen bg-[#f6faff] dark:bg-[#0F1216] text-[#141d23] dark:text-[#F1F5F9] font-sans antialiased transition-colors duration-200">
      {/* Sidebar for Laptop / Desktop (hidden on mobile) */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30 border-r border-slate-200/80 dark:border-[#2A323D] bg-white dark:bg-[#14181D] shadow-[0_1px_16px_rgba(33,37,41,0.03)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.35)]">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-100 dark:border-[#2A323D]/60">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-700 dark:bg-[#203a2e] text-white dark:text-[#54C28E] border border-emerald-600/20 shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-emerald-800 dark:text-[#54C28E] leading-tight">
              HABITLY
            </span>
            <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-medium">
              Mindful Tracker
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-150 min-h-[44px] ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-[#203a2e] dark:text-[#9ce3be] dark:border dark:border-[#54C28E]/25 font-semibold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-[#94A3B8] dark:hover:text-[#F1F5F9] dark:hover:bg-[#1B2129]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-5 w-5 transition-transform duration-150 ${
                        isActive
                          ? 'text-emerald-700 dark:text-[#54C28E] scale-105'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile in sidebar footer */}
        <div className="p-4 border-t border-slate-100 dark:border-[#2A323D]/60 space-y-2.5">
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-[#1B2129] border border-slate-200/60 dark:border-[#2A323D]">
            <div className="w-8 h-8 rounded-full bg-emerald-700 dark:bg-[#203a2e] text-white dark:text-[#54C28E] flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-slate-800 dark:text-[#F1F5F9] truncate">
                {userName}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] truncate">
                Grounded &amp; Present
              </span>
            </div>
          </div>

          {/* Network Connection Status Indicator */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#14181D] border border-slate-200/40 dark:border-[#2A323D] text-[11px]">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOffline ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                }`}
              />
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                {isOffline ? 'Mode Offline' : 'Tersambung'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Lokal Dexie</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Top bar on Mobile */}
        <header className="md:hidden sticky top-0 z-20 flex items-center justify-between px-4 h-16 bg-white/90 dark:bg-[#0F1216]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-[#2A323D] pt-safe">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-700 dark:bg-[#203a2e] text-white dark:text-[#54C28E] shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-emerald-800 dark:text-[#54C28E]">
              HABITLY
            </span>
          </div>

          {/* Mobile Offline / Online Status Pill */}
          <div
            className={`flex items-center gap-1.5 text-[11px] font-semibold tracking-wide px-2.5 py-0.5 rounded-full border transition-all ${
              isOffline
                ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-500/30'
                : 'bg-emerald-50 text-emerald-800 dark:bg-[#203a2e] dark:text-[#9ce3be] border-emerald-500/20'
            }`}
          >
            {isOffline ? (
              <>
                <WifiOff className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Offline</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-[#54C28E]" />
                <span>Offline-First</span>
              </>
            )}
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 pb-28 md:pb-12">
          {children}
        </main>
      </div>

      {/* PWA Floating Notification Banner (Update Available & Offline Alerts) */}
      <PwaNotificationBanner pwaState={pwaState} />

      {/* Bottom Navigation for HP / Mobile (hidden on desktop) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#14181D]/95 backdrop-blur-xl border-t border-slate-200 dark:border-[#2A323D] pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] px-2 shadow-[0_-4px_24px_rgba(20,29,35,0.04)]"
      >
        <div className="flex items-center justify-around h-16">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-2 py-1 rounded-2xl transition-all duration-150 ${
                    isActive
                      ? 'text-emerald-700 dark:text-[#54C28E] font-semibold'
                      : 'text-slate-500 hover:text-slate-800 dark:text-[#94A3B8] dark:hover:text-[#F1F5F9]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-5 w-5 mb-1 transition-transform duration-150 ${
                        isActive
                          ? 'scale-110 text-emerald-700 dark:text-[#54C28E]'
                          : ''
                      }`}
                    />
                    <span className="text-[11px] tracking-tight leading-none truncate">
                      {item.name}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
