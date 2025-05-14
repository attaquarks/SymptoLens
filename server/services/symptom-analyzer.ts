import { textEncoder } from './text-encoder';
import { imageEncoder } from './image-encoder';
import { multimodalFusion } from './multimodal-fusion';
import { reasoningEngine } from './reasoning-engine';
import { AnalysisInput, AnalysisResults } from '../types';

/**
 * Core service that orchestrates the complete symptom analysis pipeline.
 * This coordinates the various modules (text encoder, image encoder, fusion, reasoning)
 * to process user input and generate the final analysis results.
 */
export async function analyzeSymptomsWithImage(input: AnalysisInput): Promise<AnalysisResults> {
  try {
    // Step 1: Process the text symptoms
    console.log("Processing text symptoms...");
    const textOutput = await textEncoder.encodeText(input.textSymptoms);
    
    // Step 2: Process the image if provided
    console.log("Processing image...");
    const imageOutput = await imageEncoder.encodeImage(
      input.imagePath,
      input.imageDescription
    );
    
    // Step 3: Fuse the text and image data
    console.log("Applying multimodal fusion...");
    const fusionOutput = await multimodalFusion.fuseEmbeddings(
      textOutput,
      imageOutput
    );
    
    // Step 4: Apply reasoning and validation
    console.log("Applying knowledge base reasoning...");
    const reasoningOutput = await reasoningEngine.processFusionOutput(fusionOutput);
    
    // Step 5: Format the final results
    console.log("Generating results...");
    
    return {
      summary: reasoningOutput.summary,
      conditions: reasoningOutput.conditions
    };
    
  } catch (error) {
    console.error("Error in symptom analysis pipeline:", error);
    throw new Error("Failed to analyze symptoms. Please try again.");
  }
}
