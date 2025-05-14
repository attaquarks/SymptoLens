import { FusionOutput, ReasoningOutput, ConditionPrediction } from '../types';
import { knowledgeBase } from './knowledge-base';
import { MedicalCondition } from '@shared/schema';

/**
 * ReasoningEngine: Validates and refines AI predictions using the Knowledge Base
 * This module ensures predictions are consistent with medical knowledge and provides
 * explanations and context for the results.
 */
export class ReasoningEngine {
  /**
   * Process multimodal fusion output to generate validated predictions
   * @param fusionOutput - Output from the MultimodalFusion module
   * @returns ReasoningOutput with validated and contextualized predictions
   */
  public async processFusionOutput(fusionOutput: FusionOutput): Promise<ReasoningOutput> {
    // Simplify predictions based on the fusion output
    const predictions = await this.generatePredictions(fusionOutput);
    
    // Validate and refine predictions using the knowledge base
    const validatedPredictions = await this.validatePredictions(
      predictions,
      fusionOutput.allIdentifiedFactors
    );
    
    // Sort predictions by confidence
    validatedPredictions.sort((a, b) => b.confidence - a.confidence);
    
    // Generate a summary of the findings
    const summary = this.generateSummary(
      validatedPredictions,
      fusionOutput
    );
    
    return {
      conditions: validatedPredictions,
      summary: summary,
      inputFactors: fusionOutput.allIdentifiedFactors,
      textSymptoms: fusionOutput.textSymptoms,
      visualFeatures: fusionOutput.visualFeatures,
      hasImage: fusionOutput.hasImage
    };
  }
  
  /**
   * Generate initial predictions based on fusion output
   * @param fusionOutput - Output from the MultimodalFusion module
   * @returns Array of initial condition predictions
   */
  private async generatePredictions(fusionOutput: FusionOutput): Promise<ConditionPrediction[]> {
    // In a real implementation, this would use the fusedEmbedding to predict conditions
    // using a machine learning model trained on symptom-to-condition mappings.
    
    // For this simulation, we'll use the knowledge base to identify potential conditions
    const allConditions = await knowledgeBase.getAllConditions();
    
    // Check each condition's association with the identified factors
    const predictions: ConditionPrediction[] = [];
    
    for (const condition of allConditions) {
      // Calculate an association score
      const associationScore = await knowledgeBase.calculateSymptomAssociation(
        condition.name,
        fusionOutput.allIdentifiedFactors
      );
      
      // Get matching factors for this condition
      const matchingFactors = await knowledgeBase.getMatchingFactors(
        condition.name,
        fusionOutput.allIdentifiedFactors
      );
      
      // Only include conditions with some association
      if (associationScore > 0.1) {
        predictions.push({
          id: condition.name.toLowerCase().replace(/\s+/g, '-'),
          name: condition.name,
          // Add some randomness to simulate AI confidence variations
          confidence: Math.min(100, Math.round(associationScore * 100 + Math.random() * 10)),
          description: condition.description,
          matchingFactors: matchingFactors,
          additionalInfo: condition.additionalInfo || undefined,
          recommendedActions: (condition.recommendedActions as string[]) || undefined
        });
      }
    }
    
    return predictions;
  }
  
  /**
   * Validate and refine predictions using medical knowledge
   * @param predictions - Initial condition predictions
   * @param identifiedFactors - All identified symptoms and features
   * @returns Refined and validated predictions
   */
  private async validatePredictions(
    predictions: ConditionPrediction[],
    identifiedFactors: string[]
  ): Promise<ConditionPrediction[]> {
    // In a real implementation, this would apply medical logic rules,
    // check for contraindications, and refine confidence scores based on
    // demographic factors, symptom progression, etc.
    
    // For this simulation, we'll simply adjust confidence scores based on
    // the number of matching factors relative to the total identified factors
    
    return predictions.map(prediction => {
      const matchRatio = prediction.matchingFactors.length / identifiedFactors.length;
      
      // Adjust confidence based on match ratio
      // This ensures that conditions matching more of the symptoms get higher confidence
      let adjustedConfidence = prediction.confidence;
      
      if (matchRatio < 0.3) {
        // Reduce confidence for conditions with few matching factors
        adjustedConfidence = Math.max(25, Math.round(prediction.confidence * 0.8));
      } else if (matchRatio > 0.7) {
        // Increase confidence for conditions with many matching factors
        adjustedConfidence = Math.min(95, Math.round(prediction.confidence * 1.1));
      }
      
      return {
        ...prediction,
        confidence: adjustedConfidence
      };
    });
  }
  
  /**
   * Generate a summary of the analysis results
   * @param predictions - Validated condition predictions
   * @param fusionOutput - Original fusion output
   * @returns A textual summary of the findings
   */
  private generateSummary(
    predictions: ConditionPrediction[],
    fusionOutput: FusionOutput
  ): string {
    const numConditions = predictions.length;
    const topCondition = predictions[0]?.name || "no specific condition";
    const hasImage = fusionOutput.hasImage;
    
    let summaryParts: string[] = [];
    
    // Describe the input
    if (hasImage) {
      summaryParts.push(`Based on your description of symptoms and the uploaded image`);
    } else {
      summaryParts.push(`Based on your description of symptoms`);
    }
    
    // Mention identified symptoms
    if (fusionOutput.textSymptoms.length > 0) {
      const symptoms = fusionOutput.textSymptoms.slice(0, 3).join(", ");
      if (fusionOutput.textSymptoms.length > 3) {
        summaryParts.push(`including ${symptoms}, and others`);
      } else {
        summaryParts.push(`including ${symptoms}`);
      }
    }
    
    // Describe findings
    if (numConditions === 0) {
      summaryParts.push(`our system couldn't identify any specific conditions matching your symptoms.`);
    } else if (numConditions === 1) {
      summaryParts.push(`our system has identified ${topCondition} as a potential condition.`);
    } else {
      summaryParts.push(`our system has identified several potential conditions, with ${topCondition} being the most likely match.`);
    }
    
    // Add standard disclaimer
    summaryParts.push(`These are preliminary assessments and should be discussed with a healthcare provider.`);
    
    return summaryParts.join(", ");
  }
}

export const reasoningEngine = new ReasoningEngine();
