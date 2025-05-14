import * as tf from '@tensorflow/tfjs-node';

/**
 * Input for the symptom analysis service
 */
export interface AnalysisInput {
  textSymptoms: string;
  imagePath?: string;
  imageDescription: string;
  patientAge: number;
  patientGender: string;
}

/**
 * Output from the TextEncoder module
 */
export interface TextEncoderOutput {
  identifiedSymptoms: string[];
  embedding: tf.Tensor;
  rawText: string;
}

/**
 * Output from the ImageEncoder module
 */
export interface ImageEncoderOutput {
  identifiedFeatures: string[];
  embedding: tf.Tensor;
  hasImage: boolean;
  imageDescription: string;
}

/**
 * Output from the MultimodalFusion module
 */
export interface FusionOutput {
  fusedEmbedding: tf.Tensor;
  allIdentifiedFactors: string[];
  textSymptoms: string[];
  visualFeatures: string[];
  rawTextInput: string;
  hasImage: boolean;
  imageDescription: string;
}

/**
 * A predicted condition with associated information
 */
export interface ConditionPrediction {
  id: string;
  name: string;
  confidence: number;
  description: string;
  matchingFactors: string[];
  additionalInfo?: string;
  recommendedActions?: string[];
}

/**
 * Output from the ReasoningEngine module
 */
export interface ReasoningOutput {
  conditions: ConditionPrediction[];
  summary: string;
  inputFactors: string[];
  textSymptoms: string[];
  visualFeatures: string[];
  hasImage: boolean;
}

/**
 * Final results returned to the client
 */
export interface AnalysisResults {
  summary: string;
  conditions: ConditionPrediction[];
}
