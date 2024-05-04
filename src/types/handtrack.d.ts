// types/handtrack.d.ts
declare module 'handtrackjs' {
  import * as tf from '@tensorflow/tfjs';

  // Define the interface for the model parameters
  export interface ModelParams {
    basePath?: string;
    modelType?: string;
    modelSize?: string;
    imageScaleFactor?: number;
    outputStride?: number;
    flipHorizontal?: boolean;
    maxNumBoxes?: number;
    iouThreshold?: number;
    scoreThreshold?: number;
    labelMap?: { [key: number]: string };
    fontSize?: number;
    bboxLineWidth?: number;
    renderThresholds?: { [key: string]: number };
  }

  // Define the interface for the prediction objects
  export interface Prediction {
    bbox: [number, number, number, number];
    class: number;
    label: string;
    score: string;
  }

  // Define the ObjectDetection class
  export class ObjectDetection {
    constructor(modelParams: ModelParams);
    load(): Promise<void>;
    detect(
      input:
        | tf.Tensor3D
        | ImageData
        | HTMLImageElement
        | HTMLCanvasElement
        | HTMLVideoElement
    ): Promise<Prediction[]>;
    getFPS(): number;
    setModelParameters(params: ModelParams): void;
    getModelParameters(): ModelParams;
    roundRect(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number | { tl: number; tr: number; br: number; bl: number },
      fill: boolean,
      stroke?: boolean
    ): void;
    renderPredictions(
      predictions: Prediction[],
      canvas: HTMLCanvasElement,
      context: CanvasRenderingContext2D,
      mediasource: HTMLImageElement | HTMLVideoElement
    ): void;
    dispose(): void;
  }

  // Define the load function
  export function load(params: ModelParams): Promise<ObjectDetection>;
}
