# Eye Tracking Debugging Guide

## Testing Eye Tracking

### Step 1: Start the App
```bash
npm run dev
```

### Step 2: Test Without Eye Tracking First
1. Go to http://localhost:3000
2. Click "Start Communicating"
3. Click on tiles - they should work normally
4. Open browser console (F12) - you should see `console.log` messages when clicking tiles

### Step 3: Calibrate Eye Tracking
1. Go to http://localhost:3000/calibrate
2. Click "Start Calibration"
3. **Allow webcam access** when prompted (critical!)
4. Look at each numbered dot and click it
5. Complete all 9 points
6. Click "Start Communicating with Eye Tracking"

### Step 4: Test Eye Tracking
1. You should see:
   - Eye icon (👁️) in the header
   - Green "Eye Tracking Active" indicator (top left)
   - Webcam preview (bottom right)
   - Blue cursor dot following your gaze

2. Look at a tile for 1.5 seconds:
   - Blue ring should appear around the tile
   - Tile should fill with blue (progress indicator)
   - After 1.5s, the word should be selected

3. Open browser console to see debug messages:
   - "Eye tracking: Dwell complete on tile: [word]"
   - "Tile selected via eye tracking or click: [word]"

## Common Issues & Solutions

### Issue 1: No Webcam Preview
**Problem**: Video preview doesn't appear

**Solutions**:
- Check if webcam permission was denied
  - Chrome: Click lock icon in address bar → Camera → Allow
  - Try refreshing the page
- Close other apps using your webcam (Zoom, Teams, etc.)
- Try a different browser (Chrome works best)

### Issue 2: Blue Cursor Not Moving
**Problem**: Blue gaze cursor doesn't follow your eyes

**Solutions**:
- **Recalibrate**: Go back to /calibrate
- Ensure good lighting on your face
- Sit about 2 feet from screen
- Keep your head still
- Remove/clean glasses
- Make sure calibration completed successfully

### Issue 3: Tiles Not Selecting
**Problem**: Looking at tiles doesn't select them

**Check These**:

1. **Is eye tracking enabled?**
   - URL should be: `http://localhost:3000/communicate?eyeTracking=true`
   - Should see 👁️ icon in header

2. **Is gaze cursor moving?**
   - If no blue cursor: See Issue #2
   - If cursor exists but tiles don't select: Continue below

3. **Open browser console** (F12) and look for:
   - Any red error messages
   - "Eye tracking: Dwell complete on tile:" messages should appear when successful

4. **Check tile attributes**:
   - Open browser DevTools → Elements
   - Inspect a tile - it should have:
     - `data-gaze-target="true"`
     - `data-tile-id="1"` (or other number)

5. **Dwell time too long?**
   - Default is 1.5 seconds - try looking steadily at ONE tile
   - Don't move your eyes around while dwelling

6. **Tiles in view?**
   - Scroll so tiles are fully visible on screen
   - Don't look at tiles that are partially off-screen

### Issue 4: Tiles Select Immediately
**Problem**: Tiles select as soon as you look at them

**Solution**: This actually means it's working but dwell detection might be too sensitive
- The blue fill animation should show progress
- If selecting instantly, there might be a timing issue

### Issue 5: WebGazer Not Loading
**Problem**: "Initializing..." stuck forever

**Solutions**:
- Check browser console for errors
- WebGazer requires:
  - Modern browser (Chrome, Edge, Opera)
  - Webcam access granted
  - HTTPS or localhost
- Try refreshing the page
- Clear browser cache

## Browser Console Commands

Open console (F12) and try these:

```javascript
// Check if WebGazer is loaded
window.webgazer

// Check if it's running
window.webgazer?.isReady()

// Manually test gaze prediction
window.webgazer?.getCurrentPrediction()
```

## Manual Testing Checklist

- [ ] Browser is Chrome/Edge (Firefox has limited support)
- [ ] Webcam permission granted
- [ ] Calibration completed (all 9 points)
- [ ] URL includes `?eyeTracking=true`
- [ ] Eye icon (👁️) visible in header
- [ ] Green "Eye Tracking Active" indicator showing
- [ ] Webcam preview visible (bottom right)
- [ ] Blue cursor dot visible and moving
- [ ] Looking at tiles makes blue ring appear
- [ ] Blue fill animation shows when dwelling
- [ ] Console shows "Tile selected" messages
- [ ] Tiles actually get selected after 1.5s

## Expected Behavior

### Correct Eye Tracking Flow:
1. Look at tile → Blue ring appears immediately
2. Keep looking → Blue fill animation starts
3. After 1.5s → Tile is selected (word appears)
4. Console logs: "Eye tracking: Dwell complete on tile: [word]"
5. Console logs: "Tile selected via eye tracking or click: [word]"

### Visual Feedback Timeline:
- **0ms**: Gaze enters tile → Blue ring appears, progress = 0%
- **500ms**: Still looking → Fill at ~33%
- **1000ms**: Still looking → Fill at ~66%
- **1500ms**: Still looking → Fill at 100%, SELECTION!
- **1500ms+**: Tile selected, ring disappears, progress resets

## Advanced Debugging

### Enable WebGazer Debug Mode

Edit `lib/input/webgazer-init.ts` and add:

```typescript
webgazer.params.showVideoPreview = true;
webgazer.params.showFaceOverlay = true;  // Shows face detection
webgazer.params.showFaceFeedbackBox = true;  // Shows feedback
webgazer.params.showGazeDot = true;  // Shows predicted gaze point
```

### Add More Console Logging

Add to `handleGazeUpdate` in communicate page:

```typescript
console.log('Gaze at:', x, y);
console.log('Found tiles:', tileElements.length);
console.log('Gazing at tile:', gazingTileId, 'Progress:', gazeProgress);
```

### Check Calibration Quality

After calibration, WebGazer stores data. To reset:
1. Clear browser data for localhost
2. Recalibrate
3. Try to do calibration more carefully (look directly at dots)

## Performance Issues

If eye tracking is laggy:
- Close other tabs/apps
- Reduce webcam resolution
- Check CPU usage (Task Manager)
- Try Chrome (better WebGL support)

## Still Not Working?

1. **Test with mouse first**:
   - Go to `/communicate` (without `?eyeTracking=true`)
   - Verify clicking tiles works

2. **Check WebGazer demo**:
   - Visit https://webgazer.cs.brown.edu/
   - Test if basic eye tracking works in your browser

3. **Try different lighting**:
   - Face a window (natural light)
   - Turn on room lights
   - Avoid backlighting

4. **Recalibrate carefully**:
   - Do calibration slowly
   - Look DIRECTLY at each dot
   - Don't rush through points
   - Keep head very still

## Contact for Help

If eye tracking still doesn't work:
1. Note which issue number above matches your problem
2. Share browser console errors (if any)
3. Share browser and OS version
4. Describe what you see vs. what you expect

## Quick Test Script

Run this in browser console after loading `/communicate?eyeTracking=true`:

```javascript
// Should see these elements:
document.querySelectorAll('[data-gaze-target]').length; // Should be 6 (number of tiles)

// Check if WebGazer is working:
if (window.webgazer) {
  console.log('✓ WebGazer loaded');
  window.webgazer.getCurrentPrediction().then(p => {
    if (p) console.log('✓ Gaze prediction working:', p);
    else console.log('✗ No gaze prediction');
  });
} else {
  console.log('✗ WebGazer not loaded');
}
```

Expected output:
```
✓ WebGazer loaded
✓ Gaze prediction working: {x: 456, y: 789}
```
