'use client';

import React from 'react';
import { ComposedText } from '@/types/communication';

interface TextDisplayBarProps {
  composedText: ComposedText;
  onClear: () => void;
  onBackspace: () => void;
  onSpeak: () => void;
  onCopy: () => void;
  isSpeaking: boolean;
}

export default function TextDisplayBar({
  composedText,
  onClear,
  onBackspace,
  onSpeak,
  onCopy,
  isSpeaking,
}: TextDisplayBarProps) {
  return (
    <div className="bg-[var(--tile-bg)] border-b-2 border-[var(--tile-border)] shadow-md p-3 md:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Text Display Area */}
        <div className="bg-[var(--tile-bg2)] rounded-lg p-4 md:p-6 mb-3 min-h-[80px] md:min-h-[100px]">
          {composedText.fullText ? (
            <p className="text-lg md:text-2xl text-[var(--tile-text)] leading-relaxed">
              {composedText.fullText}
            </p>
          ) : (
            <p className="text-lg md:text-xl text-[var(--tile-text)] italic">
              Select words to compose your message...
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={onBackspace}
            disabled={composedText.segments.length === 0}
            className="px-4 md:px-6 py-2 md:py-3 bg-[var(--tile-bg)] hover:bg-gray-700 disabled:bg-[var(--tile-bg)] disabled:cursor-not-allowed text-[var(--tile-text)] font-semibold rounded-lg transition-colors text-sm md:text-base"
            aria-label="Remove last word"
          >
            ⌫ Backspace
          </button>

          <button
            onClick={onClear}
            disabled={composedText.segments.length === 0}
            className="px-4 md:px-6 py-2 md:py-3 bg-red-600 hover:bg-[var(--tile-bg)] disabled:bg-[var(--tile-bg)] disabled:cursor-not-allowed text-[var(--tile-text)] font-semibold rounded-lg transition-colors text-sm md:text-base"
            aria-label="Clear all text"
          >
            🗑️ Clear
          </button>

          <button
            onClick={onSpeak}
            disabled={!composedText.fullText || isSpeaking}
            className="px-4 md:px-6 py-2 md:py-3 bg-[var(--tile-bg)] hover:bg-[var(--tile-bg)] disabled:bg-[var(--tile-bg)] disabled:cursor-not-allowed text-[var(--tile-text)] font-semibold rounded-lg transition-colors text-sm md:text-base"
            aria-label="Speak the text"
          >
            {isSpeaking ? '🔊 Speaking...' : '🔊 Speak'}
          </button>

          <button
            onClick={onCopy}
            disabled={!composedText.fullText}
            className="px-4 md:px-6 py-2 md:py-3 bg-[var(--tile-bg)] hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-[var(--tile-text)] font-semibold rounded-lg transition-colors text-sm md:text-base"
            aria-label="Copy text to clipboard"
          >
            📋 Copy
          </button>
        </div>
      </div>
    </div>
  );
}
