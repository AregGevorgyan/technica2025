'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  initializeWebGazer,
  setGazeListener,
  removeGazeListener,
  stopWebGazer,
  showVideoPreview,
  isWebGazerReady,
} from '@/lib/input/webgazer-init';
import { GazeSmoothing, DwellDetector } from '@/lib/input/gaze-utils';

interface EyeTrackerProps {
  enabled: boolean;
  dwellTime?: number;
  showPreview?: boolean;
  onGazeUpdate?: (x: number, y: number) => void;
  onDwellComplete?: (element: HTMLElement) => void;
  children: React.ReactNode;
}

export default function EyeTracker({
  enabled,
  dwellTime = 1000,
  showPreview = true,
  onGazeUpdate,
  onDwellComplete,
  children,
}: EyeTrackerProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gazePosition, setGazePosition] = useState<{ x: number; y: number } | null>(null);

  const gazeSmoothing = React.useRef(new GazeSmoothing(10)); // Increased from 5 to 10 for smoother tracking
  const dwellDetector = React.useRef(new DwellDetector());

  const handleGazeData = useCallback(
    (data: { x: number; y: number; timestamp: number }) => {
      if (!data || data.x == null || data.y == null) {
        return; // Skip invalid data
      }

      // Smooth the gaze data
      const smoothed = gazeSmoothing.current.addPoint(data.x, data.y);
      setGazePosition(smoothed);

      // Always call onGazeUpdate with smoothed coordinates
      if (onGazeUpdate) {
        onGazeUpdate(smoothed.x, smoothed.y);
      }
    },
    [onGazeUpdate]
  );

  useEffect(() => {
    if (!enabled) return;

    const initialize = async () => {
      try {
        const success = await initializeWebGazer();
        if (success) {
          setIsInitialized(true);
          setGazeListener(handleGazeData);
          showVideoPreview(showPreview);
        } else {
          setError('Failed to initialize eye tracking');
        }
      } catch (err) {
        setError('Eye tracking not supported in this browser');
        console.error(err);
      }
    };

    initialize();

    return () => {
      removeGazeListener();
      if (isWebGazerReady()) {
        stopWebGazer();
      }
      setIsInitialized(false);
    };
  }, [enabled, handleGazeData, showPreview]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Status indicator */}
      <div className="fixed top-4 left-4 z-50 bg-white rounded-lg shadow-lg p-4 max-w-xs">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              isInitialized ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`}
          />
          <div>
            <div className="font-semibold text-sm">
              {isInitialized ? 'Eye Tracking Active' : 'Initializing...'}
            </div>
            {error && <div className="text-red-600 text-xs mt-1">{error}</div>}
            {isInitialized && (
              <div className="text-xs text-gray-600 mt-1">
                Dwell time: {dwellTime}ms
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gaze cursor indicator */}
      {isInitialized && gazePosition && (
        <div
          className="fixed pointer-events-none z-40"
          style={{
            left: gazePosition.x - 10,
            top: gazePosition.y - 10,
            transition: 'all 50ms linear',
          }}
        >
          <div className="w-5 h-5 border-2 border-blue-500 rounded-full bg-blue-200 opacity-50" />
        </div>
      )}

      {children}
    </div>
  );
}
