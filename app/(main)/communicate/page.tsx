'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AdaptiveTileGrid from '@/components/communication/AdaptiveTileGrid';
import TextDisplayBar from '@/components/communication/TextDisplayBar';
import RegenerateButton from '@/components/communication/RegenerateButton';
import CategoryBrowser from '@/components/communication/CategoryBrowser';
import EyeTracker from '@/components/input/EyeTracker';
import { CommunicationTile, ComposedText, Category, TextSegment } from '@/types/communication';
import { DwellDetector } from '@/lib/input/gaze-utils';

// Mock categories for demo
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'needs', name: 'Needs', icon: '🍽️', commonPhrases: ['water', 'food', 'bathroom', 'help'] },
  { id: 'feelings', name: 'Feelings', icon: '😊', commonPhrases: ['happy', 'sad', 'tired', 'pain'] },
  { id: 'people', name: 'People', icon: '👥', commonPhrases: ['family', 'friend', 'doctor'] },
  { id: 'activities', name: 'Activities', icon: '🎮', commonPhrases: ['watch TV', 'music', 'read', 'outside'] },
  { id: 'social', name: 'Social', icon: '👋', commonPhrases: ['hello', 'goodbye', 'thank you', 'please'] },
  { id: 'questions', name: 'Questions', icon: '❓', commonPhrases: ['what', 'where', 'when', 'why'] },
];

// Mock tiles for demo
const MOCK_TILES: CommunicationTile[] = [
  { id: '1', text: 'I want', category: 'social', priority: 0.9, symbolSource: 'opensymbols' },
  { id: '2', text: 'water', category: 'needs', priority: 0.85, symbolSource: 'opensymbols' },
  { id: '3', text: 'help', category: 'needs', priority: 0.8, symbolSource: 'opensymbols' },
  { id: '4', text: 'please', category: 'social', priority: 0.75, symbolSource: 'opensymbols' },
  { id: '5', text: 'thank you', category: 'social', priority: 0.7, symbolSource: 'opensymbols' },
  { id: '6', text: 'yes', category: 'social', priority: 0.65, symbolSource: 'opensymbols' },
];

