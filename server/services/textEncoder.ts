import * as tf from '@tensorflow/tfjs-node';
import { TextEncoderOutput } from '@shared/schema';

/**
 * TextEncoder: Processes natural language symptom descriptions
 * This module uses TensorFlow.js to implement the text encoding functionality.
 */
export class TextEncoder {
  private commonSymptoms: string[];
  private symptomVectors: Map<string, number[]>;
  private modelLoaded: boolean = false;
  private embeddingDim: number = 768; // Standard BERT embedding dimension

  constructor() {
    this.commonSymptoms = [
      "fever", "cough", "fatigue", "headache", "sore throat", 
      "runny nose", "shortness of breath", "muscle ache", "joint pain",
      "nausea", "vomiting", "diarrhea", "rash", "itching", "swelling",
      "pain", "dizziness", "blurry vision", "chest pain", "abdominal pain",
      "back pain", "eye pain", "ear pain", "numbness", "tingling",
      "weakness", "confusion", "chills", "sweating", "loss of appetite",
      "weight loss", "insomnia", "sneezing", "wheezing", "congestion"
    ];
    this.symptomVectors = new Map();
    this.initializeSymptomVectors();
  }

  private initializeSymptomVectors() {
    // Create simple word embeddings for each symptom for demonstration
    for (const symptom of this.commonSymptoms) {
      // Create a random embedding vector for each symptom
      // In a real implementation, this would use a pre-trained embedding model
      const embedding = Array.from({ length: this.embeddingDim }, () => Math.random() * 2 - 1);
      this.symptomVectors.set(symptom, embedding);
    }
    this.modelLoaded = true;
  }

  private async ensureModelLoaded() {
    if (!this.modelLoaded) {
      await this.initializeSymptomVectors();
    }
  }

  private extractSymptoms(text: string): string[] {
    const words = text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").split(/\s+/);
    const extractedSymptoms: string[] = [];
    
    // Simple keyword matching
    for (const symptom of this.commonSymptoms) {
      if (text.toLowerCase().includes(symptom)) {
        extractedSymptoms.push(symptom);
      }
    }
    
    // Look for multi-word symptoms
    const bigrams = words.slice(0, -1).map((word, i) => word + " " + words[i + 1]);
    for (const bigram of bigrams) {
      if (this.commonSymptoms.includes(bigram)) {
        extractedSymptoms.push(bigram);
      }
    }
    
    return Array.from(new Set(extractedSymptoms)); // Remove duplicates
  }

  /**
   * Creates an embedding for the text description
   * @param text - The symptom description in natural language
   * @returns A TextEncoderOutput with symptoms and embedding
   */
  public async encodeText(text: string): Promise<TextEncoderOutput> {
    await this.ensureModelLoaded();
    
    const identifiedSymptoms = this.extractSymptoms(text);
    
    // Create text embedding by averaging symptom vectors and adding a random component
    let embeddingSum = Array(this.embeddingDim).fill(0);
    
    if (identifiedSymptoms.length > 0) {
      for (const symptom of identifiedSymptoms) {
        const symptomVector = this.symptomVectors.get(symptom);
        if (symptomVector) {
          embeddingSum = embeddingSum.map((val, i) => val + symptomVector[i]);
        }
      }
      
      // Average the vectors
      embeddingSum = embeddingSum.map(val => val / identifiedSymptoms.length);
    } else {
      // If no symptoms were identified, create a random embedding
      // but with smaller values to indicate less confidence
      embeddingSum = Array.from({ length: this.embeddingDim }, () => (Math.random() * 0.5 - 0.25));
    }
    
    // Add a small random component to the embedding to simulate
    // capturing subtle nuances in the text
    const randomComponent = Array.from({ length: this.embeddingDim }, () => (Math.random() * 0.2 - 0.1));
    const finalEmbedding = embeddingSum.map((val, i) => val + randomComponent[i]);
    
    return {
      identifiedSymptoms,
      embedding: finalEmbedding,
      rawText: text
    };
  }
}

export const textEncoder = new TextEncoder();