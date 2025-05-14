import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { SymptomAnalysis, PotentialCondition, NextStep } from "@shared/schema";
import { knowledgeBase } from './knowledgeBase';

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// The model to use - Gemini-1.5-pro is their most capable model
const MODEL_NAME = "gemini-1.5-pro";

// Define the input structure
interface AnalysisInput {
  description: string;
  duration?: string;
  severity?: string;
  bodyLocation?: string;
  images?: string[];
}

/**
 * Extract symptom keywords from a text description
 */
function extractSymptoms(description: string): string[] {
  const commonSymptoms = [
    'pain', 'ache', 'fever', 'cough', 'fatigue', 'nausea',
    'headache', 'dizziness', 'weakness', 'swelling'
  ];
  
  return description.toLowerCase()
    .split(/[.,\s]+/)
    .filter(word => commonSymptoms.some(s => word.includes(s)));
}

/**
 * Determine the urgency level of a condition based on symptoms and score
 */
function determineUrgency(condition: any, score: number): string {
  const severeSymptoms = ['severe pain', 'difficulty breathing', 'chest pain', 'unconscious'];
  const hasSevereSymptoms = severeSymptoms.some(s => 
    condition.symptoms?.some((cs: string) => cs.toLowerCase().includes(s))
  );
  
  if (hasSevereSymptoms && score > 0.6) return 'high';
  if (score > 0.7) return 'medium';
  return 'low';
}

/**
 * Get default next steps when other methods fail
 */
function getDefaultNextSteps(): NextStep[] {
  return [
    {
      type: 'consult',
      title: 'Consult Healthcare Provider',
      description: 'Since we cannot make a confident prediction, please consult a qualified healthcare provider.',
      suggestions: [
        'Schedule an appointment with your primary care physician',
        'Document your symptoms and their duration',
        'Note any factors that worsen or improve the symptoms'
      ]
    },
    {
      type: 'general',
      title: 'General Self-Care',
      description: 'While waiting to see a healthcare provider, consider these general measures:',
      suggestions: [
        'Rest and avoid strenuous activities',
        'Stay hydrated by drinking plenty of fluids',
        'Monitor your symptoms and note any changes'
      ]
    }
  ];
}

/**
 * Get default next steps with urgency-specific recommendations
 */
function getDefaultNextStepsWithUrgency(urgency: string): NextStep[] {
  // Generate consultation suggestions based on urgency
  const consultSuggestions = {
    high: [
      'Seek immediate medical attention or go to the nearest emergency room',
      'If applicable, call emergency services',
      'Have someone accompany you if possible'
    ],
    medium: [
      'Schedule an appointment with your healthcare provider within the next few days',
      'Prepare a list of your symptoms, their onset, and evolution',
      'Bring a list of any medications you are currently taking'
    ],
    low: [
      'Schedule a routine appointment with your healthcare provider',
      'Keep a symptom journal to track changes',
      'Prepare questions about your symptoms to ask during your appointment'
    ]
  };
  
  // Use the appropriate suggestions based on urgency
  const urgencyLevel = urgency === 'high' ? 'high' : urgency === 'medium' ? 'medium' : 'low';
  
  return [
    {
      type: 'consult',
      title: 'Consult with a healthcare professional',
      description: urgencyLevel === 'high' 
        ? 'Seek immediate medical attention' 
        : 'Schedule an appointment with your healthcare provider',
      suggestions: consultSuggestions[urgencyLevel as keyof typeof consultSuggestions]
    },
    {
      type: 'general',
      title: 'General self-care recommendations',
      description: 'While waiting for professional consultation, consider these general self-care measures:',
      suggestions: [
        'Rest and avoid strenuous activities',
        'Stay hydrated by drinking plenty of fluids',
        'Monitor your symptoms and note any changes',
        'Avoid self-medication without professional guidance'
      ]
    }
  ];
}

/**
 * Get default response when analysis fails
 */
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

/**
 * Analyzes text with Gemini to determine possible conditions
 */
async function getGeminiAnalysis(description: string) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("Gemini API key not found, skipping AI analysis");
      return [];
    }

    // Configure the generative model
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });
    
    const prompt = `
      As a medical education AI, analyze the following symptoms and determine the most likely conditions based on medical knowledge.
      
      Symptoms description: ${description}
      
      Return the analysis in JSON format as an array of possible conditions with the following structure:
      [
        {
          "name": "Condition Name",
          "description": "Brief description of the condition",
          "relevance": "high/medium/low", 
          "score": 0.0-1.0,
          "symptoms": ["key symptom 1", "key symptom 2"]
        }
      ]
      
      Include only up to 5 of the most relevant conditions. The score should represent how confident you are in this assessment.
      
      IMPORTANT: Only respond with the JSON array and nothing else. Do not add any markdown formatting, extra explanation, or other text.
    `;
    
    const systemPrompt = "You are a medical education assistant providing information about possible conditions based on symptoms. You only provide educational information, not medical advice or diagnosis. Always respond in properly formatted JSON.";
    
    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "I understand. I'll provide educational information about possible conditions based on symptoms in JSON format without giving medical advice." }] },
        { role: "user", parts: [{ text: prompt }] }
      ],
    });

    const response = result.response;
    const responseText = response.text().trim();
    
    try {
      // Clean up response text to ensure it's valid JSON
      let jsonText = responseText;
      // Remove markdown code blocks if present
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/```json\s*/, "").replace(/\s*```\s*$/, "");
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/```\s*/, "").replace(/\s*```\s*$/, "");
      }
      
      const jsonResponse = JSON.parse(jsonText);
      if (Array.isArray(jsonResponse)) {
        return jsonResponse;
      } else if (jsonResponse && Array.isArray(jsonResponse.conditions)) {
        return jsonResponse.conditions;
      } else {
        console.warn("Unexpected Gemini response format:", jsonResponse);
        return [];
      }
    } catch (error) {
      console.error("Failed to parse Gemini response:", error);
      console.error("Raw response:", responseText);
      return [];
    }
  } catch (error) {
    console.error("Error in Gemini analysis:", error);
    return [];
  }
}

