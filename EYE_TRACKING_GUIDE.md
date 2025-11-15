# Eye Tracking Setup Guide

## Overview

The Adaptive AAC system now includes **webcam-based eye tracking** using WebGazer.js. This allows hands-free communication by simply looking at tiles on the screen.

## How to Use Eye Tracking

### 1. Calibrate Your Eye Tracking

1. Visit http://localhost:3000
2. Click **"Eye Tracking Setup"**
3. Allow webcam access when prompted
4. Follow the calibration process:
   - Look at each numbered dot as it appears
   - Click the dot while looking directly at it
   - Complete all 9 calibration points
5. Click **"Start Communicating with Eye Tracking"** when done

### 2. Use Eye Tracking for Communication

Once calibrated:
- **Gaze at any tile** to select it
- A blue ring will appear showing you're looking at that tile
- The tile will fill with blue as you continue gazing (dwell timer)
- After **1.5 seconds** of looking, the word is automatically selected
- Works in both Immediate and Compose modes

### 3. Tips for Best Results

**Lighting:**
- Use good, even lighting
- Avoid backlighting (sitting in front of windows)
- Face a light source for best webcam visibility

**Positioning:**
- Sit about 2 feet (60cm) from the screen
- Keep your head still while using
- Position camera at eye level

**Calibration:**
- Recalibrate if accuracy degrades
- Keep the same position as during calibration
- Remove or clean glasses if wearing them

## Features

### Visual Feedback
- **Blue cursor dot**: Shows where the system thinks you're looking
- **Blue ring**: Appears when gazing at a tile
- **Fill animation**: Shows dwell progress (0-100%)
- **Eye icon**: Appears in header when eye tracking is active
- **Webcam preview**: Shows in bottom right (can be hidden)

### Customizable Settings
- **Dwell time**: Currently 1.5 seconds (1500ms)
- **Video preview**: On/off toggle
- **Sensitivity**: Adjustable through calibration

## Direct URLs

- **Calibration**: `http://localhost:3000/calibrate`
- **With Eye Tracking**: `http://localhost:3000/communicate?eyeTracking=true`
- **Without Eye Tracking**: `http://localhost:3000/communicate`

## Browser Compatibility

Eye tracking works best in:
- ✅ Google Chrome
- ✅ Microsoft Edge
- ✅ Opera
- ⚠️ Firefox (limited support)
- ❌ Safari (not supported)

**Note**: Requires HTTPS in production or `localhost` for development.

## Troubleshooting

### Calibration Not Working
- **Check webcam permission**: Browser may have blocked access
- **Lighting**: Ensure face is well-lit
- **Distance**: Move closer or farther from screen
- **Try different browser**: Chrome works best

### Inaccurate Tracking
- **Recalibrate**: Go back to /calibrate
- **Clean glasses**: Or remove them
- **Reduce head movement**: Stay still during use
- **Check lighting**: Avoid shadows on face

### Cursor Jumping Around
- **More calibration points**: Do calibration more carefully
- **Steady gaze**: Hold your gaze steady on each calibration dot
- **Reduce distractions**: Close other apps, focus on calibration

### No Video Preview
- **Camera permission**: Check browser permissions
- **Camera in use**: Close other apps using webcam
- **Refresh page**: Restart the session

## Technical Details

### How It Works
1. **WebGazer.js** uses your webcam to track eye movements
2. **Calibration** maps your gaze to screen coordinates
3. **Machine learning** improves accuracy over time
4. **Dwell detection** identifies when you're looking at a tile
5. **Auto-selection** triggers after the dwell time

### Performance
- **Frame rate**: 30+ FPS for smooth tracking
- **Latency**: <100ms response time
- **Accuracy**: Improves with use (adaptive learning)
- **CPU usage**: Moderate (uses hardware acceleration when available)

### Privacy
- **All processing happens locally** in your browser
- **No video is recorded or uploaded**
- **No data sent to external servers**
- **Calibration data stored in browser only**

## Customization (For Developers)

Edit the dwell time in [communicate/page.tsx](app/(main)/communicate/page.tsx):

```typescript
const settings = {
  dwellTime: 1500, // Change this value (milliseconds)
  // 1000 = 1 second (fast)
  // 1500 = 1.5 seconds (default)
  // 2000 = 2 seconds (slower, more deliberate)
};
```

## Future Enhancements

Potential improvements:
- [ ] Adjustable dwell time in settings UI
- [ ] Blink detection for selection
- [ ] Gaze-based scrolling
- [ ] Multi-monitor support
- [ ] Calibration improvement suggestions
- [ ] Export/import calibration data

## Resources

- [WebGazer.js Documentation](https://webgazer.cs.brown.edu/)
- [Eye Tracking Research](https://en.wikipedia.org/wiki/Eye_tracking)
- [AAC Best Practices](https://www.asha.org/practice-portal/professional-issues/augmentative-and-alternative-communication/)

## Support

Having issues? Try:
1. Recalibrate at `/calibrate`
2. Use Chrome browser
3. Ensure good lighting
4. Check webcam permissions
5. Try restarting your browser

For questions or bug reports, see the main [README](README.md).
