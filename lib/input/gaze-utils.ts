// Gaze detection utilities
export interface ElementBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export function isGazeOnElement(
  gazeX: number,
  gazeY: number,
  element: HTMLElement,
  margin: number = 20 // Add 20px margin for easier targeting
): boolean {
  const rect = element.getBoundingClientRect();
  return (
    gazeX >= rect.left - margin &&
    gazeX <= rect.right + margin &&
    gazeY >= rect.top - margin &&
    gazeY <= rect.bottom + margin
  );
}

export function getElementCenter(element: HTMLElement): { x: number; y: number } {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

export function calculateGazeDistance(
  gazeX: number,
  gazeY: number,
  element: HTMLElement
): number {
  const center = getElementCenter(element);
  return Math.sqrt(
    Math.pow(gazeX - center.x, 2) + Math.pow(gazeY - center.y, 2)
  );
}

// Smooth gaze data with exponentially weighted moving average
export class GazeSmoothing {
  private buffer: { x: number; y: number }[] = [];
  private bufferSize: number;
  private smoothedX: number | null = null;
  private smoothedY: number | null = null;
  private alpha: number = 0.3; // Smoothing factor (lower = smoother but more lag)

  constructor(bufferSize: number = 5) {
    this.bufferSize = bufferSize;
  }

  addPoint(x: number, y: number): { x: number; y: number } {
    // First use simple moving average for initial buffer fill
    this.buffer.push({ x, y });
    if (this.buffer.length > this.bufferSize) {
      this.buffer.shift();
    }

    // Calculate simple moving average
    const avgX = this.buffer.reduce((sum, p) => sum + p.x, 0) / this.buffer.length;
    const avgY = this.buffer.reduce((sum, p) => sum + p.y, 0) / this.buffer.length;

    // Apply exponential smoothing on top
    if (this.smoothedX === null || this.smoothedY === null) {
      this.smoothedX = avgX;
      this.smoothedY = avgY;
    } else {
      this.smoothedX = this.alpha * avgX + (1 - this.alpha) * this.smoothedX;
      this.smoothedY = this.alpha * avgY + (1 - this.alpha) * this.smoothedY;
    }

    return { x: this.smoothedX, y: this.smoothedY };
  }

  clear() {
    this.buffer = [];
    this.smoothedX = null;
    this.smoothedY = null;
  }
}

// Dwell detection - detects when gaze stays on element for duration
export class DwellDetector {
  private dwellStartTime: number | null = null;
  private lastElement: HTMLElement | null = null;

  checkDwell(
    gazeX: number,
    gazeY: number,
    element: HTMLElement,
    dwellTime: number
  ): { isDwelling: boolean; progress: number } {
    const isOnElement = isGazeOnElement(gazeX, gazeY, element);

    if (!isOnElement || element !== this.lastElement) {
      // Reset if gaze moved off element or to different element
      this.dwellStartTime = null;
      this.lastElement = isOnElement ? element : null;
      return { isDwelling: false, progress: 0 };
    }

    // Start dwell timer if not started
    if (this.dwellStartTime === null) {
      this.dwellStartTime = Date.now();
      this.lastElement = element;
    }

    const elapsed = Date.now() - this.dwellStartTime;
    const progress = Math.min(100, (elapsed / dwellTime) * 100);
    const isDwelling = elapsed >= dwellTime;

    if (isDwelling) {
      // Reset after successful dwell
      this.dwellStartTime = null;
      this.lastElement = null;
    }

    return { isDwelling, progress };
  }

  reset() {
    this.dwellStartTime = null;
    this.lastElement = null;
  }
}
