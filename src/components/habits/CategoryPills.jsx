import React from 'react';

export default function CategoryPills({
  categories = [],
  habits = [],
  selectedCategory = 'All',
  onSelectCategory,
}) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar pb-1 flex items-center gap-2">
      {categories.map((cat) => {
        const count =
          cat === 'All'
            ? habits.length
            : habits.filter((h) => h.category.toLowerCase() === cat.toLowerCase())
                .length;

        const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();

        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 min-h-[40px] flex items-center gap-1.5 ${
              isSelected
                ? 'bg-emerald-50 text-emerald-800 dark:bg-[#203a2e] dark:text-[#9ce3be] border border-emerald-500/25 shadow-sm'
                : 'bg-white dark:bg-[#14181D] text-slate-500 dark:text-[#94A3B8] border border-slate-200/80 dark:border-[#2A323D] hover:bg-slate-50 dark:hover:bg-[#1B2129] hover:text-slate-900 dark:hover:text-[#F1F5F9]'
            }`}
          >
            <span>{cat}</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                isSelected
                  ? 'bg-emerald-200/60 dark:bg-emerald-900/50 text-emerald-900 dark:text-[#9ce3be]'
                  : 'bg-slate-100 dark:bg-[#222933] text-slate-400 dark:text-slate-500'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
