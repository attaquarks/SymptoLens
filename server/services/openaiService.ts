import OpenAI from "openai";
import { ChatCompletionContentPart } from "openai/resources/chat/completions";

// Initialize OpenAI client
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Analyze text symptoms using OpenAI GPT-4o
 */
export async function analyzeTextSymptoms(prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a medical AI assistant specializing in symptom analysis. Based on the description provided, analyze the possible conditions and next steps. Return your analysis in a structured JSON format without any additional text. Focus on accuracy with strong medical backing."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });
    
    return response.choices[0].message.content || "{}";
  } catch (error) {
    console.error("Error analyzing text symptoms:", error);
    throw new Error("Failed to analyze symptoms text. Please try again later.");
  }
}

/**
 * Analyze symptom images using OpenAI GPT-4o Vision capabilities
 */
export async function analyzeSymptomImages(prompt: string, imageUrls: string[]): Promise<string> {
  try {
    // Create content array with text prompt and images
    const content: ChatCompletionContentPart[] = [
      {
        type: "text",
        text: prompt
      }
    ];
    
    // Add images to content array
    imageUrls.forEach(imageUrl => {
      content.push({
        type: "image_url",
        image_url: {
          url: imageUrl
        }
      });
    });
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a medical AI assistant specializing in visual symptom analysis. Analyze the images of symptoms provided along with the description. Return your analysis in a structured JSON format without any additional text. Focus on visual characteristics that might indicate specific conditions."
        },
        {
          role: "user",
          content: content
        }
      ],
      response_format: { type: "json_object" }
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error analyzing symptom images:", error);
    throw new Error("Failed to analyze symptom images. Please try again later.");
  }
}

/**
 * Perform multimodal analysis of both text and images
 */
export async function performMultimodalAnalysis(
  textPrompt: string, 
  imageUrls: string[]
): Promise<string> {
  try {
    // If no images, just do text analysis
    if (!imageUrls || imageUrls.length === 0) {
      return await analyzeTextSymptoms(textPrompt);
    }
    
    // Create content array with text prompt and images for multimodal analysis
    const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
      {
        type: "text",
        text: textPrompt
      }
    ];
    
    // Add images to content array
    imageUrls.forEach(imageUrl => {
      content.push({
        type: "image_url",
        image_url: {
          url: imageUrl
        }
      });
    });
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a medical AI assistant that performs multimodal symptom analysis using both text descriptions and images. 
          
          Analyze the symptoms described in text and shown in the images to provide a comprehensive analysis. Consider both the textual and visual information together as a unified presentation.
          
          Return your analysis in JSON format with the following structure:
          {
            "potentialConditions": [
              {
                "name": "Condition name",
                "description": "Brief description of the condition",
                "relevance": "low|medium|high",
                "symptoms": ["list", "of", "matching", "symptoms"],
                "learnMoreUrl": "optional URL to learn more"
              }
            ],
            "textSymptoms": ["list", "of", "symptoms", "identified", "in", "text"],
            "visualSymptoms": ["list", "of", "symptoms", "identified", "in", "images"],
            "integrationNotes": "Optional notes about how the text and visual symptoms relate to each other"
          }`
        },
        {
          role: "user",
          content: content
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error performing multimodal analysis:", error);
    throw new Error("Failed to perform multimodal analysis. Please try again later.");
  }
}