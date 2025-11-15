// EyeGesturesLite initialization and management
// EyeGesturesLite uses MediaPipe FaceMesh for eye tracking and includes built-in calibration

let eyeGesturesInstance: any = null;
let gazeListeners: Array<(data: { x: number; y: number; timestamp: number; calibrated: boolean }) => void> = [];
let isInitialized = false;
let dependenciesLoaded = false;
let isCalibrated = false; // Track calibration state globally

// Load external dependencies required by EyeGesturesLite
async function loadDependencies(): Promise<void> {
  if (dependenciesLoaded) return;

  return new Promise((resolve, reject) => {
    let mlLoaded = false;
    let mathLoaded = false;

    const checkComplete = () => {
      if (mlLoaded && mathLoaded) {
        dependenciesLoaded = true;
        console.log('EyeGesturesLite dependencies loaded');
        resolve();
      }
    };

    // Check if ML.js already exists
    if ((window as any).ML) {
      mlLoaded = true;
    } else {
      // Load ML.js
      const mlScript = document.createElement('script');
      mlScript.src = 'https://www.lactame.com/lib/ml/6.0.0/ml.min.js';
      mlScript.onload = () => {
        mlLoaded = true;
        checkComplete();
      };
      mlScript.onerror = () => reject(new Error('Failed to load ML.js'));
      document.head.appendChild(mlScript);
    }

    // Check if Math.js already exists
    if ((window as any).math) {
      mathLoaded = true;
    } else {
      // Load Math.js
      const mathScript = document.createElement('script');
      mathScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.8.0/math.min.js';
      mathScript.onload = () => {
        mathLoaded = true;
        checkComplete();
      };
      mathScript.onerror = () => reject(new Error('Failed to load Math.js'));
      document.head.appendChild(mathScript);
    }

    // If both already loaded, resolve immediately
    checkComplete();
  });
}

export async function initializeEyeGestures(videoElementId: string = 'video'): Promise<boolean> {
  if (isInitialized && eyeGesturesInstance) {
    console.log('EyeGestures already initialized, reusing existing instance');

    // Ensure video is hidden by default when reusing instance
    const videoElement = document.getElementById(videoElementId) as HTMLVideoElement;
    if (videoElement) {
      videoElement.style.display = 'none';
    }

    return true;
  }

  // If we have a stale instance, clean it up first
  if (eyeGesturesInstance && !isInitialized) {
    console.warn('Found stale EyeGestures instance, cleaning up...');
    try {
      eyeGesturesInstance.stop();
    } catch (e) {
      // Ignore cleanup errors
    }
    eyeGesturesInstance = null;
  }

  try {
    // Load external dependencies first (ML.js and Math.js)
    console.log('Loading EyeGesturesLite dependencies...');
    await loadDependencies();

    // Dynamically import EyeGestures (client-side only)
    const EyeGestures = (await import('eyegestures')).default;

    // Ensure required DOM elements exist (EyeGesturesLite requires specific structure)
    ensureRequiredElements(videoElementId);

    // Initialize EyeGestures with callback
    // Callback signature: (point: [x, y], calibration: boolean)
    eyeGesturesInstance = new EyeGestures(videoElementId, (point: number[], calibration: boolean) => {
      if (!point || point.length < 2) return;

      // Update global calibration state
      if (calibration && !isCalibrated) {
        isCalibrated = true;
        console.log('✅ Eye tracking calibration complete');
      }

      const timestamp = Date.now();

      // IMPORTANT: Use our global isCalibrated flag, not the callback parameter
      // EyeGesturesLite sometimes sends calibration=false even after calibration completes
      const data = {
        x: point[0],
        y: point[1],
        timestamp,
        calibrated: isCalibrated, // Use global state, not callback parameter
      };

      // Notify all listeners
      if (gazeListeners.length === 0 && Math.random() < 0.01) {
        console.warn('⚠️ No gaze listeners registered! Gaze data is being ignored.');
      }

      gazeListeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('Error in gaze listener:', error);
        }
      });
    });

    // Note: EyeGesturesLite's start() method shows calibration UI automatically
    // It displays 20 calibration points that the user must look at
    console.log('EyeGesturesLite initialized successfully');

    // Ensure video is hidden by default (will be shown via showVideoPreview if needed)
    const videoElement = document.getElementById(videoElementId) as HTMLVideoElement;
    if (videoElement) {
      videoElement.style.display = 'none';
    }

    isInitialized = true;
    return true;
  } catch (error) {
    console.error('Failed to initialize EyeGesturesLite:', error);
    isInitialized = false;
    return false;
  }
}

function ensureRequiredElements(videoElementId: string): void {
  // EyeGesturesLite requires specific DOM elements to exist
  
  // Load EyeGesturesLite CSS if not already loaded
  if (!document.getElementById('eyegestures-css')) {
    const link = document.createElement('link');
    link.id = 'eyegestures-css';
    link.rel = 'stylesheet';
    link.href = 'https://eyegestures.com/eyegestures.css';
    document.head.appendChild(link);
  }
  
  // Video element (can be hidden)
  let videoElement = document.getElementById(videoElementId) as HTMLVideoElement;
  if (!videoElement) {
    videoElement = document.createElement('video');
    videoElement.id = videoElementId;
    videoElement.width = 640;
    videoElement.height = 480;
    videoElement.autoplay = true;
    videoElement.style.display = 'none';
    document.body.appendChild(videoElement);
  }

  // Status div (for initialization status)
  let statusDiv = document.getElementById('status');
  if (!statusDiv) {
    statusDiv = document.createElement('div');
    statusDiv.id = 'status';
    statusDiv.style.display = 'none';
    statusDiv.textContent = 'Initializing...';
    document.body.appendChild(statusDiv);
  }

  // Error div (for error messages)
  let errorDiv = document.getElementById('error');
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.id = 'error';
    errorDiv.style.display = 'none';
    document.body.appendChild(errorDiv);
  }
}