function CommunicatePageContent() {
  const searchParams = useSearchParams();
  const eyeTrackingEnabled = searchParams?.get('eyeTracking') === 'true';

  const [speechMode, setSpeechMode] = useState<'immediate' | 'aggregated'>('aggregated');
  const [composedText, setComposedText] = useState<ComposedText>({
    segments: [],
    fullText: '',
    timestamp: new Date(),
  });
  const [tiles, setTiles] = useState<CommunicationTile[]>(MOCK_TILES);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [showCategories, setShowCategories] = useState(false);
  const [gazingTileId, setGazingTileId] = useState<string | undefined>();
  const [gazeProgress, setGazeProgress] = useState(0);

  const dwellDetector = useRef(new DwellDetector());

  // Settings (would come from user preferences in real app)
  const settings = {
    tileCount: 6 as const,
    tileSize: 'medium' as const,
    showImages: true,
    highContrast: false,
    dwellTime: 1500, // milliseconds
  };

  const handleTileSelect = useCallback((tile: CommunicationTile) => {
    console.log('Tile selected via eye tracking or click:', tile.text);

    if (speechMode === 'immediate') {
      // Speak immediately
      speakText(tile.text);
    } else {
      // Add to composed text
      const newSegment: TextSegment = {
        id: `seg-${Date.now()}`,
        text: tile.text,
        tileId: tile.id,
        timestamp: new Date(),
      };

      setComposedText(prev => {
        const newSegments = [...prev.segments, newSegment];
        const newFullText = newSegments.map(s => s.text).join(' ');

        return {
          segments: newSegments,
          fullText: newFullText,
          timestamp: new Date(),
        };
      });
    }
  }, [speechMode]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSpeak = () => {
    if (composedText.fullText) {
      speakText(composedText.fullText);
    }
  };

  const handleCopy = async () => {
    if (composedText.fullText) {
      try {
        await navigator.clipboard.writeText(composedText.fullText);
        alert('Text copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const handleBackspace = () => {
    if (composedText.segments.length > 0) {
      const newSegments = composedText.segments.slice(0, -1);
      const newFullText = newSegments.map(s => s.text).join(' ');
      setComposedText({
        segments: newSegments,
        fullText: newFullText,
        timestamp: new Date(),
      });
    }
  };

  const handleClear = () => {
    setComposedText({
      segments: [],
      fullText: '',
      timestamp: new Date(),
    });
  };

  const handleRegenerate = async () => {
    setIsLoading(true);
    // In real app, would call API to get new predictions
    setTimeout(() => {
      // Mock: shuffle tiles
      setTiles([...tiles].sort(() => Math.random() - 0.5));
      setIsLoading(false);
    }, 1000);
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setShowCategories(false);
    // In real app, would fetch tiles for this category
    console.log('Category selected:', category);
  };

  // Eye tracking gaze update handler
  const handleGazeUpdate = useCallback((x: number, y: number) => {
    if (!eyeTrackingEnabled) return;

    // Find which tile is being gazed at
    const tileElements = document.querySelectorAll('[data-gaze-target]');
    let foundGazingTile = false;

    tileElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const tileId = htmlEl.getAttribute('data-tile-id');
      if (!tileId) return;

      const rect = htmlEl.getBoundingClientRect();
      const isGazing = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

      if (isGazing) {
        const { isDwelling, progress } = dwellDetector.current.checkDwell(
          x,
          y,
          htmlEl,
          settings.dwellTime
        );

        setGazingTileId(tileId);
        setGazeProgress(progress);
        foundGazingTile = true;

        if (isDwelling) {
          // Trigger selection
          const tile = tiles.find(t => t.id === tileId);
          if (tile) {
            console.log('Eye tracking: Dwell complete on tile:', tile.text);
            handleTileSelect(tile);
            // Reset dwell detector after selection
            dwellDetector.current.reset();
          }
        }
      }
    });

    if (!foundGazingTile) {
      setGazingTileId(undefined);
      setGazeProgress(0);
    }
  }, [eyeTrackingEnabled, tiles, settings.dwellTime, handleTileSelect]);

  const content = (
    <div className="min-h-screen flex flex-col bg-[var(--tile-bg2)] w-full overflow-x-hidden">
      {/* Header */}
      <div className="bg-[var(--tile-bg2)] shadow-md p-3 md:p-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <h1 className="text-xl md:text-2xl font-bold text-[var(--tile-text)]">
            Adaptive AAC {eyeTrackingEnabled && '👁️'}
          </h1>

          <div className="flex flex-wrap gap-2 md:gap-4 items-center justify-center">
            {/* Speech Mode Toggle */}
            <div className="flex bg-[var(--tile-bg)] rounded-lg p-1">
              <button
                onClick={() => setSpeechMode('immediate')}
                className={`px-2 md:px-4 py-2 rounded-md text-xs md:text-sm font-semibold transition-colors ${
                  speechMode === 'immediate' ? 'bg-[var(--tile-bg)] shadow' : 'text-[var(--tile-text)]'
                }`}
              >
                Immediate
              </button>
              <button
                onClick={() => setSpeechMode('aggregated')}
                className={`px-2 md:px-4 py-2 rounded-md text-xs md:text-sm font-semibold transition-colors ${
                  speechMode === 'aggregated' ? 'bg-[var(--tile-bg)] shadow' : 'text-[var(--tile-text)]'
                }`}
              >
                Compose
              </button>
            </div>

            {/* Categories Button */}
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="px-3 md:px-4 py-2 bg-[var(--tile-bg)] hover:bg-[var(--tile-bg)] text-[var(--tile-text)] text-xs md:text-sm font-semibold rounded-lg"
            >
              Categories
            </button>
          </div>
        </div>
      </div>

      {/* Text Display Bar (only in aggregated mode) */}
      {speechMode === 'aggregated' && (
        <TextDisplayBar
          composedText={composedText}
          onClear={handleClear}
          onBackspace={handleBackspace}
          onSpeak={handleSpeak}
          onCopy={handleCopy}
          isSpeaking={isSpeaking}
        />
      )}

      {/* Category Browser */}
      {showCategories && (
        <CategoryBrowser
          categories={DEFAULT_CATEGORIES}
          onCategorySelect={handleCategorySelect}
          currentCategory={selectedCategory}
          onBack={() => setShowCategories(false)}
        />
      )}

      {/* Main Tile Grid */}
      <div className="flex-1 flex items-center justify-center py-4 md:py-8 px-2 md:px-4">
        <AdaptiveTileGrid
          tiles={tiles}
          onTileSelect={handleTileSelect}
          tileCount={settings.tileCount}
          tileSize={settings.tileSize}
          showImages={settings.showImages}
          highContrast={settings.highContrast}
          gazeData={eyeTrackingEnabled ? {
            gazingTileId,
            gazeProgress,
          } : undefined}
        />
      </div>

      {/* Regenerate Button */}
      <RegenerateButton onClick={handleRegenerate} isLoading={isLoading} />

      {/* Footer hint */}
      <div className="bg-[var(--tile-bg)] border-t p-3 md:p-4 text-center text-xs md:text-sm text-[var(--tile-text)]">
        {eyeTrackingEnabled
          ? `Gaze at any tile for ${settings.dwellTime / 1000} seconds to select it`
          : speechMode === 'immediate'
          ? 'Tap any word to speak it immediately'
          : 'Select words to build a sentence, then tap Speak'}
      </div>
    </div>
  );

  // Wrap in EyeTracker if enabled
  return eyeTrackingEnabled ? (
    <EyeTracker
      enabled={true}
      dwellTime={settings.dwellTime}
      showPreview={true}
      onGazeUpdate={handleGazeUpdate}
    >
      {content}
    </EyeTracker>
  ) : (
    content
  );
}

export default function CommunicatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--tile-border)] mx-auto mb-4" />
          <p className="text-[var(--tile-text)]">Loading...</p>
        </div>
      </div>
    }>
      <CommunicatePageContent />
    </Suspense>
  );
}
