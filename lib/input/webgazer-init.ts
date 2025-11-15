// WebGazer initialization and utilities
export interface GazeData {
  x: number;
  y: number;
  timestamp: number;
}

declare global {
  interface Window {
    webgazer: any;
  }
}

let isInitialized = false;
let gazeListener: ((data: GazeData) => void) | null = null;

export async function initializeWebGazer(): Promise<boolean> {
  if (isInitialized) return true;

  try {
    // Dynamically import webgazer
    const webgazer = (await import('webgazer')).default;

    // Set up WebGazer
    await webgazer
      .setGazeListener((data: any, timestamp: number) => {
        if (data && gazeListener) {
          gazeListener({
            x: data.x,
            y: data.y,
            timestamp: timestamp,
          });
        }
      })
      .begin();

    // Configure WebGazer settings
    webgazer.params.showVideoPreview = true;
    webgazer.params.showFaceOverlay = false;
    webgazer.params.showFaceFeedbackBox = true;

    isInitialized = true;
    return true;
  } catch (error) {
    console.error('Failed to initialize WebGazer:', error);
    return false;
  }
}

export function setGazeListener(listener: (data: GazeData) => void) {
  gazeListener = listener;
}

export function removeGazeListener() {
  gazeListener = null;
}

export async function stopWebGazer() {
  if (window.webgazer) {
    await window.webgazer.end();
    isInitialized = false;
  }
}

export async function pauseWebGazer() {
  if (window.webgazer) {
    await window.webgazer.pause();
  }
}

export async function resumeWebGazer() {
  if (window.webgazer) {
    await window.webgazer.resume();
  }
}

export function showVideoPreview(show: boolean) {
  if (window.webgazer) {
    window.webgazer.params.showVideoPreview = show;
  }
}

export function isWebGazerReady(): boolean {
  return isInitialized && window.webgazer !== undefined;
}
