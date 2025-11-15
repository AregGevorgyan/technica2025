# Troubleshooting Guide - EyeGesturesLite Integration

## Common Issues

### 1. "ML is not defined" Error

**Symptoms:**
- Blank calibration screen with no dots
- Runtime error: `ML is not defined`
- Error occurs at `Calibrator.add()`

**Cause:**
EyeGesturesLite requires external dependencies (ML.js and Math.js) to be loaded before initialization.

**Solution:**
The fix has been implemented in `lib/input/eyegestures-init.ts`. The dependencies are now loaded automatically before EyeGesturesLite initializes.

**If the error persists:**
1. Check browser console for script loading errors
2. Verify network connection (CDN scripts need to load)
3. Try clearing browser cache and reloading
4. Check if browser blocks CDN scripts (check browser security settings)

### 2. Camera Permission Denied

**Symptoms:**
- "Failed to access webcam" error
- Calibration doesn't start

**Solution:**
1. Click the camera icon in browser address bar
2. Allow camera access
3. Refresh the page
4. Try calibration again

### 3. Calibration Points Not Appearing

**Symptoms:**
- Progress bar shows but no red circles appear
- Blue cursor is visible but nothing to look at

**Solution:**
1. Ensure you've clicked "Start Calibration"
2. Wait for the instruction overlay to disappear (or click "Continue")
3. Check browser console for JavaScript errors
4. Try refreshing the page and starting again

### 4. Heatmap Not Working

**Symptoms:**
- Toggle heatmap button doesn't show visualization
- No colored overlay appears

**Solution:**
1. Ensure calibration has started
2. Check browser console for heatmap.js loading errors
3. Try toggling off and on again
4. The heatmap only shows when you're looking at the screen

### 5. Calibration Stuck at 0%

**Symptoms:**
- Progress bar doesn't move
- Counter stays at "Point 0 of 25"

**Solution:**
1. Check that camera permissions are granted
2. Ensure good lighting on your face
3. Look directly at the red circles when they appear
4. Make sure MediaPipe can detect your face
5. Try moving closer to the camera (2 feet away is optimal)

### 6. Blue Cursor Not Following Eyes

**Symptoms:**
- Calibration completes but cursor doesn't track gaze
- Cursor is frozen or jumps randomly

**Solution:**
1. Recalibrate using the "Recalibrate" button
2. Improve lighting conditions
3. Keep head relatively still
4. Ensure you're centered in camera view
5. Check that glasses (if worn) aren't causing glare

## Debug Steps

### Enable Debug Logging

Open browser console (F12) and check for:
- `"Loading EyeGesturesLite dependencies..."`
- `"EyeGesturesLite dependencies loaded"`
- `"EyeGesturesLite initialized successfully"`

### Check Required Elements

Open browser console and run:
```javascript
console.log({
  video: document.getElementById('video'),
  status: document.getElementById('status'),
  error: document.getElementById('error'),
  cursor: document.getElementById('cursor'),
  calib_cursor: document.getElementById('calib_cursor')
});
```

All should exist.

### Check Dependencies

Open browser console and run:
```javascript
console.log({
  ML: typeof ML,
  math: typeof math,
  FaceMesh: typeof FaceMesh
});
```

All should be `"object"` or `"function"`, not `"undefined"`.

## Browser Compatibility

### Supported Browsers:
- ✅ Chrome/Edge (v90+)
- ✅ Firefox (v88+)
- ✅ Safari (v14+)
- ❌ Internet Explorer (not supported)

### Required Features:
- WebRTC (for camera access)
- WebAssembly (for MediaPipe)
- ES6 modules
- HTTPS or localhost (for camera permissions)

## Performance Issues

### Slow Calibration

**Causes:**
- Older hardware
- High CPU usage from other apps
- Many browser tabs open

**Solutions:**
1. Close unnecessary browser tabs
2. Close other applications
3. Use a device with better specs
4. Try in Chrome (usually best performance)

### Laggy Cursor

**Causes:**
- Poor lighting
- Face partially obscured
- Head moving too much

**Solutions:**
1. Improve lighting (front-lit face works best)
2. Keep head still during tracking
3. Remove obstacles between face and camera
4. Reduce gaze smoothing buffer (advanced)

## Network Issues

### CDN Script Failures

If ML.js or Math.js fail to load:

1. **Check Network Tab** in browser DevTools
2. **Verify URLs are accessible:**
   - https://www.lactame.com/lib/ml/6.0.0/ml.min.js
   - https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.8.0/math.min.js
   - https://eyegestures.com/eyegestures.css

3. **Alternative:** Install libraries locally (advanced):
   ```bash
   npm install ml-matrix mathjs
   ```
   Then modify `eyegestures-init.ts` to import locally instead of via CDN.

## Getting Help

If issues persist:

1. **Check the GitHub Issues:**
   - https://github.com/NativeSensors/EyeGesturesLite/issues

2. **Join the Discord:**
   - https://discord.gg/FvagCX8T4h

3. **Email Support:**
   - contact@eyegestures.com

4. **Include This Information:**
   - Browser name and version
   - Operating system
   - Error messages from console
   - Steps to reproduce the issue
   - Screenshot/recording of the problem

## Known Limitations

1. **Requires HTTPS or localhost** for camera access
2. **Works best with front-facing lighting**
3. **Accuracy decreases with head movement**
4. **Calibration takes ~1 minute** (25 points)
5. **Glasses may affect accuracy** (especially with glare)
6. **Mobile support is experimental** (works better on desktop)

## Advanced Troubleshooting

### Reset Everything

If nothing else works:

1. Clear browser cache completely
2. Clear localStorage:
   ```javascript
   localStorage.clear();
   ```
3. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. Restart browser
5. Try in incognito/private mode

### Check MediaPipe Loading

MediaPipe face mesh is loaded automatically. Check status:

```javascript
// In browser console after initialization attempt
console.log(window.FaceMesh ? 'MediaPipe loaded' : 'MediaPipe NOT loaded');
```

### Manually Test EyeGestures

After initialization, test the instance:

```javascript
// In browser console
const instance = window.eyeGesturesInstance; // If exposed
if (instance) {
  console.log('Calibration counter:', instance.calib_counter);
  console.log('Calibration max:', instance.calib_max);
  console.log('Is running:', instance.run);
}
```
