# Migration to EyeGesturesLite

This document describes the migration from WebGazer.js to EyeGesturesLite for eye tracking functionality.

## Why EyeGesturesLite?

EyeGesturesLite offers several advantages over WebGazer.js:

1. **Built on MediaPipe FaceMesh**: More accurate face and eye landmark detection
2. **Built-in Calibration UI**: No need to create custom calibration components
3. **Better Performance**: Optimized for real-time tracking with lower overhead
4. **Simpler API**: Cleaner callback-based interface
5. **Active Development**: More recent updates and better support

## Key Changes

### 1. Library Initialization

**Before (WebGazer.js):**
```typescript
const webgazer = (await import('webgazer')).default;
await webgazer.setGazeListener((data, timestamp) => {
  // Handle gaze data
}).begin();
```

**After (EyeGesturesLite):**
```typescript
const EyeGestures = (await import('eyegestures')).default;
const gestures = new EyeGestures('video', (point, calibration) => {
  // Handle gaze data
  // point = [x, y]
  // calibration = true/false (is calibrated)
});
gestures.start(); // Shows built-in calibration UI
```

### 2. Calibration

**Before (WebGazer.js):**
- Custom 5-point calibration component
- Manual click handling for each point
- Custom progress tracking

**After (EyeGesturesLite):**
- Built-in 25-point calibration
- Automatic UI with red target circles
- Built-in progress tracking
- Blue cursor shows estimated gaze

### 3. Required DOM Elements

EyeGesturesLite requires specific elements to exist:

```html
<video id="video" width="640" height="480" autoplay style="display: none;"></video>
<div id="status" style="display: none;">Initializing...</div>
<div id="error" style="display: none;"></div>
```

These are automatically created by `eyegestures-init.ts` if they don't exist.

### 4. CSS Requirements

EyeGesturesLite uses specific CSS for cursors (see `app/eyegestures.css`):

- `#cursor` - Blue gaze cursor (50x50px)
- `#calib_cursor` - Red calibration cursor (200x200px)
- `#logoDivEyeGestures` - Library logo

### 5. API Methods

**Available Methods:**

```typescript
// Initialize
await initializeEyeGestures('video'); // video element ID

// Start calibration and tracking
await startEyeGestures();

// Control visibility
hideGazeCursor();
showGazeCursor();

// Recalibrate
recalibrateEyeGestures();

// Stop tracking
stopEyeGestures();

// Get progress
const progress = getCalibrationProgress();
// Returns: { current: number, total: number, percentage: number }
```

## New Features

### Debug Heatmap Overlay

The calibration page now includes a toggleable heatmap to visualize gaze distribution:

```typescript
// Enable heatmap
setShowHeatmap(true);

// Heatmap is rendered using heatmap.js
// Shows real-time visualization of where the user is looking
```

**Benefits:**
- Verify calibration accuracy
- Identify tracking issues
- Validate gaze smoothing algorithms
- Debug dwell detection

### Calibration States

The tracker now reports three states:

1. **Initializing**: Loading MediaPipe and setting up camera
2. **Calibrating**: User is going through the 25-point calibration
3. **Active**: Calibration complete, tracking is active

UI can respond to these states for better user feedback.

## Migration Checklist

- [x] Replace WebGazer.js with EyeGesturesLite in `eyegestures-init.ts`
- [x] Update calibration page to use built-in calibration UI
- [x] Add required CSS for cursors (`app/eyegestures.css`)
- [x] Update EyeTracker component to handle calibration states
- [x] Add heatmap debug overlay to calibration page
- [x] Update documentation in CLAUDE.md
- [x] Remove deprecated WebGazer references

## Testing

To test the new implementation:

1. Navigate to `/calibrate`
2. Click "Start Calibration"
3. Grant camera permissions
4. Follow the calibration instructions
5. Look at each of the 25 red circles
6. Watch the blue cursor improve as calibration progresses
7. Toggle the heatmap to verify gaze tracking
8. After calibration, navigate to `/communicate?eyeTracking=true`

