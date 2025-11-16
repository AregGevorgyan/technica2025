'use client';

import React from 'react';

interface RegenerateButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export default function RegenerateButton({ onClick, isLoading = false }: RegenerateButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="fixed bottom-6 right-6 flex items-center gap-2 px-6 py-4 bg-[var(--background)] hover:bg-[var(--background2)] disabled:bg-[var(--background3)] text-[var(--text)] font-semibold rounded-full shadow-lg hover:shadow-xl transition-all z-10"
      aria-label="Regenerate options"
    >
      <span className="text-2xl">{isLoading ? '⏳' : '🔄'}</span>
      <span>{isLoading ? 'Generating...' : 'New Options'}</span>
    </button>
  );
}
