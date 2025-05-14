import { SymptomAnalysis, PotentialCondition, NextStep } from "@shared/schema";
import { knowledgeBase } from "../services/knowledgeBase";
import { performMultimodalAnalysis } from "../services/openaiService";

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
    // Construct the message content array - always starts with the text
    const messageContent: Array<any> = [
      {
        type: "text",
        text: constructPrompt(input)
      }
    ];

    // Add images to the message content if available
    if (input.images && input.images.length > 0) {
      for (const imageUrl of input.images) {
        if (imageUrl.startsWith('data:image')) {
          // For base64 encoded images
          messageContent.push({
            type: "image_url",
            image_url: {
              url: imageUrl
            }
          });
        }
      }
    }

    // Call OpenAI's multimodal model (gpt-4o supports both text and image inputs)
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a medical analysis assistant for SymptoLens, a symptom analysis tool. Your purpose is to analyze symptoms described in text and shown in images to identify potential conditions. Your analysis should be medically informed but emphasize that you are not providing medical diagnoses. Focus on providing educational information and encouraging appropriate medical consultation."
        },
        {
          role: "user",
          content: messageContent
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    // Get the AI response
    const result = response.choices[0].message.content;
    if (!result) {
      throw new Error("Failed to get response from AI model");
    }

    // Parse the AI response
    const aiAnalysis = JSON.parse(result);

    // Process the analysis through the Knowledge Base for validation and enhancement
    return await processWithKnowledgeBase(aiAnalysis, input);
  } catch (error) {
    console.error("Error in AI analysis:", error);
    
    // Provide a fallback response in case of error
    return {
      potentialConditions: [
        {
          name: "Analysis Unavailable",
          description: "We couldn't process your symptoms at this time. This could be due to a technical issue or limitations in our current analysis capabilities.",
          relevance: "low",
          symptoms: ["Various symptoms"],
          learnMoreUrl: ""
        }
      ],
      nextSteps: [
        {
          type: "consult",
          title: "Consult a Healthcare Provider",
          description: "Since we couldn't analyze your symptoms, we recommend consulting with a healthcare professional for proper evaluation."
        },
        {
          type: "general",
          title: "Try Again Later",
          description: "You may try again later or provide more detailed information about your symptoms.",
          suggestions: [
            "Be specific about when symptoms started",
            "Describe the severity and any changes over time",
            "Mention any factors that make symptoms better or worse"
          ]
        }
      ]
    };
  }
}

/**
 * Constructs a detailed prompt for the AI based on the user's input
 */
function constructPrompt(input: AnalysisInput): string {
  let prompt = `Analyze the following symptoms:\n\nDescription: ${input.description}\n`;
  
  if (input.duration) {
    prompt += `Duration: ${input.duration}\n`;
  }
  
  if (input.severity) {
    prompt += `Severity: ${input.severity}\n`;
  }
  
  if (input.bodyLocation) {
    prompt += `Body Location: ${input.bodyLocation}\n`;
  }
  
  if (input.images && input.images.length > 0) {
    prompt += `\nI've also attached ${input.images.length} image(s) related to these symptoms for visual analysis.\n`;
  }
  
  prompt += `\nBased on both the textual description and any provided images, analyze the symptoms and provide a structured response in JSON format with:
  1. A list of potential conditions that could be related to these symptoms
  2. For each condition include: name, description, level of relevance (high, medium, low), and common symptoms
  3. Recommended next steps (consultation recommendations and general care suggestions)
  
  Use this exact JSON structure:
  {
    "potentialConditions": [
      {
        "name": "Condition Name",
        "description": "Brief description of the condition",
        "relevance": "high|medium|low",
        "symptoms": ["Symptom 1", "Symptom 2", ...],
        "learnMoreUrl": "optional URL for more information"
      }
    ],
    "nextSteps": [
      {
        "type": "consult",
        "title": "Medical consultation recommendation",
        "description": "Detailed guidance about seeking medical care"
      },
      {
        "type": "general",
        "title": "General care suggestion",
        "description": "General self-care advice",
        "suggestions": ["Specific suggestion 1", "Specific suggestion 2", ...]
      }
    ]
  }
  
  Remember to be informative but make it clear this is not a diagnosis.`;
  
  return prompt;
}

/**
 * Processes the AI analysis through the Knowledge Base Reasoning Engine
 * This implements the architecture described in the SymptoLens specification
 */
async function processWithKnowledgeBase(
  aiAnalysis: any,
  input: AnalysisInput
): Promise<SymptomAnalysis> {
  // Extract potential conditions from AI analysis
  let potentialConditions: PotentialCondition[] = aiAnalysis.potentialConditions || [];
  let nextSteps: NextStep[] = aiAnalysis.nextSteps || [];
  
  // Apply knowledge base reasoning to enhance and validate the AI's findings
  const enhancedAnalysis = await knowledgeBase.enhanceAnalysis(
    potentialConditions,
    {
      description: input.description,
      duration: input.duration,
      severity: input.severity,
      bodyLocation: input.bodyLocation,
      hasImages: input.images ? input.images.length > 0 : false
    }
  );
  
  // Enhance next steps with knowledge base recommendations
  const enhancedNextSteps = await knowledgeBase.getRecommendedNextSteps(
    enhancedAnalysis,
    input.bodyLocation
  );
  
  return {
    potentialConditions: enhancedAnalysis,
    nextSteps: enhancedNextSteps || nextSteps
  };
}