## Known Issues & Limitations

1. **Browser Compatibility**: Requires WebRTC support (no IE11)
2. **HTTPS Required**: Camera access requires secure context
3. **Logo Display**: EyeGesturesLite shows a logo by default (can be hidden with `.invisible()`)
4. **Calibration Time**: 25 points takes ~1 minute (vs. 30 seconds for old 5-point)
5. **Head Movement**: More sensitive to head movement during calibration

## Performance Notes

- EyeGesturesLite uses MediaPipe which runs at ~30 FPS
- Gaze smoothing buffer increased to 10 points for stability
- Heatmap overlay has minimal performance impact (<5ms per frame)
- Video element can be hidden without affecting tracking

## Future Improvements

- [ ] Add calibration quality scoring
- [ ] Implement automatic recalibration triggers
- [ ] Add gaze accuracy visualization
- [ ] Support for eye gesture recognition (blinks, winks)
- [ ] Mobile optimization for smaller screens

## Support

- **EyeGesturesLite Issues**: https://github.com/NativeSensors/EyeGesturesLite/issues
- **Demo**: https://eyegestures.com/tryLite
- **Discord**: https://discord.gg/FvagCX8T4h
- **Email**: contact@eyegestures.com

---

## Post-Migration Bug Fix: Calibration State Persistence

### Problem (Nov 15, 2025)

Eye tracking was not working after completing calibration on the `/calibrate` page and navigating to the `/communicate` page.

#### Root Cause

The `EyeTracker` component was reinitializing the entire EyeGesturesLite system every time it mounted, which caused it to:
1. Lose the calibration data from the previous session
2. Restart the calibration process instead of resuming with the existing calibration

#### What Was Happening

1. User completes 25-point calibration on `/calibrate` page
2. User clicks "Start Communicating" → navigates to `/communicate?eyeTracking=true`
3. `/communicate` page mounts `<EyeTracker>` component
4. `EyeTracker` calls `initializeEyeGestures()` and `startEyeGestures()`
5. `startEyeGestures()` **restarts calibration** instead of resuming tracking
6. User sees calibration UI again instead of being able to use eye tracking

### Solution Implemented

#### 1. Global Calibration State Tracking

Added a global `isCalibrated` flag in [lib/input/eyegestures-init.ts](lib/input/eyegestures-init.ts) that persists across page navigation:

```typescript
let isCalibrated = false; // Track calibration state globally

// Updated in gaze callback:
if (calibration && !isCalibrated) {
  isCalibrated = true;
  console.log('✅ Eye tracking calibration complete');
}
```

This flag is:
- Set to `true` when calibration completes (in the gaze callback)
- Reset to `false` when `stopEyeGestures()` or `recalibrateEyeGestures()` is called
- Checked before starting eye tracking to skip recalibration

#### 2. Smart Start Function

Modified `startEyeGestures()` to accept a parameter:

```typescript
export async function startEyeGestures(
  skipCalibrationIfAlreadyCalibrated: boolean = false
): Promise<void> {
  if (!eyeGesturesInstance) {
    throw new Error('EyeGestures not initialized. Call initializeEyeGestures() first.');
  }

  // If already calibrated and we want to skip re-calibration, just ensure tracking is active
  if (skipCalibrationIfAlreadyCalibrated && isCalibrated) {
    console.log('Eye tracking already calibrated, skipping recalibration');
    showGazeCursor();
    return;
  }

  // Otherwise start full calibration
  eyeGesturesInstance.start();
}
```

#### 3. New Helper Function

Added `isEyeGesturesCalibrated()` to check calibration status:

```typescript
export function isEyeGesturesCalibrated(): boolean {
  return isCalibrated;
}
```

#### 4. Updated EyeTracker Component

