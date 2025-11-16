'use client';

import React from 'react';
import { Category } from '@/types/communication';

interface CategoryBrowserProps {
  categories: Category[];
  onCategorySelect: (category: Category) => void;
  currentCategory?: Category;
  onBack?: () => void;
}

export default function CategoryBrowser({
  categories,
  onCategorySelect,
  currentCategory,
  onBack,
}: CategoryBrowserProps) {
  return (
    <div className="w-full bg-[var(--background)] border-b-2 border-[var(--background)] p-4">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-4">
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-[var(--background)] hover:bg-[var(--background)] rounded-lg font-semibold"
            >
              ← Back
            </button>
          )}
          {currentCategory && (
            <span className="text-lg font-semibold text-[var(--text)]">
              {currentCategory.icon} {currentCategory.name}
            </span>
          )}
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category)}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-[var(--background2)] rounded-lg shadow hover:shadow-md transition-shadow border-2 border-[var(--border)] hover:border-[var(--border2)]"
            >
              <span className="text-4xl">{category.icon}</span>
              <span className="text-sm font-semibold text-[var(--text)]">{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
