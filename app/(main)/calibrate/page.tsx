'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Reduced to 5 points for faster calibration
const CALIBRATION_POINTS = [
  { id: 1, x: 10, y: 10, label: 'Top Left' },
  { id: 2, x: 90, y: 10, label: 'Top Right' },
  { id: 3, x: 50, y: 50, label: 'Center' },
  { id: 4, x: 10, y: 90, label: 'Bottom Left' },
  { id: 5, x: 90, y: 90, label: 'Bottom Right' },
];

export default function CalibratePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationComplete, setCalibrationComplete] = useState(false);
  const [webgazer, setWebgazer] = useState<any>(null);
  const [clickCount, setClickCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load WebGazer
    const loadWebGazer = async () => {
      try {
        const wg = (await import('webgazer')).default;
        setWebgazer(wg);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load WebGazer:', error);
        setIsLoading(false);
      }
    };

    loadWebGazer();
  }, []);

  const startCalibration = async () => {
    if (!webgazer) {
      alert('Eye tracking library not loaded. Please refresh the page.');
      return;
    }

    setIsCalibrating(true);
    setCurrentStep(0);
    setClickCount(0);

    // Initialize WebGazer
    try {
      await webgazer
        .setGazeListener(() => {})
        .begin();

      webgazer.params.showVideoPreview = true;
      webgazer.params.showFaceOverlay = false;
      webgazer.params.showFaceFeedbackBox = true;

      // Position video preview in bottom right
      setTimeout(() => {
        const videoPreview = document.getElementById('webgazerVideoContainer');
        if (videoPreview) {
          videoPreview.style.position = 'fixed';
          videoPreview.style.bottom = '20px';
          videoPreview.style.right = '20px';
          videoPreview.style.width = '240px';
          videoPreview.style.height = '180px';
          videoPreview.style.zIndex = '1000';
          videoPreview.style.borderRadius = '12px';
          videoPreview.style.overflow = 'hidden';
          videoPreview.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        }
      }, 100);
    } catch (error) {
      console.error('Failed to initialize WebGazer:', error);
      alert('Failed to access webcam. Please check permissions and try again.');
      setIsCalibrating(false);
    }
  };

  const handleCalibrationClick = (point: typeof CALIBRATION_POINTS[0]) => {
    if (!isCalibrating || !webgazer) return;

    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);

    // Play click sound feedback
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8ti');
    audio.play().catch(() => {});

    // Move to next point after current point is clicked enough times (3 clicks per point for better accuracy)
    if (newClickCount >= 3) {
      if (currentStep < CALIBRATION_POINTS.length - 1) {
        setCurrentStep(currentStep + 1);
        setClickCount(0);
      } else {
        completeCalibration();
      }
    }
  };

  const completeCalibration = () => {
    setCalibrationComplete(true);
    setIsCalibrating(false);

    // Store calibration data in localStorage
    localStorage.setItem('eyeTrackingCalibrated', 'true');
    localStorage.setItem('eyeTrackingDwellTime', '1500');
  };

  const startCommunicating = () => {
    router.push('/communicate?eyeTracking=true');
  };

  const recalibrate = () => {
    setCalibrationComplete(false);
    setCurrentStep(0);
    setClickCount(0);
    startCalibration();
  };

  const skipCalibration = () => {
    router.push('/communicate');
  };

  const progressPercentage = isCalibrating
    ? ((currentStep * 3 + clickCount) / (CALIBRATION_POINTS.length * 3)) * 100
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading eye tracking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {!isCalibrating && !calibrationComplete && (
        <div className="container mx-auto px-4 py-4 md:py-8 lg:py-16 max-w-3xl">
          <div className="text-center mb-4 md:mb-8">
            <div className="text-4xl md:text-6xl mb-2 md:mb-4">👁️</div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
              Eye Tracking Calibration
            </h1>
            <p className="text-base md:text-lg text-gray-600">
              Quick 5-point calibration for hands-free communication
            </p>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 lg:p-8 mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4 text-gray-800">How it works</h2>
            <div className="space-y-3 md:space-y-4">
              <div className="flex gap-3 md:gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm md:text-lg">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1 text-sm md:text-base">Look and Click</h3>
                  <p className="text-gray-600 text-xs md:text-sm">A red dot will appear on screen. Look directly at it and click 3 times.</p>
                </div>
              </div>

              <div className="flex gap-3 md:gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm md:text-lg">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1 text-sm md:text-base">Repeat for 5 Points</h3>
                  <p className="text-gray-600 text-xs md:text-sm">The dot will move to different screen positions. Complete all 5 points.</p>
                </div>
              </div>

              <div className="flex gap-3 md:gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm md:text-lg">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1 text-sm md:text-base">Start Using</h3>
                  <p className="text-gray-600 text-xs md:text-sm">After calibration, look at communication tiles for 1.5 seconds to select them!</p>
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
                <span>Sit about 2 feet from the screen</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Ensure good lighting on your face</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Keep your head still during calibration</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Click while looking directly at the dot</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={startCalibration}
              className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg rounded-xl transition-colors shadow-lg hover:shadow-xl"
            >
              Start Calibration ({CALIBRATION_POINTS.length} points, ~30 seconds)
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
                        Point {currentStep + 1} of {CALIBRATION_POINTS.length}
                      </span>
                      <span className="text-xs md:text-sm font-semibold text-purple-600">
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-blue-600 h-full rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-xs text-center text-gray-600">
                  <span className="font-semibold">{CALIBRATION_POINTS[currentStep]?.label}:</span> Click {3 - clickCount} more time{3 - clickCount !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Calibration Points */}
          {CALIBRATION_POINTS.map((point, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            // Responsive dot size: smaller on mobile, larger on desktop
            const dotSize = 'w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20';
            const offset = '2.5rem'; // Half of largest size (20/2 = 10 -> 2.5rem)

            return (
              <button
                key={point.id}
                onClick={() => isActive && handleCalibrationClick(point)}
                disabled={!isActive}
                className={`
                  fixed ${dotSize} rounded-full transition-all duration-500 ease-out
                  ${isActive ? 'scale-100 z-30' : 'scale-50 z-10'}
                  ${isActive ? 'animate-pulse' : ''}
                  focus:outline-none focus:ring-2 md:focus:ring-4 focus:ring-purple-400
                `}
                style={{
                  left: `calc(${point.x}% - ${offset})`,
                  top: `calc(${point.y}% - ${offset})`,
                  backgroundColor: isCompleted ? '#10b981' : isActive ? '#dc2626' : '#9ca3af',
                  boxShadow: isActive ? '0 0 0 0 rgba(220, 38, 38, 1)' : 'none',
                  animation: isActive ? 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
                }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  {isCompleted ? (
                    <span className="text-xl sm:text-2xl md:text-3xl">✓</span>
                  ) : (
                    <span className="text-white font-bold text-lg sm:text-xl md:text-2xl">{index + 1}</span>
                  )}
                </div>
                {isActive && (
                  <div className="absolute inset-0 rounded-full border-2 md:border-4 border-red-600 animate-ping opacity-75" />
                )}
              </button>
            );
          })}

          {/* Webcam preview hint */}
          <div className="fixed bottom-24 sm:bottom-28 md:bottom-32 right-2 sm:right-4 md:right-6 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-2 py-1 md:px-3 md:py-2 text-xs md:text-sm text-gray-600 z-40 border border-gray-200">
            <p>← Webcam</p>
          </div>
        </div>
      )}

      {calibrationComplete && (
        <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16 max-w-2xl">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl p-6 md:p-8 text-center">
            <div className="text-5xl md:text-6xl lg:text-8xl mb-4 md:mb-6 animate-bounce">✅</div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              Calibration Complete!
            </h1>
            <p className="text-gray-600 text-sm md:text-base lg:text-lg mb-6 md:mb-8">
              Your eye tracking is calibrated and ready. Look at tiles for 1.5 seconds to select them.
            </p>

            <div className="space-y-2 md:space-y-3">
              <button
                onClick={startCommunicating}
                className="w-full py-3 md:py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-base md:text-lg rounded-lg md:rounded-xl transition-colors shadow-lg"
              >
                🎉 Start Communicating with Eye Tracking
              </button>

              <button
                onClick={recalibrate}
                className="w-full py-2 md:py-3 bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold text-sm md:text-base rounded-lg md:rounded-xl transition-colors"
              >
                Recalibrate
              </button>

              <button
                onClick={() => router.push('/')}
                className="w-full py-2 md:py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold text-sm md:text-base rounded-lg md:rounded-xl transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse-ring {
          0% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
          }
          50% {
            box-shadow: 0 0 0 30px rgba(220, 38, 38, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
          }
        }
      `}</style>
    </div>
  );
}