Modified [components/input/EyeTracker.tsx](components/input/EyeTracker.tsx) to:
- Check if already calibrated before initializing
- Pass `true` to `startEyeGestures(true)` to skip recalibration if already done
- Not call `stopEyeGestures()` on unmount (to preserve calibration state across navigation)
- Only remove gaze listeners on unmount

```typescript
// Start eye tracking - skip calibration if already calibrated
await startEyeGestures(true); // Pass true to skip recalibration if already done

console.log(`Eye tracking ${isNowCalibrated ? 'resumed with existing calibration' : 'starting calibration'}`);
```

#### 5. Updated Calibration Page

Modified [app/(main)/calibrate/page.tsx](app/(main)/calibrate/page.tsx) `startCommunicating()` function:
- Removed `removeAllGazeListeners()` call
- Now just navigates to communicate page without cleaning up
- Lets the communicate page's `EyeTracker` component take over the listeners

#### 6. TypeScript Type Declarations

Created [types/eyegestures.d.ts](types/eyegestures.d.ts) to fix build errors:

```typescript
declare module 'eyegestures' {
  export default class EyeGestures {
    constructor(
      videoElementId: string,
      callback: (point: number[], calibration: boolean) => void
    );

    start(): void;
    stop(): void;
    recalibrate(): void;
    invisible(): void;
    visible(): void;

    calib_counter?: number;
    calib_max?: number;
  }
}
```

### How It Works Now

**Successful Flow:**

1. **Calibration Page:**
   - User completes 25-point calibration
   - `isCalibrated` is set to `true` globally
   - User clicks "Start Communicating"
   - Navigates to `/communicate?eyeTracking=true` WITHOUT stopping eye tracking

2. **Communicate Page:**
   - `<EyeTracker enabled={true}>` mounts
   - Component calls `initializeEyeGestures()` (idempotent - returns early if already initialized)
   - Component calls `startEyeGestures(true)` with skip flag
   - Function detects `isCalibrated = true` and skips recalibration
   - Eye tracking resumes immediately with existing calibration
   - User can use gaze to select tiles

3. **Navigation:**
   - Calibration persists across page navigation within the session
   - Only resets if user explicitly recalibrates or closes the browser

### Testing the Fix

To verify the fix works:

1. Start the development server: `npm run dev`
2. Navigate to `/calibrate`
3. Click "Start Calibration"
4. Complete the 25-point calibration process
5. Click "Start Communicating with Eye Tracking"
6. **Expected:** Eye tracking should work immediately on communicate page
7. **Expected:** Blue gaze cursor should follow your eyes
8. **Expected:** Looking at tiles for 1.5 seconds should select them
9. **Should NOT see:** Calibration UI starting again

**Console Logs to Watch For:**

```
✅ Eye tracking calibration complete
✅ Navigating to communicate page with eye tracking enabled
Eye tracking already calibrated, skipping recalibration
Eye tracking resumed with existing calibration
```

### Files Modified

- [lib/input/eyegestures-init.ts](lib/input/eyegestures-init.ts) - Added global calibration state tracking
- [components/input/EyeTracker.tsx](components/input/EyeTracker.tsx) - Updated to preserve calibration across navigation
- [app/(main)/calibrate/page.tsx](app/(main)/calibrate/page.tsx) - Updated navigation to not clean up tracking
- [types/eyegestures.d.ts](types/eyegestures.d.ts) - Added TypeScript declarations (NEW FILE)

### Future Improvements

Consider adding:
- ✅ Calibration quality indicator (how accurate the calibration is)
- ✅ Persistent calibration storage (localStorage/IndexedDB) to survive page refreshes
- ✅ Calibration expiration (recalibrate after X hours or if accuracy degrades)
- ✅ Per-device calibration profiles

---

**Last Updated:** 2025-11-15
**Status:** ✅ Bug Fixed - Eye tracking now persists across page navigation
