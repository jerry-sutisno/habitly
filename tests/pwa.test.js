import { describe, it, expect, vi, beforeEach } from 'vitest';
import { storageService } from '../src/services/storageService';

describe('PWA & Persistent Storage Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('mengembalikan status persisted dari navigator.storage jika didukung', async () => {
    // Mock navigator.storage
    const originalStorage = globalThis.navigator?.storage;

    globalThis.navigator.storage = {
      persisted: vi.fn().mockResolvedValue(true),
      persist: vi.fn().mockResolvedValue(true),
      estimate: vi.fn().mockResolvedValue({ usage: 1024 * 1024 * 2.5, quota: 1024 * 1024 * 100 }),
    };

    const isPersisted = await storageService.isPersisted();
    expect(isPersisted).toBe(true);

    const isGranted = await storageService.requestPersistence();
    expect(isGranted).toBe(true);

    const estimate = await storageService.getStorageEstimate();
    expect(estimate.usageMb).toBe('2.5 MB');
    expect(estimate.quotaMb).toBe('100 MB');
    expect(estimate.percentUsed).toBe(2.5);

    // Restore
    if (originalStorage) {
      globalThis.navigator.storage = originalStorage;
    }
  });

  it('menangani secara aman jika navigator.storage tidak didukung oleh browser', async () => {
    const originalStorage = globalThis.navigator?.storage;
    delete globalThis.navigator.storage;

    const isPersisted = await storageService.isPersisted();
    expect(isPersisted).toBe(false);

    const isGranted = await storageService.requestPersistence();
    expect(isGranted).toBe(false);

    const estimate = await storageService.getStorageEstimate();
    expect(estimate.usageMb).toBe('< 1 MB');
    expect(estimate.quotaMb).toBe('Tersedia');

    if (originalStorage) {
      globalThis.navigator.storage = originalStorage;
    }
  });
});