export function addGazeListener(
  listener: (data: { x: number; y: number; timestamp: number; calibrated: boolean }) => void
): void {
  if (!gazeListeners.includes(listener)) {
    gazeListeners.push(listener);
    console.log(`✅ Gaze listener added. Total listeners: ${gazeListeners.length}`);
  } else {
    console.warn('Gaze listener already exists, not adding duplicate');
  }
}

export function removeGazeListener(
  listener: (data: { x: number; y: number; timestamp: number; calibrated: boolean }) => void
): void {
  const beforeCount = gazeListeners.length;
  gazeListeners = gazeListeners.filter(l => l !== listener);
  const afterCount = gazeListeners.length;
  if (beforeCount !== afterCount) {
    console.log(`Gaze listener removed. Remaining listeners: ${afterCount}`);
  }
}

export function removeAllGazeListeners(): void {
  console.log(`Removing all gaze listeners (was ${gazeListeners.length})`);
  gazeListeners = [];
}

export async function stopEyeGestures(): Promise<void> {
  if (eyeGesturesInstance) {
    try {
      // Try to stop gracefully, but catch any DOM errors
      eyeGesturesInstance.stop();
    } catch (error) {
      console.warn('Error stopping EyeGestures (non-critical):', error);
      // Continue with cleanup even if stop() fails
    } finally {
      eyeGesturesInstance = null;
      gazeListeners = [];
      isInitialized = false;
      isCalibrated = false; // Reset calibration state
    }
  }
}

export function isEyeGesturesReady(): boolean {
  return isInitialized && eyeGesturesInstance !== null;
}

export function isEyeGesturesCalibrated(): boolean {
  return isCalibrated;
}

export function getEyeGesturesInstance(): any {
  return eyeGesturesInstance;
}

// Start calibration and tracking (shows built-in calibration UI)
export async function startEyeGestures(skipCalibrationIfAlreadyCalibrated: boolean = false): Promise<void> {
  if (!eyeGesturesInstance) {
    throw new Error('EyeGestures not initialized. Call initializeEyeGestures() first.');
  }

  // If already calibrated and we want to skip re-calibration, just ensure tracking is active
  if (skipCalibrationIfAlreadyCalibrated && isCalibrated) {
    console.log('Eye tracking already calibrated, skipping recalibration');
    // The instance is already running and calibrated, just make sure cursor is visible
    showGazeCursor();

    // Force hide video element (in case it was shown before)
    const videoElement = document.getElementById('video') as HTMLVideoElement;
    if (videoElement) {
      videoElement.style.display = 'none';
    }

    return;
  }

  // This will show the calibration instructions and start the 25-point calibration
  eyeGesturesInstance.start();

  // Force hide video element after starting (unless explicitly shown by user)
  setTimeout(() => {
    const videoElement = document.getElementById('video') as HTMLVideoElement;
    if (videoElement) {
      videoElement.style.display = 'none';
    }
  }, 100);
}

// Recalibrate (restart calibration process)
export function recalibrateEyeGestures(): void {
  if (eyeGesturesInstance) {
    isCalibrated = false; // Reset calibration state
    eyeGesturesInstance.recalibrate();
  }
}

// Hide the blue gaze cursor
export function hideGazeCursor(): void {
  if (eyeGesturesInstance) {
    eyeGesturesInstance.invisible();
  }
}

// Show the blue gaze cursor
export function showGazeCursor(): void {
  if (eyeGesturesInstance) {
    eyeGesturesInstance.visible();
  }
}

// Get calibration progress (0-25 for EyeGesturesLite's 25 points)
export function getCalibrationProgress(): { current: number; total: number; percentage: number } {
  if (eyeGesturesInstance && eyeGesturesInstance.calib_counter !== undefined) {
    const current = eyeGesturesInstance.calib_counter;
    const total = eyeGesturesInstance.calib_max || 25;
    return {
      current,
      total,
      percentage: Math.min((current / total) * 100, 100),
    };
  }
  return { current: 0, total: 25, percentage: 0 };
}

// Show/hide video preview
export function showVideoPreview(show: boolean): void {
  const videoElement = document.getElementById('video') as HTMLVideoElement;
  if (videoElement) {
    videoElement.style.display = show ? 'block' : 'none';
    if (show) {
      // Position in bottom right corner
      videoElement.style.position = 'fixed';
      videoElement.style.bottom = '20px';
      videoElement.style.right = '20px';
      videoElement.style.width = '240px';
      videoElement.style.height = '180px';
      videoElement.style.zIndex = '1000';
      videoElement.style.borderRadius = '12px';
      videoElement.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    }
  }
}
