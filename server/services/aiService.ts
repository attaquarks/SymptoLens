
import fetch from 'node-fetch';
import { SymptomAnalysis, PotentialCondition, NextStep } from "@shared/schema";
import { knowledgeBase } from './knowledgeBase';

const HUGGING_FACE_API = "https://api-inference.huggingface.co/models/medicalai/ClinicalBERT";
const HUGGING_FACE_TOKEN = process.env.HUGGING_FACE_TOKEN;

export async function analyzeSymptoms(input: AnalysisInput): Promise<SymptomAnalysis> {
  try {
    // Combine all input data into a comprehensive prompt
    const fullDescription = `
      Symptoms: ${input.description}
      ${input.duration ? `Duration: ${input.duration}` : ''}
      ${input.severity ? `Severity: ${input.severity}` : ''}
      ${input.bodyLocation ? `Location: ${input.bodyLocation}` : ''}
    `;

    // Get analysis from both Hugging Face and knowledge base
    // Get analysis primarily from knowledge base if AI service fails
    let aiAnalysis = [];
    try {
      aiAnalysis = await getHuggingFaceAnalysis(fullDescription);
    } catch (error) {
      console.warn("AI analysis failed, falling back to knowledge base:", error);
    }
    
    const kbConditions = await getKnowledgeBaseAnalysis(input);

    // Combine and rank conditions
    const combinedConditions = mergePredictions(aiAnalysis, kbConditions);

    function mergePredictions(aiPreds: any[], kbPreds: any[]): PotentialCondition[] {
      const merged = new Map<string, PotentialCondition>();
      
      // Add KB predictions first as base
      for (const kbPred of kbPreds) {
        merged.set(kbPred.name.toLowerCase(), kbPred);
      }
      
      // Enhance with AI predictions
      for (const aiPred of aiPreds) {
        const key = aiPred.name.toLowerCase();
        if (merged.has(key)) {
          // Combine scores if condition exists in both
          const existing = merged.get(key)!;
          existing.score = Math.max(existing.score || 0, aiPred.score || 0);
        } else {
          // Add new AI prediction
          merged.set(key, aiPred);
        }
      }
      
      return Array.from(merged.values())
        .sort((a, b) => (b.score || 0) - (a.score || 0));
    }

    return {
      potentialConditions: combinedConditions,
      nextSteps: determineNextSteps(combinedConditions),
      disclaimer: "This information is for educational purposes only and should not replace professional medical advice.",
      extractedTextualSymptoms: extractSymptoms(input.description),
      userInputText: input.description
    };
  } catch (error) {
    console.error("Error in symptom analysis:", error);
    return getDefaultResponse(input);
  }
}

async function getHuggingFaceAnalysis(description: string) {
  const response = await fetch(HUGGING_FACE_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HUGGING_FACE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: description })
  });

  const result = await response.json();
  return processBertResults(result);
}

function processBertResults(results: any) {
  const conditions = [];
  
  // Handle error response
  if (results.error) {
    console.error("HuggingFace API error:", results.error);
    return conditions;
  }

  // Ensure results is an array
  const predictions = Array.isArray(results) ? results : [results];
  
  for (const prediction of predictions) {
    if (prediction && prediction.label) {
      conditions.push({
        name: prediction.label,
        score: prediction.score || 0.5,
        relevance: (prediction.score || 0.5) > 0.7 ? "high" : (prediction.score || 0.5) > 0.5 ? "medium" : "low"
      });
    }
  }
  return conditions;
}

function getDefaultNextSteps(): NextStep[] {
  return [{
    type: 'consult',
    title: 'Consult Healthcare Provider',
    description: 'Since we cannot make a confident prediction, please consult a qualified healthcare provider.',
    suggestions: ['Schedule an appointment with your primary care physician',
                 'Document your symptoms and their duration',
                 'Note any factors that worsen or improve the symptoms']
  }];
}

async function getKnowledgeBaseAnalysis(input: AnalysisInput) {
  const conditions = await knowledgeBase.getAllConditions();
  const matchedConditions = [];

  for (const condition of conditions) {
    const score = await knowledgeBase.calculateSymptomAssociation(
      condition.name,
      extractSymptoms(input.description)
    );

    if (score > 0.3) {
      matchedConditions.push({
        name: condition.name,
        description: condition.description,
        relevance: score > 0.7 ? "high" : score > 0.5 ? "medium" : "low",
        symptoms: condition.symptoms || [],
        score,
        urgency: determineUrgency(condition, score),
        recommendation: condition.recommendation
      });
    }
  }

  return matchedConditions;
}

function determineUrgency(condition: any, score: number): string {
  const severeSymptoms = ['severe pain', 'difficulty breathing', 'chest pain', 'unconscious'];
  const hasSevereSymptoms = severeSymptoms.some(s => 
    condition.symptoms?.some((cs: string) => cs.toLowerCase().includes(s))
  );
  
  if (hasSevereSymptoms && score > 0.6) return 'high';
  if (score > 0.7) return 'medium';
  return 'low';
}

function extractSymptoms(description: string): string[] {
  const commonSymptoms = [
    'pain', 'ache', 'fever', 'cough', 'fatigue', 'nausea',
    'headache', 'dizziness', 'weakness', 'swelling'
  ];
  
  return description.toLowerCase()
    .split(/[.,\s]+/)
    .filter(word => commonSymptoms.some(s => word.includes(s)));
}

function determineNextSteps(conditions: PotentialCondition[]): NextStep[] {
  const highestUrgency = conditions[0]?.urgency || 'low';
  
  const steps: NextStep[] = [{
    type: 'consult',
    title: 'Consult with a healthcare professional',
    description: highestUrgency === 'high' 
      ? 'Seek immediate medical attention'
      : 'Schedule an appointment with your healthcare provider',
    suggestions: getConsultSuggestions(highestUrgency)
  }];

  return steps;
}

function getDefaultResponse(input: AnalysisInput): SymptomAnalysis {
  return {
    potentialConditions: [{
      name: "General Health Concern",
      description: "Unable to determine specific condition. Please consult a healthcare provider.",
      relevance: "medium",
      symptoms: extractSymptoms(input.description),
      score: 0.5,
      urgency: "medium",
      recommendation: "Consult a healthcare provider for proper evaluation"
    }],
    nextSteps: getDefaultNextSteps(),
    disclaimer: "This information is for educational purposes only and should not replace professional medical advice.",
    extractedTextualSymptoms: extractSymptoms(input.description),
    userInputText: input.description
  };
}
