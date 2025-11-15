declare module 'webgazer' {
  interface WebGazer {
    setGazeListener(listener: (data: any, timestamp: number) => void): WebGazer;
    begin(): Promise<WebGazer>;
    end(): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    params: {
      showVideoPreview: boolean;
      showFaceOverlay: boolean;
      showFaceFeedbackBox: boolean;
    };
  }

  const webgazer: WebGazer;
  export default webgazer;
}
