import fetch from 'node-fetch';
import { SymptomAnalysis, PotentialCondition, NextStep } from "@shared/schema";

interface AnalysisInput {
  description: string;
  duration?: string;
  severity?: string;
  bodyLocation?: string;
  images?: string[];
}

const HUGGING_FACE_API = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli";

export async function analyzeSymptoms(input: AnalysisInput): Promise<SymptomAnalysis> {
  try {
    // Construct analysis prompt
    const prompt = `Analyze these medical symptoms:
    Description: ${input.description}
    ${input.duration ? `Duration: ${input.duration}` : ''}
    ${input.severity ? `Severity: ${input.severity}` : ''}
    ${input.bodyLocation ? `Body Location: ${input.bodyLocation}` : ''}`;

    // Get basic analysis using Hugging Face
    const analysis = await getBasicAnalysis(prompt);

    // Return formatted response
    return {
      potentialConditions: analysis.conditions,
      nextSteps: getDefaultNextSteps(),
      disclaimer: "This information is for educational purposes only and should not replace professional medical advice.",
      extractedTextualSymptoms: analysis.symptoms,
      userInputText: input.description
    };
  } catch (error) {
    console.error("Error in symptom analysis:", error);
    return {
      potentialConditions: [],
      nextSteps: getDefaultNextSteps(),
      disclaimer: "This information is for educational purposes only and should not replace professional medical advice.",
      extractedTextualSymptoms: [],
      userInputText: input.description
    };
  }
}

async function getBasicAnalysis(prompt: string) {
  // Use a simpler rule-based approach for demo
  const commonConditions = [
    { name: "Common Cold", symptoms: ["runny nose", "cough", "sore throat"] },
    { name: "Allergies", symptoms: ["sneezing", "itchy eyes", "congestion"] },
    { name: "Flu", symptoms: ["fever", "body aches", "fatigue"] }
  ];

  const matchedConditions = commonConditions
    .filter(condition => 
      condition.symptoms.some(symptom => 
        prompt.toLowerCase().includes(symptom)
      )
    )
    .map(condition => ({
      name: condition.name,
      description: `Common symptoms include: ${condition.symptoms.join(", ")}`,
      relevance: "medium",
      symptoms: condition.symptoms,
      score: 0.8,
      urgency: "low",
      recommendation: "Monitor symptoms and rest",
      reasoningNotes: "Based on symptom matching"
    }));

  return {
    conditions: matchedConditions.length > 0 ? matchedConditions : [{
      name: "Unspecified Condition",
      description: "Unable to determine specific condition",
      relevance: "low",
      symptoms: [],
      score: 0.5,
      urgency: "medium",
      recommendation: "Consult a healthcare provider",
      reasoningNotes: "Insufficient information"
    }],
    symptoms: prompt.toLowerCase()
      .split(" ")
      .filter(word => 
        ["pain", "ache", "fever", "cough", "fatigue"].includes(word)
      )
  };
}

function getDefaultNextSteps(): NextStep[] {
  return [
    {
      type: "consult",
      title: "Consult with a healthcare professional",
      description: "Based on your symptoms, it's recommended to speak with a healthcare provider for proper evaluation.",
      suggestions: [
        "Schedule an appointment with your primary care physician",
        "Consider urgent care if symptoms are severe",
        "Prepare a list of your symptoms and their duration"
      ]
    },
    {
      type: "general",
      title: "Self-care recommendations",
      description: "While waiting for professional consultation, consider these general measures:",
      suggestions: [
        "Rest and avoid strenuous activities",
        "Stay hydrated",
        "Monitor your symptoms",
        "Avoid self-medication without professional guidance"
      ]
    }
  ];
}