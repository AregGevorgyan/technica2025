'use client';

import React from 'react';
import { ComposedText } from '@/types/communication';

interface TextDisplayBarProps {
  composedText: ComposedText;
  onClear: () => void;
  onBackspace: () => void;
  onSpeak: () => void;
  onCopy: () => void;
  isSpeaking?: boolean;
}

export default function TextDisplayBar({
  composedText,
  onClear,
  onBackspace,
  onSpeak,
  onCopy,
  isSpeaking = false,
}: TextDisplayBarProps) {
  return (
    <div className="w-full bg-white border-b-4 border-blue-500 shadow-lg p-4">
      <div className="max-w-6xl mx-auto">
        {/* Text Display */}
        <div className="min-h-[80px] mb-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
          {composedText.fullText ? (
            <p className="text-2xl text-gray-900 leading-relaxed">
              {composedText.fullText}
            </p>
          ) : (
            <p className="text-xl text-gray-400 italic">
              Select words to compose a message...
            </p>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3 flex-wrap">
          {/* Speak Button */}
          <button
            onClick={onSpeak}
            disabled={!composedText.fullText || isSpeaking}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
          >
            <span className="text-2xl">{isSpeaking ? '🔊' : '🔈'}</span>
            {isSpeaking ? 'Speaking...' : 'Speak'}
          </button>

          {/* Copy Button */}
          <button
            onClick={onCopy}
            disabled={!composedText.fullText}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
          >
            <span className="text-2xl">📋</span>
            Copy
          </button>

          {/* Backspace Button */}
          <button
            onClick={onBackspace}
            disabled={composedText.segments.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
          >
            <span className="text-2xl">⌫</span>
            Backspace
          </button>

          {/* Clear Button */}
          <button
            onClick={onClear}
            disabled={composedText.segments.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
          >
            <span className="text-2xl">🗑️</span>
            Clear
          </button>
        </div>

        {/* Word Count */}
        {composedText.segments.length > 0 && (
          <div className="mt-2 text-sm text-gray-500">
            {composedText.segments.length} word{composedText.segments.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
