import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertTriangle, RefreshCw, Layers } from 'lucide-react';
import { backupService } from '../../services/backupService';

export default function RestoreModal({ isOpen, onClose, onSuccess, onError }) {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [restoreMode, setRestoreMode] = useState('replace'); // 'replace' | 'merge'
  const [backupCurrentFirst, setBackupCurrentFirst] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setValidationError('');
    setParsedData(null);
    setIsParsing(true);

    try {
      const result = await backupService.parseAndValidateBackupFile(selectedFile);
      setParsedData(result);
    } catch (err) {
      console.error('Validation error:', err);
      setValidationError(err.message || 'Berkas cadangan tidak valid.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleResetFile = () => {
    setFile(null);
    setParsedData(null);
    setValidationError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExecuteRestore = async () => {
    if (!parsedData?.payload) return;

    setIsRestoring(true);
    try {
      // Jika mode replace dan opsi backup saat ini dicentang, ekspor dulu secara otomatis
      if (restoreMode === 'replace' && backupCurrentFirst) {
        try {
          await backupService.exportBackup({ shareIfSupported: false });
        } catch (backupErr) {
          console.warn('Gagal membuat cadangan otomatis sebelum replace:', backupErr);
        }
      }

      const result = await backupService.restoreBackup(parsedData.payload, restoreMode);
      onSuccess?.(result);
      onClose();
    } catch (err) {
      console.error('Restore error:', err);
      onError?.(err.message || 'Gagal memulihkan data cadangan.');
    } finally {
      setIsRestoring(false);
    }
  };

  const formatExportedDate = (isoStr) => {
    if (!isoStr) return 'Waktu tidak diketahui';
    try {
      const dt = new Date(isoStr);
      return dt.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#1B2129] border border-slate-200 dark:border-[#2A323D] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-[#2A323D] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-[#54C28E] flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Pulihkan Data (Restore)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pilih file JSON cadangan Habitly Anda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isRestoring}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#202731] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* File Upload Zone */}
          {!parsedData ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
                id="restore-file-input"
              />
              <label
                htmlFor="restore-file-input"
                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                  validationError
                    ? 'border-rose-400 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-950/20'
                    : 'border-slate-300 dark:border-[#2A323D] hover:border-emerald-500 bg-slate-50/60 dark:bg-[#14181D]'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#1B2129] shadow-sm flex items-center justify-center text-slate-500 dark:text-slate-400 mb-3 border border-slate-200/60 dark:border-[#2A323D]">
                  {isParsing ? (
                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 text-center">
                  {isParsing ? 'Menganalisis berkas...' : 'Klik untuk memilih berkas backup (.json)'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">
                  Format berkas cadangan resmi Habitly (schema v1)
                </p>
              </label>

              {validationError && (
                <div className="mt-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">Validasi Berkas Gagal</p>
                    <p className="mt-0.5 leading-relaxed">{validationError}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* File Summary Preview Card */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#14181D] border border-slate-200/80 dark:border-[#2A323D] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-5 h-5 text-emerald-600 dark:text-[#54C28E] shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {file?.name || 'habitly-backup.json'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Diekspor: {formatExportedDate(parsedData.summary.exportedAt)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetFile}
                    className="text-xs text-emerald-700 dark:text-[#54C28E] hover:underline shrink-0"
                  >
                    Ganti file
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 dark:border-[#2A323D]">
                  <div className="text-center p-2 rounded-xl bg-white dark:bg-[#1B2129] border border-slate-100 dark:border-[#2A323D]">
                    <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                      {parsedData.summary.habitsCount}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Kebiasaan</div>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-white dark:bg-[#1B2129] border border-slate-100 dark:border-[#2A323D]">
                    <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                      {parsedData.summary.logsCount}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Catatan Log</div>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-white dark:bg-[#1B2129] border border-slate-100 dark:border-[#2A323D]">
                    <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                      {parsedData.summary.categoriesCount}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Kategori</div>
                  </div>
                </div>
              </div>

              {/* Mode Selection */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Pilih Metode Pemulihan:
                </label>

                {/* Option 1: Replace */}
                <div
                  onClick={() => setRestoreMode('replace')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    restoreMode === 'replace'
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-[#54C28E]'
                      : 'border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#1B2129] hover:bg-slate-50 dark:hover:bg-[#202731]'
                  }`}
                >
                  <input
                    type="radio"
                    name="restoreMode"
                    value="replace"
                    checked={restoreMode === 'replace'}
                    onChange={() => setRestoreMode('replace')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        Ganti Semua (Replace)
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                        SRS-FR-017
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Mengosongkan semua data lama dan mengisi ulang sesuai berkas cadangan ini.
                    </p>
                  </div>
                </div>

                {/* Option 2: Merge */}
                <div
                  onClick={() => setRestoreMode('merge')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    restoreMode === 'merge'
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-[#54C28E]'
                      : 'border-slate-200 dark:border-[#2A323D] bg-white dark:bg-[#1B2129] hover:bg-slate-50 dark:hover:bg-[#202731]'
                  }`}
                >
                  <input
                    type="radio"
                    name="restoreMode"
                    value="merge"
                    checked={restoreMode === 'merge'}
                    onChange={() => setRestoreMode('merge')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        Gabung Data (Merge)
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                        SRS-FR-018
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Pertahankan data yang ada. Jika ada rekaman dengan ID sama, data dengan pembaruan paling baru (Last-Write-Wins) yang dipertahankan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Safety notice for replace mode */}
              {restoreMode === 'replace' && (
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={backupCurrentFirst}
                    onChange={(e) => setBackupCurrentFirst(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-[11px] text-amber-900 dark:text-amber-300 leading-relaxed">
                    Cadangkan data saat ini secara otomatis sebelum proses penggantian dimulai (sangat direkomendasikan).
                  </span>
                </label>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#14181D] border-t border-slate-100 dark:border-[#2A323D] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isRestoring}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#2A323D] text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-[#202731] transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleExecuteRestore}
            disabled={!parsedData || isRestoring}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm"
          >
            {isRestoring ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Memulihkan...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Mulai Pemulihan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
