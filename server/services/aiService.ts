import OpenAI from "openai";
import { textEncoder } from "./textEncoder";
import { imageEncoder } from "./imageEncoder";
import { multimodalFusion } from "./multimodalFusion";
import { reasoningEngine } from "./reasoningEngine";
import { SymptomAnalysis, PotentialCondition, NextStep } from "@shared/schema";
import path from "path";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

interface AnalysisInput {
  description: string;
  duration?: string;
  severity?: string;
  bodyLocation?: string;
  images?: string[];
}

/**
 * Multimodal AI Model for analyzing symptoms from text and images
 * This implements the architecture described in the SymptoLens specification
 */
export async function analyzeSymptoms(input: AnalysisInput): Promise<SymptomAnalysis> {
  try {
    // Step 1: Process text symptoms
    const textOutput = await textEncoder.encodeText(input.description);
    
    // Step 2: Process any images if provided
    let imageOutput = null;
    if (input.images && input.images.length > 0) {
      const imagePath = input.images[0]; // For now, just use the first image
      imageOutput = await imageEncoder.encodeImage(imagePath, input.description);
    }
    
    // Step 3: Fuse the text and image modalities
    const fusionOutput = await multimodalFusion.fuseEmbeddings(textOutput, imageOutput);
    
    // Step 4: Use the reasoning engine to analyze the symptoms
    const reasoningOutput = await reasoningEngine.processFusionOutput(fusionOutput);
    
    // Step 5: Use GPT-4o to enhance the analysis with medical context
    const enhancedAnalysis = await processWithKnowledgeBase(reasoningOutput, input);
    
    return enhancedAnalysis;
  } catch (error) {
    console.error("Error in symptom analysis:", error);
    
    // Return a fallback response
    return {
      potentialConditions: [],
      nextSteps: [
        {
          type: "general",
          title: "System Error",
          description: "An error occurred while analyzing your symptoms. Please try again later or consult with a healthcare professional directly."
        }
      ],
      disclaimer: "This information is for educational purposes only and should not replace professional medical advice."
    };
  }
}

/**
 * Constructs a detailed prompt for the AI based on the user's input
 */
function constructPrompt(input: AnalysisInput): string {
  let prompt = `Analyze the following medical symptoms and provide insights:

Patient's description: ${input.description}
`;

  if (input.duration) {
    prompt += `Duration: ${input.duration}\n`;
  }
  
  if (input.severity) {
    prompt += `Severity: ${input.severity}\n`;
  }
  
  if (input.bodyLocation) {
    prompt += `Body location: ${input.bodyLocation}\n`;
  }
  
  if (input.images && input.images.length > 0) {
    prompt += `The patient has also provided ${input.images.length} image(s) of their condition.\n`;
  }
  
  prompt += `
Based on these symptoms, please:
1. Analyze the most likely conditions
2. Explain why these conditions match the symptoms
3. Suggest next steps for the patient
4. Include any relevant medical advice

Remember that this analysis is for educational purposes only and does not constitute medical advice.`;

  return prompt;
}

/**
 * Processes the AI analysis through the Knowledge Base Reasoning Engine
 * This implements the architecture described in the SymptoLens specification
 */
async function processWithKnowledgeBase(
  reasoningOutput: any,
  input: AnalysisInput
): Promise<SymptomAnalysis> {
  // Extract information from the reasoning output
  const { conditions, summary, textSymptoms } = reasoningOutput;
  
  // Prepare the conditions for the final output
  const potentialConditions: PotentialCondition[] = conditions.map((condition: any) => ({
    name: condition.name,
    description: condition.description,
    relevance: condition.relevance,
    symptoms: condition.symptoms,
    visualCues: condition.visualCues || [],
    score: condition.score,
    urgency: condition.urgency,
    recommendation: condition.recommendation,
    reasoningNotes: condition.reasoningNotes
  }));
  
  // Use GPT-4o to generate personalized next steps
  const nextSteps = await generateNextSteps(input, potentialConditions);
  
  // Prepare the final analysis
  const analysis: SymptomAnalysis = {
    potentialConditions,
    nextSteps,
    disclaimer: "This information is for educational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider for diagnosis and treatment.",
    extractedTextualSymptoms: textSymptoms,
    userInputText: input.description
  };
  
  return analysis;
}

/**
 * Uses GPT-4o to generate personalized next steps based on the analysis
 */
async function generateNextSteps(
  input: AnalysisInput,
  conditions: PotentialCondition[]
): Promise<NextStep[]> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OpenAI API key not found, using default next steps");
      return getDefaultNextSteps();
    }
    
    // Construct prompt for GPT-4o
    let prompt = `Based on the following patient information and potential conditions, suggest appropriate next steps. 
    Format your response as JSON with an array of next steps objects, each containing type ('consult' or 'general'), title, description, and suggestions array.

Patient's symptoms: ${input.description}
`;

    if (input.duration) prompt += `Duration: ${input.duration}\n`;
    if (input.severity) prompt += `Severity: ${input.severity}\n`;
    if (input.bodyLocation) prompt += `Body location: ${input.bodyLocation}\n`;
    
    // Add top 3 potential conditions
    const topConditions = conditions.slice(0, 3);
    prompt += `\nTop potential conditions:\n`;
    
    topConditions.forEach((condition, index) => {
      prompt += `${index + 1}. ${condition.name} (${condition.relevance} relevance)
   - Description: ${condition.description}
   - Key symptoms: ${condition.symptoms.slice(0, 5).join(", ")}
   - Urgency: ${condition.urgency || 'medium'}
`;
    });
    
    prompt += `\nPlease provide next steps in this JSON format:
[
  {
    "type": "consult",
    "title": "Consult with healthcare professional",
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

Ensure your response contains at least two next steps - one for consultation and one for general self-care. Include specific, actionable suggestions.`;

    // Make API call to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a medical education assistant providing guidance based on symptom analysis. Provide educational information only, not medical advice." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the JSON response
    const content = response.choices[0].message.content;
    let parsedNextSteps: NextStep[] = [];
    
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        parsedNextSteps = parsed;
      } else if (parsed && Array.isArray(parsed.nextSteps)) {
        parsedNextSteps = parsed.nextSteps;
      } else {
        console.warn("Unexpected response format from OpenAI", content);
        parsedNextSteps = getDefaultNextSteps();
      }
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      parsedNextSteps = getDefaultNextSteps();
    }
    
    return parsedNextSteps;
  } catch (error) {
    console.error("Error generating next steps with OpenAI:", error);
    return getDefaultNextSteps();
  }
}

/**
 * Returns default next steps when OpenAI is unavailable
 */
function getDefaultNextSteps(): NextStep[] {
  return [
    {
      type: "consult",
      title: "Consult with a healthcare professional",
      description: "Based on your symptoms, it's recommended to speak with a healthcare provider for proper evaluation and diagnosis.",
      suggestions: [
        "Schedule an appointment with your primary care physician",
        "Consider urgent care if symptoms are severe or worsening",
        "Prepare a list of your symptoms, their duration, and severity to share with your doctor"
      ]
    },
    {
      type: "general",
      title: "General self-care recommendations",
      description: "While waiting for professional consultation, consider these general self-care measures:",
      suggestions: [
        "Rest and avoid strenuous activities",
        "Stay hydrated by drinking plenty of fluids",
        "Monitor your symptoms and note any changes",
        "Avoid self-medication without professional guidance"
      ]
    }
  ];
}