import * as tf from '@tensorflow/tfjs-node';
import { TextEncoderOutput } from '../types';

/**
 * TextEncoder: Processes natural language symptom descriptions
 * This module would typically use a pre-trained language model.
 * For this implementation, we'll create a simplified version that extracts key symptoms
 * and generates an embedding-like representation.
 */
export class TextEncoder {
  private commonSymptoms: string[];
  private symptomVectors: Map<string, number[]>;
  private modelLoaded: boolean = false;
  
  constructor() {
    // Common symptoms for simple matching
    this.commonSymptoms = [
      "fever", "cough", "headache", "sore throat", "fatigue", 
      "runny nose", "congestion", "shortness of breath", "nausea",
      "vomiting", "diarrhea", "rash", "pain", "dizziness", "chills"
    ];
    
    // Simple embedding vectors for symptoms (simplified for demo)
    this.symptomVectors = new Map();
    this.initializeSymptomVectors();
  }
  
  private initializeSymptomVectors() {
    // Generate simple "embeddings" for each symptom
    // In a real system, these would come from a trained model
    this.commonSymptoms.forEach((symptom, i) => {
      // Create a simple embedding vector (in a real system this would be from a model)
      const vector = Array(20).fill(0);
      // Set a few positions to non-zero values based on the symptom index
      vector[i % 20] = 0.8;
      vector[(i + 1) % 20] = 0.5;
      vector[(i + 2) % 20] = 0.3;
      
      this.symptomVectors.set(symptom, vector);
    });
    
    this.modelLoaded = true;
  }
  
  private async ensureModelLoaded() {
    if (!this.modelLoaded) {
      // In a real implementation, this would load a TensorFlow model
      this.initializeSymptomVectors();
    }
  }
  
  private extractSymptoms(text: string): string[] {
    const lowercaseText = text.toLowerCase();
    return this.commonSymptoms.filter(symptom => 
      lowercaseText.includes(symptom)
    );
  }
  
  /**
   * Creates an embedding for the text description
   * @param text - The symptom description in natural language
   * @returns A TextEncoderOutput with symptoms and embedding
   */
  public async encodeText(text: string): Promise<TextEncoderOutput> {
    await this.ensureModelLoaded();
    
    // Extract mentioned symptoms
    const extractedSymptoms = this.extractSymptoms(text);
    
    // Create a combined embedding vector
    // In a real system, this would be the output of a neural network
    let embeddingVector: number[];
    
    if (extractedSymptoms.length > 0) {
      // Combine the vectors of all detected symptoms
      const vectors = extractedSymptoms.map(s => this.symptomVectors.get(s) || Array(20).fill(0));
      embeddingVector = Array(20).fill(0);
      
      // Simple averaging of symptom vectors
      for (const vector of vectors) {
        for (let i = 0; i < vector.length; i++) {
          embeddingVector[i] += vector[i] / vectors.length;
        }
      }
    } else {
      // Default embedding if no symptoms detected
      embeddingVector = Array(20).fill(0.1);
    }
    
    return {
      identifiedSymptoms: extractedSymptoms,
      embedding: tf.tensor1d(embeddingVector),
      rawText: text
    };
  }
}

export const textEncoder = new TextEncoder();
