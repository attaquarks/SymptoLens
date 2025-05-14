import * as tf from '@tensorflow/tfjs-node';
import { TextEncoderOutput, ImageEncoderOutput, FusionOutput } from '../types';

/**
 * MultimodalFusion: Combines text and image encodings into a unified representation
 * This module fuses information from different modalities to create a comprehensive
 * symptom representation, allowing the system to consider both textual and visual evidence.
 */
export class MultimodalFusion {
  /**
   * Fuses text and image embeddings to create a unified representation
   * @param textOutput - Output from the TextEncoder
   * @param imageOutput - Output from the ImageEncoder (optional)
   * @returns A FusionOutput containing the fused embedding and all identified symptoms
   */
  public async fuseEmbeddings(
    textOutput: TextEncoderOutput,
    imageOutput: ImageEncoderOutput | null
  ): Promise<FusionOutput> {
    // Get all identified symptoms and features
    const allSymptoms = [...textOutput.identifiedSymptoms];
    const allFeatures = imageOutput?.identifiedFeatures || [];
    
    // Combine all identified symptoms and features
    const allIdentifiedFactors = [...new Set([...allSymptoms, ...allFeatures])];
    
    // Get the tensor embeddings
    const textEmbedding = textOutput.embedding;
    const imageEmbedding = imageOutput?.embedding || tf.zeros([20]);
    
    // If we have both text and image, perform fusion
    let fusedEmbedding: tf.Tensor;
    
    if (imageOutput) {
      // In a real implementation, we would use a learned fusion mechanism
      // such as cross-attention or a fusion network.
      // For this simulation, we'll use a weighted average with more weight on text
      
      // Weighted average fusion (text is weighted higher)
      const textWeight = tf.scalar(0.7);
      const imageWeight = tf.scalar(0.3);
      
      const weightedText = textEmbedding.mul(textWeight);
      const weightedImage = imageEmbedding.mul(imageWeight);
      
      fusedEmbedding = weightedText.add(weightedImage);
    } else {
      // If no image, just use the text embedding
      fusedEmbedding = textEmbedding;
    }
    
    // Return the fusion output
    return {
      fusedEmbedding,
      allIdentifiedFactors,
      textSymptoms: textOutput.identifiedSymptoms,
      visualFeatures: allFeatures,
      rawTextInput: textOutput.rawText,
      hasImage: !!imageOutput,
      imageDescription: imageOutput?.imageDescription || ""
    };
  }
}

export const multimodalFusion = new MultimodalFusion();
