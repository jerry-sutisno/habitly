import React, { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { usePWA } from '../hooks/usePWA';
import { settingsService } from '../services/settingsService';
import { backupService } from '../services/backupService';
import { id as i18n } from '../i18n/id';
import SettingsHeader from '../components/settings/SettingsHeader';
import ProfileCard from '../components/settings/ProfileCard';
import AppearanceCard from '../components/settings/AppearanceCard';
import BackupRestoreCard from '../components/settings/BackupRestoreCard';
import AppSystemCard from '../components/settings/AppSystemCard';
import GentleRemindersCard from '../components/settings/GentleRemindersCard';
import DangerZoneCard from '../components/settings/DangerZoneCard';
import SettingsFooter from '../components/settings/SettingsFooter';
import SettingsToast from '../components/settings/SettingsToast';
import RestoreModal from '../components/settings/RestoreModal';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { isInstallable, isInstalled, promptInstall } = usePWA();
  const [profile, setProfile] = useState({
    displayName: 'Jerry Sutisno',
    membershipStatus: 'Active Member',
    reflectionTime: '08:00 PM',
    remindersEnabled: true,
    lastSynced: 'Hari ini, 08:45 WIB',
    syncMode: 'Offline Lokal',
    storageUsed: '2.4 MB',
    storedHabitsCount: 5,
    storageStatus: 'Healthy',
    appVersion: 'v2.4.0 (Calm Canvas)',
  });

  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);

  const showToast = (message) => {
    setToastMessage(message);
    setIsToastVisible(true);
    setTimeout(() => {
      setIsToastVisible(false);
    }, 3000);
  };

  const loadProfile = async () => {
    try {
      const p = await settingsService.getUserProfile();
      setProfile(p);
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSelectTheme = (newTheme) => {
    setTheme(newTheme);
    const themeLabels = {
      light: 'Mode Terang (Light)',
      dark: 'Mode Gelap (Dark)',
      system: 'Mode Sistem Otomatis',
    };
    showToast(`Tema dialihkan ke ${themeLabels[newTheme] || newTheme}`);
  };

  const handleExportBackup = async () => {
    try {
      const result = await backupService.exportBackup();
      if (result.success) {
        await loadProfile();
        if (result.method === 'share') {
          showToast('Berkas cadangan berhasil dibagikan');
        } else if (result.method === 'download') {
          showToast(`Cadangan berhasil diunduh (${result.filename})`);
        } else {
          showToast('Proses berbagi berkas dibatalkan');
        }
      }
    } catch (err) {
      console.error('Export error:', err);
      showToast('Gagal mengekspor data: ' + err.message);
    }
  };

  const handleRestoreBackup = () => {
    setIsRestoreModalOpen(true);
  };

  const handleRestoreSuccess = async (result) => {
    await loadProfile();
    const modeLabel = result.mode === 'replace' ? 'Ganti Semua' : 'Gabung';
    showToast(`Data cadangan berhasil dipulihkan (${modeLabel})!`);
  };

  const handleRestoreError = (errMsg) => {
    showToast(`Pemulihan gagal: ${errMsg}`);
  };

  const handleInstallApp = async () => {
    if (isInstalled) {
      showToast('Aplikasi Habitly sudah terpasang di perangkat ini.');
      return;
    }
    if (isInstallable) {
      const res = await promptInstall();
      if (res?.outcome === 'accepted') {
        showToast('Habitly berhasil ditambahkan ke layar utama!');
      }
    } else {
      showToast(
        'Gunakan opsi "Tambahkan ke Layar Utama" atau ikon Install di bilah peramban untuk memasang Habitly.'
      );
    }
  };

  const handleToggleReminders = async (enabled) => {
    await settingsService.updateSettings('general', { remindersEnabled: enabled });
    await loadProfile();
    showToast(enabled ? 'Pengingat lembut diaktifkan' : 'Mode hening aktif');
  };

  const handleResetData = async () => {
    const userInput = window.prompt(i18n.settings.resetConfirmPrompt);

    if (userInput === 'HAPUS') {
      try {
        // Buat backup otomatis terlebih dahulu sebelum dihapus
        try {
          await backupService.exportBackup({ shareIfSupported: false });
        } catch {
          // ignore
        }
        await backupService.restoreBackup(
          {
            app: 'habitly',
            schemaVersion: 1,
            exportedAt: new Date().toISOString(),
            data: { categories: [], habits: [], habit_logs: [], settings: [] },
          },
          'replace'
        );
        await loadProfile();
        showToast(i18n.settings.resetSuccessToast);
      } catch (err) {
        showToast('Gagal membersihkan data: ' + err.message);
      }
    } else if (userInput !== null) {
      showToast(i18n.settings.resetCancelledToast);
    }
  };

  const handleNameChange = async (newName) => {
    const savedName = await settingsService.saveDisplayName(newName);
    setProfile((prev) => ({ ...prev, displayName: savedName }));
    showToast(`Nama pengguna disimpan: ${savedName}`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <SettingsHeader />

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Desktop 6 cols): Profile, Appearance & Backup */}
        <div className="lg:col-span-6 space-y-6">
          {/* User Profile Card */}
          <ProfileCard
            displayName={profile.displayName}
            membershipStatus={profile.membershipStatus}
            reflectionTime={profile.reflectionTime}
            onNameChange={handleNameChange}
          />

          {/* Theme / Appearance Switcher */}
          <AppearanceCard
            currentTheme={theme}
            onSelectTheme={handleSelectTheme}
          />

          {/* Backup & Restore Card */}
          <BackupRestoreCard
            lastSynced={profile.lastSynced}
            syncMode={profile.syncMode}
            onExportClick={handleExportBackup}
            onRestoreClick={handleRestoreBackup}
          />
        </div>

        {/* Right Column (Desktop 6 cols): App System, Reminders & Danger Zone */}
        <div className="lg:col-span-6 space-y-6">
          {/* Install App PWA & Storage Status */}
          <AppSystemCard
            storageUsed={profile.storageUsed}
            storedHabitsCount={profile.storedHabitsCount}
            storageStatus={profile.storageStatus}
            isInstallable={isInstallable}
            isInstalled={isInstalled}
            onInstallClick={handleInstallApp}
            onPersistentStorageChanged={(granted) => {
              showToast(
                granted
                  ? 'Penyimpanan persisten aktif (data terlindung)!'
                  : 'Penyimpanan persisten belum diizinkan.'
              );
            }}
          />

          {/* Gentle Reminders */}
          <GentleRemindersCard
            initialEnabled={profile.remindersEnabled}
            onToggle={handleToggleReminders}
          />

          {/* Danger Zone: Erase Data */}
          <DangerZoneCard onResetClick={handleResetData} />

          {/* Footer Branding */}
          <SettingsFooter appVersion={profile.appVersion} />
        </div>
      </div>

      {/* Restore Modal Dialog */}
      <RestoreModal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        onSuccess={handleRestoreSuccess}
        onError={handleRestoreError}
      />

      {/* Toast Feedback Notification */}
      <SettingsToast
        message={toastMessage}
        isVisible={isToastVisible}
      />
    </div>
  );
}
