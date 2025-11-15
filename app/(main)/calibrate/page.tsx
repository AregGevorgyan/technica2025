'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  initializeEyeGestures,
  startEyeGestures,
  stopEyeGestures,
  getCalibrationProgress,
  addGazeListener,
  removeGazeListener,
  removeAllGazeListeners,
  recalibrateEyeGestures,
} from '@/lib/input/eyegestures-init';

export default function CalibratePage() {
  const router = useRouter();
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationComplete, setCalibrationComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 25, percentage: 0 });
  const [showHeatmap, setShowHeatmap] = useState(false);
  const heatmapInstance = useRef<any>(null);
  const heatmapData = useRef<Array<{ x: number; y: number; value: number }>>([]);

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
          console.log('✅ Heatmap initialized on calibration page');

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

  // Gaze listener for heatmap
  const handleGazeForHeatmap = useCallback((data: { x: number; y: number; timestamp: number; calibrated: boolean }) => {
    if (heatmapInstance.current && data && data.x != null && data.y != null) {
      heatmapData.current.push({
        x: parseInt(String(data.x)),
        y: parseInt(String(data.y)),
        value: 30,
      });

      // Keep only last 20 points for performance (like demo)
      if (heatmapData.current.length > 20) {
        heatmapData.current.shift();
      }

      heatmapInstance.current.setData({
        max: 100,
        data: heatmapData.current,
      });
    }
  }, []);

  // Add/remove gaze listener when heatmap toggle changes
  useEffect(() => {
    if (showHeatmap) {
      addGazeListener(handleGazeForHeatmap);
      console.log('Added heatmap gaze listener');
    } else {
      removeGazeListener(handleGazeForHeatmap);
    }

    return () => {
      removeGazeListener(handleGazeForHeatmap);
    };
  }, [showHeatmap, handleGazeForHeatmap]);

  // Monitor calibration progress
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isCalibrating) {
      intervalId = setInterval(() => {
        const currentProgress = getCalibrationProgress();
        setProgress(currentProgress);

        // Check if calibration is complete
        if (currentProgress.percentage >= 100) {
          setCalibrationComplete(true);
          setIsCalibrating(false);
          localStorage.setItem('eyeTrackingCalibrated', 'true');
          clearInterval(intervalId);
        }
      }, 100); // Check every 100ms
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isCalibrating]);

  const startCalibration = async () => {
    setIsLoading(true);
    setError(null);
    setCalibrationComplete(false);

    try {
      console.log('Starting calibration initialization...');
      
      // Initialize EyeGesturesLite
      const success = await initializeEyeGestures('video');
      
      if (!success) {
        throw new Error('Failed to initialize eye tracking. Please check browser console for details.');
      }

      console.log('EyeGestures initialized');

      console.log('Starting eye tracking...');
      // Start calibration (will show built-in UI with 25 points)
      await startEyeGestures();
      
      setIsCalibrating(true);
      setIsLoading(false);
      console.log('Calibration UI started successfully');
    } catch (err: any) {
      console.error('Calibration error:', err);
      setError(
        err.message || 
        'Failed to start calibration. Please ensure:\n' +
        '1. Camera permissions are granted\n' +
        '2. You are using HTTPS or localhost\n' +
        '3. Your browser supports WebRTC\n' +
        'Check browser console for more details.'
      );
      setIsLoading(false);
    }
  };

  const handleRecalibrate = () => {
    setCalibrationComplete(false);
    setProgress({ current: 0, total: 25, percentage: 0 });
    heatmapData.current = []; // Clear heatmap data
    recalibrateEyeGestures();
    setIsCalibrating(true);
  };

  const startCommunicating = () => {
    // Don't remove listeners or stop eye gestures - let the communicate page take over
    // Just navigate with the eye tracking enabled flag
    console.log('✅ Navigating to communicate page with eye tracking enabled');
    router.push('/communicate?eyeTracking=true');
  };

  const skipCalibration = () => {
    removeAllGazeListeners();
    stopEyeGestures();
    router.push('/communicate');
  };

  useEffect(() => {
    setIsLoading(false);
    
    return () => {
      removeAllGazeListeners();
    };
  }, []);

  if (isLoading && !isCalibrating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="text-center max-w-md px-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">Loading eye tracking...</p>
          <p className="text-gray-500 text-sm">
            Initializing MediaPipe FaceMesh and loading dependencies...
          </p>
          <div className="mt-4 text-xs text-gray-400">
            This may take a few seconds on first load
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="heatmap-container"
      className="min-h-screen bg-gradient-to-b from-purple-50 to-white"
      style={{ position: 'relative', width: '100vw', minHeight: '100vh' }}
    >
      {/* Heatmap toggle button (bottom left corner) */}
      <button
        onClick={() => {
          setShowHeatmap(!showHeatmap);
          if (showHeatmap) {
            heatmapData.current = []; // Clear data when disabling
          }
        }}
        className={`fixed bottom-4 left-4 z-50 px-4 py-2 rounded-lg font-semibold shadow-lg transition-colors ${
          showHeatmap
            ? 'bg-orange-600 text-white hover:bg-orange-700'
            : 'bg-gray-800 text-white hover:bg-gray-900'
        }`}
      >
        {showHeatmap ? '🔥 Heatmap ON' : '🔥 Debug Heatmap'}
      </button>

      {!isCalibrating && !calibrationComplete && (
        <div className="container mx-auto px-4 py-4 md:py-8 lg:py-16 max-w-3xl relative z-40">
          <div className="text-center mb-4 md:mb-8">
            <div className="text-4xl md:text-6xl mb-2 md:mb-4">👁️</div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
              Eye Tracking Calibration
            </h1>
            <p className="text-base md:text-lg text-gray-600">
              25-point calibration with built-in gaze tracking
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Powered by EyeGesturesLite with MediaPipe FaceMesh
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6 rounded-r-lg">
              <p className="text-red-800 font-semibold mb-2">⚠️ Error Starting Calibration</p>
              <p className="text-red-700 text-sm whitespace-pre-line mb-3">{error}</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => window.open('/TROUBLESHOOTING.md', '_blank')}
                  className="text-sm px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors"
                >
                  📖 View Troubleshooting Guide
                </button>
                <button
                  onClick={() => {
                    setError(null);
                    startCalibration();
                  }}
                  className="text-sm px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  🔄 Try Again
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 lg:p-8 mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4 text-gray-800">How it works</h2>
            <div className="space-y-3 md:space-y-4">
              <div className="flex gap-3 md:gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm md:text-lg">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1 text-sm md:text-base">Follow Instructions</h3>
                  <p className="text-gray-600 text-xs md:text-sm">
                    EyeGesturesLite will show an instruction screen. Click continue when ready.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 md:gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm md:text-lg">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1 text-sm md:text-base">Gaze at Red Circles</h3>
                  <p className="text-gray-600 text-xs md:text-sm">
                    25 red calibration points will appear. Look at each one until it turns green.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 md:gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm md:text-lg">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1 text-sm md:text-base">Track Your Gaze</h3>
                  <p className="text-gray-600 text-xs md:text-sm">
                    A blue cursor shows your estimated gaze. It improves with each calibration point.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-3 md:p-4 lg:p-6 mb-4 md:mb-6 rounded-r-lg">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2 text-sm md:text-base">
              <span>💡</span> Quick Tips
            </h3>
            <ul className="text-xs md:text-sm text-blue-800 space-y-1 md:space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Sit about 2 feet from the screen with good lighting</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Keep your head still during calibration</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Follow each red circle with your eyes until it disappears</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Enable debug heatmap to visualize your gaze patterns</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={startCalibration}
              disabled={isLoading}
              className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold text-lg rounded-xl transition-colors shadow-lg hover:shadow-xl"
            >
              {isLoading ? 'Loading...' : 'Start Calibration (25 points, ~1 minute)'}
            </button>

            <button
              onClick={skipCalibration}
              className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-colors"
            >
              Skip - Use Mouse/Touch Instead
            </button>

            <button
              onClick={() => router.push('/')}
              className="w-full py-3 bg-white hover:bg-gray-50 text-gray-600 font-semibold rounded-xl border-2 border-gray-200 transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      )}

      {isCalibrating && (
        <div className="min-h-screen relative overflow-hidden">
          {/* Progress Bar - Compact and at bottom */}
          <div className="fixed bottom-0 left-0 right-0 z-50">
            <div className="bg-white/95 backdrop-blur-sm shadow-lg border-t border-gray-200">
              <div className="max-w-4xl mx-auto px-4 py-3">
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs md:text-sm font-semibold text-gray-700">
                        Calibration Point {progress.current} of {progress.total}
                      </span>
                      <span className="text-xs md:text-sm font-semibold text-purple-600">
                        {Math.round(progress.percentage)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-blue-600 h-full rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-xs text-center text-gray-600">
                  Look at the red circles • Blue cursor shows your gaze
                  {showHeatmap && <span className="ml-2">• 🔥 Heatmap Active</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Instructions overlay - EyeGesturesLite handles the UI, this is just info */}
          <div className="fixed top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-xs z-40">
            <p className="text-sm text-gray-700">
              Follow the built-in calibration UI. Look at each red circle that appears.
            </p>
          </div>
        </div>
      )}

      {calibrationComplete && (
        <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16 max-w-2xl relative z-40">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl p-6 md:p-8 text-center">
            <div className="text-5xl md:text-6xl lg:text-8xl mb-4 md:mb-6 animate-bounce">✅</div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              Calibration Complete!
            </h1>
            <p className="text-gray-600 text-sm md:text-base lg:text-lg mb-6 md:mb-8">
              Your eye tracking is calibrated and ready. The blue cursor will follow your gaze.
            </p>

            <div className="space-y-2 md:space-y-3">
              <button
                onClick={startCommunicating}
                className="w-full py-3 md:py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-base md:text-lg rounded-lg md:rounded-xl transition-colors shadow-lg"
              >
                🎉 Start Communicating with Eye Tracking
              </button>

              <button
                onClick={handleRecalibrate}
                className="w-full py-2 md:py-3 bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold text-sm md:text-base rounded-lg md:rounded-xl transition-colors"
              >
                Recalibrate
              </button>

              <button
                onClick={() => {
                  stopEyeGestures();
                  router.push('/');
                }}
                className="w-full py-2 md:py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold text-sm md:text-base rounded-lg md:rounded-xl transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