/**
 * Get condition predictions from the knowledge base
 */
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

/**
 * Merge predictions from multiple sources
 */
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

/**
 * Generates next steps based on the potential conditions
 */
async function generateNextSteps(input: AnalysisInput, conditions: PotentialCondition[]): Promise<NextStep[]> {
  try {
    if (!process.env.GEMINI_API_KEY || conditions.length === 0) {
      return getDefaultNextSteps();
    }
    
    const highestUrgency = conditions[0]?.urgency || 'low';
    
    // Configure the generative model
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });
    
    // Use Gemini to generate personalized next steps
    const prompt = `
      Based on the following patient information and potential conditions, suggest appropriate next steps.
      Format your response as JSON with an array of objects, each containing type ('consult' or 'general'), title, description, and suggestions array.
      
      Patient's symptoms: ${input.description}
      ${input.duration ? `Duration: ${input.duration}` : ''}
      ${input.severity ? `Severity: ${input.severity}` : ''}
      ${input.bodyLocation ? `Body location: ${input.bodyLocation}` : ''}
      
      Top potential conditions:
      ${conditions.slice(0, 3).map((condition, index) => `
        ${index + 1}. ${condition.name} (${condition.relevance} relevance)
        - Description: ${condition.description}
        - Key symptoms: ${condition.symptoms.slice(0, 5).join(", ")}
        - Urgency: ${condition.urgency || 'medium'}
      `).join('\n')}
      
      Provide next steps in this JSON format:
      [
        {
          "type": "consult",
          "title": "Consult with a healthcare professional",
          "description": "Based on your symptoms, it's recommended to...",
          "suggestions": ["Specific action 1", "Specific action 2"]
        },
        {
          "type": "general",
          "title": "Self-care recommendations",
          "description": "While waiting for professional consultation...",
          "suggestions": ["Specific recommendation 1", "Specific recommendation 2"]
        }
      ]
      
      Include at least two next steps - one for consultation and one for general self-care.
      
      IMPORTANT: Only respond with the JSON array and nothing else. Do not add any markdown formatting, extra explanation, or other text.
    `;
    
    const systemPrompt = "You are a medical education assistant providing guidance based on symptom analysis. You provide educational information only, not medical advice. Always respond in properly formatted JSON.";
    
    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "I understand. I'll provide educational guidance based on symptom analysis in JSON format without giving medical advice." }] },
        { role: "user", parts: [{ text: prompt }] }
      ],
    });
    
    const response = result.response;
    const content = response.text().trim();
    
    try {
      // Clean up response text to ensure it's valid JSON
      let jsonText = content;
      // Remove markdown code blocks if present
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/```json\s*/, "").replace(/\s*```\s*$/, "");
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/```\s*/, "").replace(/\s*```\s*$/, "");
      }
      
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed)) {
        return parsed;
      } else if (parsed && Array.isArray(parsed.nextSteps)) {
        return parsed.nextSteps;
      } else {
        console.warn("Unexpected Gemini response format for next steps:", parsed);
        return getDefaultNextStepsWithUrgency(highestUrgency);
      }
    } catch (error) {
      console.error("Error parsing Gemini response for next steps:", error);
      console.error("Raw response:", content);
      return getDefaultNextStepsWithUrgency(highestUrgency);
    }
  } catch (error) {
    console.error("Error generating next steps with Gemini:", error);
    return getDefaultNextSteps();
  }
}

/**
 * Main function to analyze symptoms using multimodal AI and knowledge base
 */
export async function analyzeSymptoms(input: AnalysisInput): Promise<SymptomAnalysis> {
  try {
    // Combine all input data into a comprehensive prompt
    const fullDescription = `
      Symptoms: ${input.description}
      ${input.duration ? `Duration: ${input.duration}` : ''}
      ${input.severity ? `Severity: ${input.severity}` : ''}
      ${input.bodyLocation ? `Location: ${input.bodyLocation}` : ''}
    `;

    // Get analysis from both Gemini and knowledge base
    let aiAnalysis = [];
    try {
      aiAnalysis = await getGeminiAnalysis(fullDescription);
    } catch (error) {
      console.warn("Gemini analysis failed, falling back to knowledge base:", error);
    }
    
    const kbConditions = await getKnowledgeBaseAnalysis(input);

    // Combine and rank conditions
    const combinedConditions = mergePredictions(aiAnalysis, kbConditions);

    // Generate next steps for the user
    const nextSteps = await generateNextSteps(input, combinedConditions);

    return {
      potentialConditions: combinedConditions,
      nextSteps: nextSteps,
      disclaimer: "This information is for educational purposes only and should not replace professional medical advice.",
      extractedTextualSymptoms: extractSymptoms(input.description),
      userInputText: input.description
    };
  } catch (error) {
    console.error("Error in symptom analysis:", error);
    return getDefaultResponse(input);
  }
}