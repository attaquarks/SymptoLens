import * as tf from '@tensorflow/tfjs-node';
import { TextEncoderOutput, ImageEncoderOutput, MultimodalFusionOutput } from '@shared/schema';

/**
 * MultimodalFusion: Combines text and image encodings into a unified representation
 * This module fuses information from different modalities to create a comprehensive
 * symptom representation, allowing the system to consider both textual and visual evidence.
 */
export class MultimodalFusion {
  private fusionDim = 1024; // Dimension of the fused embedding

  /**
   * Fuses text and image embeddings to create a unified representation
   * @param textOutput - Output from the TextEncoder
   * @param imageOutput - Output from the ImageEncoder (optional)
   * @returns A FusionOutput containing the fused embedding and all identified symptoms
   */
  public async fuseEmbeddings(
    textOutput: TextEncoderOutput,
    imageOutput: ImageEncoderOutput | null = null
  ): Promise<MultimodalFusionOutput> {
    // Initialize default image output if none was provided
    if (!imageOutput) {
      imageOutput = {
        identifiedFeatures: [],
        embedding: Array(2048).fill(0),  // ResNet standard embedding size
        hasImage: false,
        imageDescription: ""
      };
    }

    const textEmbedding = textOutput.embedding;
    const imageEmbedding = imageOutput.embedding;
    const hasImage = imageOutput.hasImage;

    // Create a fused embedding by concatenating and then projecting
    // In a real implementation, this would be a learned projection,
    // but here we'll use a simple weighted average
    const textWeight = 0.6;  // Text is typically more informative for symptoms
    const imageWeight = hasImage ? 0.4 : 0;  // If no image, weight is 0

    // Ensure both embeddings have proper lengths for the fusion
    const paddedTextEmbedding = this.padOrTruncate(textEmbedding, this.fusionDim);
    const paddedImageEmbedding = this.padOrTruncate(imageEmbedding, this.fusionDim);

    // Create the fused embedding
    const fusedEmbedding = paddedTextEmbedding.map((val, idx) => {
      return (val * textWeight) + (paddedImageEmbedding[idx] * imageWeight);
    });

    // Collect all identified factors (symptoms from text and features from image)
    const allIdentifiedFactors = [
      ...textOutput.identifiedSymptoms,
      ...(hasImage ? imageOutput.identifiedFeatures : [])
    ];

    // Remove duplicates using filter
    const uniqueFactors = allIdentifiedFactors.filter((factor, index) => {
      return allIdentifiedFactors.indexOf(factor) === index;
    });
    
    return {
      fusedEmbedding,
      allIdentifiedFactors: uniqueFactors,
      textSymptoms: textOutput.identifiedSymptoms,
      visualFeatures: hasImage ? imageOutput.identifiedFeatures : [],
      rawTextInput: textOutput.rawText,
      hasImage
    };
  }

  /**
   * Helper function to ensure embedding vectors have the correct length by padding or truncating
   */
  private padOrTruncate(embedding: number[], targetLength: number): number[] {
    if (embedding.length === targetLength) {
      return embedding;
    } else if (embedding.length > targetLength) {
      // Truncate
      return embedding.slice(0, targetLength);
    } else {
      // Pad with zeros
      return [...embedding, ...Array(targetLength - embedding.length).fill(0)];
    }
  }
}

export const multimodalFusion = new MultimodalFusion();