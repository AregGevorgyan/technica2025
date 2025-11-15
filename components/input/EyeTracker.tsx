'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  initializeEyeGestures,
  startEyeGestures,
  addGazeListener,
  removeAllGazeListeners,
  stopEyeGestures,
  showVideoPreview,
  isEyeGesturesReady,
  isEyeGesturesCalibrated,
  hideGazeCursor,
} from '@/lib/input/eyegestures-init';
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
  dwellTime = 1500,
  showPreview = true,
  onGazeUpdate,
  onDwellComplete,
  children,
}: EyeTrackerProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gazePosition, setGazePosition] = useState<{ x: number; y: number } | null>(null);

  const gazeSmoothing = useRef(new GazeSmoothing(10)); // Increased buffer for smoother tracking
  const dwellDetector = useRef(new DwellDetector());

  const handleGazeData = useCallback(
    (data: { x: number; y: number; timestamp: number; calibrated: boolean }) => {
      if (!data || data.x == null || data.y == null) {
        console.warn('Invalid gaze data received:', data);
        return; // Skip invalid data
      }

      // Track calibration status
      if (data.calibrated && !isCalibrated) {
        console.log('✅ Calibration complete detected in EyeTracker component');
        setIsCalibrated(true);
      }

      // IMPORTANT: Use data.calibrated from the callback, NOT local state
      // The data.calibrated parameter tells us if THIS specific gaze point is calibrated
      if (!data.calibrated) {
        // Log occasionally during calibration
        if (Math.random() < 0.05) {
          console.log('Calibration in progress, skipping gaze data');
        }
        return;
      }

      // Smooth the gaze data
      const smoothed = gazeSmoothing.current.addPoint(data.x, data.y);
      setGazePosition(smoothed);

      // Log occasionally to verify gaze data is flowing
      if (Math.random() < 0.01) {
        console.log('✅ Gaze data flowing:', { raw: { x: data.x, y: data.y }, smoothed });
      }

      // Always call onGazeUpdate with smoothed coordinates
      if (onGazeUpdate) {
        onGazeUpdate(smoothed.x, smoothed.y);
      }
    },
    [onGazeUpdate, isCalibrated]
  );

  useEffect(() => {
    if (!enabled) return;

    const initialize = async () => {
      try {
        // Check if already calibrated from a previous session
        const alreadyCalibrated = isEyeGesturesCalibrated();

        // Initialize EyeGesturesLite
        console.log('Initializing EyeGestures...');
        const success = await initializeEyeGestures('video');
        if (success) {
          setIsInitialized(true);

          // Check calibration status again after initialization
          const isNowCalibrated = isEyeGesturesCalibrated();
          setIsCalibrated(isNowCalibrated);
          console.log('Calibration status after init:', isNowCalibrated);

          // Add gaze listener BEFORE starting eye tracking
          console.log('Adding gaze listener...');
          addGazeListener(handleGazeData);
          showVideoPreview(showPreview);

          // Start eye tracking - skip calibration if already calibrated
          console.log('Starting eye gestures with skipCalibration:', true);
          await startEyeGestures(true); // Pass true to skip recalibration if already done

          // Keep the built-in blue gaze cursor visible for now (for debugging)
          // We can hide it later once we verify tracking works
          // hideGazeCursor();

          console.log(`✅ Eye tracking ${isNowCalibrated ? 'resumed with existing calibration' : 'starting calibration'}`);
          console.log('Listener count should now be > 0');
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
      removeAllGazeListeners();
      // Don't stop EyeGestures on unmount - keep it running for navigation between pages
      // Only clean up listeners
      setIsInitialized(false);
      // Keep calibration state
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
              isCalibrated
                ? 'bg-green-500 animate-pulse'
                : isInitialized
                ? 'bg-yellow-500 animate-pulse'
                : 'bg-gray-400'
            }`}
          />
          <div>
            <div className="font-semibold text-sm">
              {isCalibrated
                ? 'Eye Tracking Active'
                : isInitialized
                ? 'Calibrating...'
                : 'Initializing...'}
            </div>
            {error && <div className="text-red-600 text-xs mt-1">{error}</div>}
            {isCalibrated && (
              <div className="text-xs text-gray-600 mt-1">
                Dwell time: {dwellTime}ms
              </div>
            )}
            {isInitialized && !isCalibrated && (
              <div className="text-xs text-gray-600 mt-1">
                Follow the calibration points
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom gaze cursor indicator (only when calibrated) */}
      {isCalibrated && gazePosition && (
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
