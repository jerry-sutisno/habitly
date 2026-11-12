import React, { useRef, useState, useEffect } from 'react';
import { Camera, Edit2, Sparkles, Check, User } from 'lucide-react';

export default function ProfileCard({
  displayName = 'Jerry Sutisno',
  membershipStatus = 'Active Member',
  reflectionTime = '08:00 PM',
  onNameChange,
}) {
  const [name, setName] = useState(displayName);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setName(displayName);
  }, [displayName]);

  const handleEditClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleSave = () => {
    setIsEditing(false);
    if (onNameChange) {
      onNameChange(name);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div className="bg-white dark:bg-[#1B2129] rounded-2xl border border-slate-200/80 dark:border-[#2A323D] p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-4">
        {/* Avatar with Camera Overlay */}
        <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 shadow-sm bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950/60 dark:to-teal-950/60 flex items-center justify-center border-2 border-emerald-500/20">
          <User className="w-8 h-8 text-emerald-700 dark:text-[#54C28E]" />
          <button
            type="button"
            aria-label="Ubah foto profil"
            className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow hover:bg-emerald-700 transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Display Name Input & Badge */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Nama Pengguna
            </span>
            <span className="text-[11px] font-bold text-emerald-800 dark:text-[#9ce3be] bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              {membershipStatus}
            </span>
          </div>

          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              placeholder="Masukkan nama Anda"
              className="w-full bg-slate-100 dark:bg-[#14181D] text-slate-900 dark:text-slate-100 font-semibold text-sm sm:text-base rounded-full py-2 pl-4 pr-10 outline-none border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-[#1B2129] transition-all"
            />
            <button
              type="button"
              aria-label={isEditing ? 'Simpan nama' : 'Edit nama'}
              onClick={isEditing ? handleSave : handleEditClick}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 dark:hover:text-[#54C28E] transition-colors"
            >
              {isEditing ? (
                <Check className="w-4 h-4 text-emerald-600 dark:text-[#54C28E]" />
              ) : (
                <Edit2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Daily Mindful Reflection Time Callout */}
      <div className="bg-slate-50 dark:bg-[#14181D] rounded-xl px-4 py-2.5 flex items-center justify-between border border-slate-200/60 dark:border-[#2A323D]">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-[#54C28E] shrink-0" />
          <span className="text-xs text-slate-600 dark:text-slate-300 truncate">
            Waktu refleksi kesadaran harian
          </span>
        </div>
        <span className="text-xs font-bold text-emerald-800 dark:text-[#9ce3be] bg-emerald-100/70 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full shrink-0">
          {reflectionTime}
        </span>
      </div>
    </div>
  );
}
