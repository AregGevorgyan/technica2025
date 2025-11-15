// Input modes for AAC system
export type InputMode = 'click' | 'eye_tracking' | 'keyboard';

// Eye tracking configuration
export interface EyeTrackingConfig {
  enabled: boolean;
  dwellTime: number; // milliseconds
  calibrationPoints: number;
  precision: number;
}

// Keyboard navigation config
export interface KeyboardConfig {
  enabled: boolean;
  navigationKeys: {
    up: string;
    down: string;
    left: string;
    right: string;
    select: string;
    back: string;
  };
}

// Click/touch config
export interface ClickConfig {
  enabled: boolean;
  requireConfirmation: boolean;
  hoverDelay?: number;
}

// Input handler interface
export interface InputHandler {
  mode: InputMode;
  onSelect: (targetId: string) => void;
  onBack?: () => void;
  config: EyeTrackingConfig | KeyboardConfig | ClickConfig;
}

// Gaze point for eye tracking
export interface GazePoint {
  x: number;
  y: number;
  timestamp: number;
}

// Calibration data
export interface CalibrationData {
  points: GazePoint[];
  accuracy: number;
  completedAt: Date;
}
