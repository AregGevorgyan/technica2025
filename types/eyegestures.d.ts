// Type declaration for eyegestures library
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
