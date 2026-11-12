import { useState, useEffect } from 'react';

// Cek apakah sedang berjalan di peramban
const isBrowser = typeof window !== 'undefined';

export function usePWA() {
  // 1. Status Koneksi (Online / Offline)
  const [isOffline, setIsOffline] = useState(() => (isBrowser ? !navigator.onLine : false));

  // 2. Status Instalasi PWA
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (!isBrowser) return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://')
    );
  });

  // 3. Notifikasi Update / Versi Baru PWA
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [updateFunction, setUpdateFunction] = useState(null);

  // Monitor event online / offline
  useEffect(() => {
    if (!isBrowser) return;

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor event instalasi (beforeinstallprompt & appinstalled)
  useEffect(() => {
    if (!isBrowser) return;

    const handleBeforeInstallPrompt = (e) => {
      // Cegah banner otomatis browser bawaan agar tombol kita yang memicu
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Daftarkan Service Worker dengan vite-plugin-pwa (registerType: 'prompt')
  useEffect(() => {
    if (!isBrowser || !('serviceWorker' in navigator)) return;

    // Gunakan dynamic import virtual:pwa-register agar aman saat running di lingkungan non-browser
    let isCancelled = false;
    import('virtual:pwa-register')
      .then(({ registerSW }) => {
        if (isCancelled) return;
        const updateSW = registerSW({
          immediate: true,
          onNeedRefresh() {
            setNeedRefresh(true);
          },
          onOfflineReady() {
            setOfflineReady(true);
            setTimeout(() => setOfflineReady(false), 5000);
          },
        });
        setUpdateFunction(() => updateSW);
      })
      .catch((err) => {
        // Fallback jika virtual module tidak tersedia (misal di test mock)
        console.debug('PWA Service Worker registration skipped or not supported:', err);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  // Fungsi memicu dialog install PWA
  const promptInstall = async () => {
    if (!deferredPrompt) {
      return { outcome: 'unavailable' };
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
      return choiceResult;
    } catch (err) {
      console.warn('Gagal memicu install prompt:', err);
      return { outcome: 'dismissed' };
    }
  };

  // Fungsi memperbarui aplikasi ke versi terbaru
  const reloadApp = () => {
    if (updateFunction) {
      updateFunction(true);
    } else {
      window.location.reload();
    }
  };

  const dismissUpdate = () => {
    setNeedRefresh(false);
  };

  return {
    isOffline,
    isInstallable,
    isInstalled,
    promptInstall,
    needRefresh,
    offlineReady,
    reloadApp,
    dismissUpdate,
  };
}
