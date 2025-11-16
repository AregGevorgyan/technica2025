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
import { showVideoPreview } from '@/lib/input/eyegestures-init';

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
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const dwellDetector = useRef(new DwellDetector());
  const heatmapInstance = useRef<any>(null);
  const heatmapData = useRef<Array<{ x: number; y: number; value: number }>>([]);

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

  const speakText = async (text: string) => {
    setIsSpeaking(true);
    try {
      // Try ElevenLabs first for high-quality TTS
      const { speakWithElevenLabs } = await import('@/lib/tts/elevenlabs');
      await speakWithElevenLabs({ text });
      setIsSpeaking(false);
    } catch (error) {
      console.warn('ElevenLabs TTS failed, falling back to Web Speech API:', error);
      // Fallback to browser's Web Speech API
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsSpeaking(false);
      }
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

  // Initialize heatmap
  useEffect(() => {
    if (showHeatmap && !heatmapInstance.current && typeof window !== 'undefined') {
      // Check if heatmap.js is already loaded
      const h337 = (window as any).h337;

      const initHeatmap = () => {
        const container = document.getElementById('heatmap-container');
        if (!container) {
          console.error('Heatmap container not found!');
          return;
        }

        const h337Instance = (window as any).h337;
        if (h337Instance) {
          heatmapInstance.current = h337Instance.create({
            container: container,
            radius: 50,
            maxOpacity: 0.6,
            blur: 0.85,
          });
          console.log('✅ Heatmap initialized on communicate page');

          // Style the heatmap canvas to be a transparent overlay
          const canvas = container.querySelector('canvas');
          if (canvas) {
            canvas.style.position = 'absolute';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.pointerEvents = 'none';
            canvas.style.zIndex = '10';
          }
        }
      };

      if (!h337) {
        // Load heatmap.js if not already loaded
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/heatmap.js@2.0.5/build/heatmap.min.js';
        script.onload = () => {
          initHeatmap();
        };
        script.onerror = () => {
          console.error('Failed to load heatmap.js');
        };
        document.head.appendChild(script);
      } else {
        // Already loaded, initialize immediately
        initHeatmap();
      }
    }

    // Cleanup heatmap when disabled
    if (!showHeatmap && heatmapInstance.current) {
      // Remove the canvas element
      const container = document.getElementById('heatmap-container');
      if (container) {
        const canvas = container.querySelector('canvas');
        if (canvas) {
          canvas.remove();
        }
      }
      heatmapInstance.current = null;
      heatmapData.current = [];
    }
  }, [showHeatmap]);

  // Toggle camera view
  useEffect(() => {
    if (eyeTrackingEnabled) {
      showVideoPreview(showCamera);
    }
  }, [showCamera, eyeTrackingEnabled]);

  // Ensure camera is hidden when page first loads
  useEffect(() => {
    if (eyeTrackingEnabled && !showCamera) {
      // Give initialization time to complete, then force hide
      const timeout = setTimeout(() => {
        showVideoPreview(false);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [eyeTrackingEnabled]);

  // Eye tracking gaze update handler
  const handleGazeUpdate = useCallback((x: number, y: number) => {
    if (!eyeTrackingEnabled) return;

    // Debug logging (can be removed later)
    if (Math.random() < 0.01) { // Log 1% of the time to avoid spam
      console.log('Gaze update:', { x, y });
    }

    // Update heatmap if enabled
    if (showHeatmap && heatmapInstance.current) {
      heatmapData.current.push({
        x: parseInt(String(x)),
        y: parseInt(String(y)),
        value: 30,
      });

      // Keep only last 20 points (like the demo)
      if (heatmapData.current.length > 20) {
        heatmapData.current.shift();
      }

      heatmapInstance.current.setData({
        max: 100,
        data: heatmapData.current,
      });
    }

    // Find which tile is being gazed at
    const tileElements = document.querySelectorAll('[data-gaze-target]');
    let foundGazingTile = false;

    // Debug logging
    if (tileElements.length === 0 && Math.random() < 0.01) {
      console.warn('No gaze-target elements found!');
    }

    tileElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const tileId = htmlEl.getAttribute('data-tile-id');
      if (!tileId) return;

      // Skip disabled buttons
      if (htmlEl.hasAttribute('disabled') || htmlEl.getAttribute('aria-disabled') === 'true') {
        return;
      }

      const rect = htmlEl.getBoundingClientRect();
      // Add margin for easier targeting
      const margin = 20;
      const isGazing =
        x >= rect.left - margin &&
        x <= rect.right + margin &&
        y >= rect.top - margin &&
        y <= rect.bottom + margin;

      if (isGazing) {
        const { isDwelling, progress } = dwellDetector.current.checkDwell(
          x,
          y,
          htmlEl,
          settings.dwellTime
        );

        // Debug logging
        if (progress > 0 && progress % 25 === 0) {
          console.log(`Gazing at tile ${tileId}, progress: ${progress.toFixed(0)}%`);
        }

        setGazingTileId(tileId);
        setGazeProgress(progress);
        foundGazingTile = true;

        if (isDwelling) {
          console.log('✅ Eye tracking: Dwell complete on element:', tileId);

          // Check if it's a button or a tile
          if (tileId.startsWith('btn-')) {
            // Handle button clicks
            console.log('Button detected:', tileId);
            switch (tileId) {
              case 'btn-speak':
                console.log('Speak button - checking conditions:', {
                  hasText: !!composedText.fullText,
                  isSpeaking,
                  text: composedText.fullText
                });
                if (composedText.fullText && !isSpeaking) {
                  console.log('✅ Calling handleSpeak()');
                  handleSpeak();
                } else {
                  console.log('❌ Speak button conditions not met');
                }
                break;
              case 'btn-copy':
                console.log('Copy button - has text:', !!composedText.fullText);
                if (composedText.fullText) {
                  handleCopy();
                }
                break;
              case 'btn-backspace':
                console.log('Backspace button - segments:', composedText.segments.length);
                if (composedText.segments.length > 0) {
                  handleBackspace();
                }
                break;
              case 'btn-clear':
                console.log('Clear button - segments:', composedText.segments.length);
                if (composedText.segments.length > 0) {
                  handleClear();
                }
                break;
            }
          } else {
            // Handle tile selection
            const tile = tiles.find(t => t.id === tileId);
            if (tile) {
              handleTileSelect(tile);
            }
          }

          // Reset dwell detector after selection
          dwellDetector.current.reset();
          setGazingTileId(undefined);
          setGazeProgress(0);
        }
      }
    });

    if (!foundGazingTile) {
      setGazingTileId(undefined);
      setGazeProgress(0);
    }
  }, [eyeTrackingEnabled, tiles, settings.dwellTime, handleTileSelect, showHeatmap, composedText, isSpeaking, handleSpeak, handleCopy, handleBackspace, handleClear]);

  const content = (
    <div
      id="heatmap-container"
      className="min-h-screen flex flex-col bg-gray-100 w-full overflow-x-hidden"
      style={{ position: 'relative', width: '100vw', height: '100vh' }}
    >
      {/* Debug toggle buttons (bottom right corner) */}
      {eyeTrackingEnabled && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
          <button
            onClick={() => {
              setShowHeatmap(!showHeatmap);
              if (showHeatmap) {
                heatmapData.current = []; // Clear data when disabling
              }
            }}
            className={`px-4 py-2 rounded-lg font-semibold shadow-lg transition-colors ${
              showHeatmap
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-gray-800 text-white hover:bg-gray-900'
            }`}
          >
            {showHeatmap ? '🔥 Heatmap ON' : '🔥 Debug Heatmap'}
          </button>
          <button
            onClick={() => setShowCamera(!showCamera)}
            className={`px-4 py-2 rounded-lg font-semibold shadow-lg transition-colors ${
              showCamera
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-800 text-white hover:bg-gray-900'
            }`}
          >
            {showCamera ? '📹 Camera ON' : '📹 Debug Camera'}
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-md p-3 md:p-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Adaptive AAC {eyeTrackingEnabled && '👁️'}
          </h1>

          <div className="flex flex-wrap gap-2 md:gap-4 items-center justify-center">
            {/* Speech Mode Toggle */}
            <div className="flex bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setSpeechMode('immediate')}
                className={`px-2 md:px-4 py-2 rounded-md text-xs md:text-sm font-semibold transition-colors ${
                  speechMode === 'immediate' ? 'bg-white shadow' : 'text-gray-600'
                }`}
              >
                Immediate
              </button>
              <button
                onClick={() => setSpeechMode('aggregated')}
                className={`px-2 md:px-4 py-2 rounded-md text-xs md:text-sm font-semibold transition-colors ${
                  speechMode === 'aggregated' ? 'bg-white shadow' : 'text-gray-600'
                }`}
              >
                Compose
              </button>
            </div>

            {/* Categories Button */}
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-semibold rounded-lg"
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
          gazeData={eyeTrackingEnabled ? {
            gazingTileId,
            gazeProgress,
          } : undefined}
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
      <div className="bg-white border-t p-3 md:p-4 text-center text-xs md:text-sm text-gray-600">
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <CommunicatePageContent />
    </Suspense>
  );
}
