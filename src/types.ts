export interface PipelineConfig {
  imageSize: number; // e.g. 128, 224, 256
  batchSize: number; // e.g. 16, 32, 64
  epochs: number; // e.g. 10, 20, 50, 100
  learningRate: number; // e.g. 0.001
  optimizer: "Adam" | "SGD" | "RMSprop";
  valSplit: number; // e.g. 0.20
  dropoutRate: number; // e.g. 0.3
  augmentation: boolean;
}

export interface GeneratedCodeBlock {
  title: string;
  filename: string;
  language: string;
  description: string;
  code: string;
}

export interface GISRoadSample {
  id: string;
  name: string;
  description: string;
  canvasType: "highway" | "street" | "village" | "dirt" | "concrete";
  base64Data?: string; // Cache or inline
}

export interface ClassificationResult {
  roadType: "Highway" | "Street Road" | "Village Road" | "Dirt Road" | "Concrete Road";
  confidence: number;
  visualIndicators: string[];
  surroundingFeatures: string[];
  pythonCodeInspiration: string;
  technicalRationale: string;
}
