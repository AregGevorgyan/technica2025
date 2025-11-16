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
  gazeData?: {
    gazingTileId?: string;
    gazeProgress: number;
  };
}

export default function TextDisplayBar({
  composedText,
  onClear,
  onBackspace,
  onSpeak,
  onCopy,
  isSpeaking = false,
  gazeData,
}: TextDisplayBarProps) {
  const { gazingTileId, gazeProgress } = gazeData || { gazingTileId: undefined, gazeProgress: 0 };
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
            onClick={onSpeak}
            disabled={!composedText.fullText || isSpeaking}
            data-gaze-target="true"
            data-tile-id="btn-speak"
            className={`flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors relative ${
              gazingTileId === 'btn-speak' ? 'ring-4 ring-blue-500' : ''
            }`}
          >
            {/* Dwell progress indicator */}
            {gazingTileId === 'btn-speak' && gazeProgress > 0 && (
              <div className="absolute inset-0 rounded-lg overflow-hidden">
                <div
                  className="absolute inset-0 bg-blue-200 opacity-30"
                  style={{
                    clipPath: `circle(${gazeProgress}% at 50% 50%)`,
                    transition: 'clip-path 50ms linear',
                  }}
                />
              </div>
            )}
            <span className="text-2xl relative z-10">{isSpeaking ? '🔊' : '🔈'}</span>
            <span className="relative z-10">{isSpeaking ? 'Speaking...' : 'Speak'}</span>
          </button>

          <button
            onClick={onCopy}
            disabled={!composedText.fullText}
            data-gaze-target="true"
            data-tile-id="btn-copy"
            className={`flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors relative ${
              gazingTileId === 'btn-copy' ? 'ring-4 ring-blue-500' : ''
            }`}
          >
            {gazingTileId === 'btn-copy' && gazeProgress > 0 && (
              <div className="absolute inset-0 rounded-lg overflow-hidden">
                <div
                  className="absolute inset-0 bg-blue-200 opacity-30"
                  style={{
                    clipPath: `circle(${gazeProgress}% at 50% 50%)`,
                    transition: 'clip-path 50ms linear',
                  }}
                />
              </div>
            )}
            <span className="text-2xl relative z-10">📋</span>
            <span className="relative z-10">Copy</span>
          </button>

          <button
            onClick={onBackspace}
            disabled={composedText.segments.length === 0}
            data-gaze-target="true"
            data-tile-id="btn-backspace"
            className={`flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors relative ${
              gazingTileId === 'btn-backspace' ? 'ring-4 ring-blue-500' : ''
            }`}
          >
            {gazingTileId === 'btn-backspace' && gazeProgress > 0 && (
              <div className="absolute inset-0 rounded-lg overflow-hidden">
                <div
                  className="absolute inset-0 bg-blue-200 opacity-30"
                  style={{
                    clipPath: `circle(${gazeProgress}% at 50% 50%)`,
                    transition: 'clip-path 50ms linear',
                  }}
                />
              </div>
            )}
            <span className="text-2xl relative z-10">⌫</span>
            <span className="relative z-10">Backspace</span>
          </button>

          <button
            onClick={onClear}
            disabled={composedText.segments.length === 0}
            data-gaze-target="true"
            data-tile-id="btn-clear"
            className={`flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors relative ${
              gazingTileId === 'btn-clear' ? 'ring-4 ring-blue-500' : ''
            }`}
          >
            {gazingTileId === 'btn-clear' && gazeProgress > 0 && (
              <div className="absolute inset-0 rounded-lg overflow-hidden">
                <div
                  className="absolute inset-0 bg-blue-200 opacity-30"
                  style={{
                    clipPath: `circle(${gazeProgress}% at 50% 50%)`,
                    transition: 'clip-path 50ms linear',
                  }}
                />
              </div>
            )}
            <span className="text-2xl relative z-10">🗑️</span>
            <span className="relative z-10">Clear</span>
          </button>
        </div>
      </div>
    </div>
  );
}
