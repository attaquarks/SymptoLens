import { PotentialCondition, NextStep } from "@shared/schema";

/**
 * Knowledge Base Reasoning Engine for SymptoLens
 * 
 * This implements the Knowledge Base component described in the SymptoLens specification.
 * It provides medical context, validation, and reasoning capabilities to ensure the
 * AI model's predictions are grounded in established medical knowledge.
 */
class KnowledgeBase {
  private medicalConditions: Record<string, MedicalCondition>;
  private symptomAssociations: Record<string, string[]>;
  private bodyLocationConditions: Record<string, string[]>;
  
  constructor() {
    // Initialize the medical knowledge structures
    this.medicalConditions = this.loadMedicalConditions();
    this.symptomAssociations = this.loadSymptomAssociations();
    this.bodyLocationConditions = this.loadBodyLocationConditions();
  }
  
  /**
   * Enhances and validates the AI's analysis using structured medical knowledge
   */
  async enhanceAnalysis(
    aiConditions: PotentialCondition[],
    context: {
      description: string;
      duration?: string;
      severity?: string;
      bodyLocation?: string;
      hasImages: boolean;
    }
  ): Promise<PotentialCondition[]> {
    // Create a copy of the AI conditions to enhance
    const enhancedConditions = [...aiConditions];
    
    // Extract key symptoms from description for knowledge matching
    const keySymptoms = this.extractKeySymptoms(context.description);
    
    // Process each condition through the knowledge base
    for (let i = 0; i < enhancedConditions.length; i++) {
      const condition = enhancedConditions[i];
      
      // Look up the condition in our knowledge base
      const knownCondition = this.medicalConditions[condition.name.toLowerCase()];
      
      if (knownCondition) {
        // Enhance with structured information from our knowledge base
        condition.description = knownCondition.description || condition.description;
        
        // Add any additional symptoms known to be associated but not mentioned
        condition.symptoms = this.mergeArrays(
          condition.symptoms, 
          knownCondition.commonSymptoms.filter(s => !condition.symptoms.includes(s))
        );
        
        // Add or update learn more URL if available
        if (knownCondition.learnMoreUrl) {
          condition.learnMoreUrl = knownCondition.learnMoreUrl;
        }
        
        // Validate relevance based on symptom matching
        const relevanceScore = this.calculateRelevanceScore(
          keySymptoms,
          knownCondition.commonSymptoms,
          context.bodyLocation,
          knownCondition.bodyLocations
        );
        
        // Update relevance if the knowledge base suggests a different level
        // This could override the AI's assessment based on medical knowledge
        if (relevanceScore >= 0.7) {
          condition.relevance = "high";
        } else if (relevanceScore >= 0.4) {
          condition.relevance = "medium";
        } else {
          condition.relevance = "low";
        }
      }
    }
    
    // Check if we should add any conditions that the AI might have missed
    // but are strongly associated with the symptoms in our knowledge base
    await this.addMissingConditions(
      enhancedConditions,
      keySymptoms,
      context.bodyLocation
    );
    
    // Sort conditions by relevance
    return this.sortByRelevance(enhancedConditions);
  }
  
  /**
   * Generates recommended next steps based on the enhanced analysis
   */
  async getRecommendedNextSteps(
    conditions: PotentialCondition[],
    bodyLocation?: string
  ): Promise<NextStep[]> {
    const nextSteps: NextStep[] = [];
    const highRelevanceConditions = conditions.filter(c => c.relevance === "high");
    
    // Determine if urgent consultation is needed
    const needsUrgentCare = this.needsUrgentCare(conditions);
    
    // Consultation recommendation
    if (needsUrgentCare) {
      nextSteps.push({
        type: "consult",
        title: "Seek Prompt Medical Attention",
        description: "Based on your symptoms, we recommend seeking medical attention promptly. Some of the potential conditions associated with your symptoms may require timely evaluation."
      });
    } else {
      nextSteps.push({
        type: "consult",
        title: "Consult a Healthcare Provider",
        description: bodyLocation 
          ? `Based on your symptoms in the ${bodyLocation} area, we recommend consulting with a healthcare professional for proper evaluation and treatment.`
          : 'Based on your symptoms, we recommend consulting with a healthcare professional for proper evaluation and treatment.'
      });
    }
    
    // Add specialist recommendation if applicable
    const specialistType = this.determineSpecialistType(conditions, bodyLocation);
    if (specialistType) {
      nextSteps.push({
        type: "consult",
        title: `Consider Consulting a ${specialistType}`,
        description: `Based on your symptoms, a ${specialistType.toLowerCase()} may be able to provide specialized care for your condition.`
      });
    }
    
    // General care suggestions
    nextSteps.push({
      type: "general",
      title: "General Care Suggestions",
      description: "Consider these general care tips while you wait to see a healthcare provider:",
      suggestions: [
        "Get adequate rest and stay hydrated",
        "Avoid potential triggers or irritants",
        "Monitor your symptoms and note any changes",
        "Prepare a list of your symptoms, their duration, and severity for your doctor"
      ]
    });
    
    // Condition-specific suggestions
    if (highRelevanceConditions.length > 0) {
      const conditionCare = this.getConditionSpecificCare(highRelevanceConditions);
      if (conditionCare.suggestions && conditionCare.suggestions.length > 0) {
        nextSteps.push({
          type: "general",
          title: "Condition-Specific Considerations",
          description: "These suggestions may be helpful based on the potential conditions identified:",
          suggestions: conditionCare.suggestions
        });
      }
    }
    
    return nextSteps;
  }
  
  /**
   * Extracts key symptoms from the user's description
   */
  private extractKeySymptoms(description: string): string[] {
    // In a production system, this would use NLP to extract medical entities
    // For our implementation, we'll use a basic keyword approach
    const lowerDesc = description.toLowerCase();
    
    // Common symptoms to look for
    const commonSymptoms = [
      "pain", "ache", "fatigue", "fever", "cough", "headache", 
      "rash", "nausea", "dizziness", "swelling", "inflammation",
      "itching", "sore throat", "shortness of breath", "chest pain"
    ];
    
    return commonSymptoms.filter(symptom => lowerDesc.includes(symptom));
  }
  
  /**
   * Calculates a relevance score based on symptom matching with knowledge base
   */
  private calculateRelevanceScore(
    userSymptoms: string[],
    conditionSymptoms: string[],
    bodyLocation?: string,
    conditionLocations?: string[]
  ): number {
    if (userSymptoms.length === 0) return 0;
    
    // Count matching symptoms
    const matchingSymptoms = userSymptoms.filter(s => 
      conditionSymptoms.some(cs => cs.toLowerCase().includes(s.toLowerCase()))
    );
    
    // Calculate base score from symptom matches
    let score = matchingSymptoms.length / userSymptoms.length;
    
    // Boost score if body location matches
    if (bodyLocation && conditionLocations && conditionLocations.includes(bodyLocation)) {
      score += 0.2; // Boost for correct body location
    }
    
    // Cap at 1.0
    return Math.min(score, 1.0);
  }
  
  /**
   * Adds conditions from knowledge base that might be relevant but were missed by the AI
   */
  private async addMissingConditions(
    conditions: PotentialCondition[],
    symptoms: string[],
    bodyLocation?: string
  ): Promise<void> {
    // Get existing condition names for comparison
    const existingNames = conditions.map(c => c.name.toLowerCase());
    
    // Check body location related conditions first
    if (bodyLocation && this.bodyLocationConditions[bodyLocation]) {
      const locConditions = this.bodyLocationConditions[bodyLocation];
      
      for (const condName of locConditions) {
        if (!existingNames.includes(condName.toLowerCase())) {
          const cond = this.medicalConditions[condName.toLowerCase()];
          if (cond) {
            // Calculate relevance with our knowledge base
            const relevanceScore = this.calculateRelevanceScore(
              symptoms,
              cond.commonSymptoms,
              bodyLocation,
              cond.bodyLocations
            );
            
            // Only add if reasonably relevant
            if (relevanceScore >= 0.4) {
              conditions.push({
                name: condName,
                description: cond.description,
                relevance: relevanceScore >= 0.7 ? "high" : "medium",
                symptoms: cond.commonSymptoms,
                learnMoreUrl: cond.learnMoreUrl
              });
            }
          }
        }
      }
    }
    
    // Then check symptom associations
    for (const symptom of symptoms) {
      if (this.symptomAssociations[symptom]) {
        for (const condName of this.symptomAssociations[symptom]) {
          if (!existingNames.includes(condName.toLowerCase())) {
            const cond = this.medicalConditions[condName.toLowerCase()];
            if (cond) {
              // Calculate relevance with our knowledge base
              const relevanceScore = this.calculateRelevanceScore(
                symptoms,
                cond.commonSymptoms,
                bodyLocation,
                cond.bodyLocations
              );
              
              // Only add if reasonably relevant
              if (relevanceScore >= 0.5) {
                conditions.push({
                  name: condName,
                  description: cond.description,
                  relevance: relevanceScore >= 0.7 ? "high" : "medium",
                  symptoms: cond.commonSymptoms,
                  learnMoreUrl: cond.learnMoreUrl
                });
              }
            }
          }
        }
      }
    }
  }
  
  /**
   * Sorts conditions by relevance level
   */
  private sortByRelevance(conditions: PotentialCondition[]): PotentialCondition[] {
    const relevanceOrder: Record<string, number> = {
      "high": 3,
      "medium": 2,
      "low": 1
    };
    
    return [...conditions].sort((a, b) => 
      relevanceOrder[b.relevance] - relevanceOrder[a.relevance]
    );
  }
  
  /**
   * Determines if urgent care is needed based on conditions
   */
  private needsUrgentCare(conditions: PotentialCondition[]): boolean {
    // Check if any high-relevance conditions are urgent
    const urgentConditions = [
      "appendicitis", "meningitis", "stroke", "heart attack", "pulmonary embolism",
      "anaphylaxis", "severe dehydration", "sepsis"
    ];
    
    return conditions.some(c => 
      c.relevance === "high" && 
      urgentConditions.some(uc => c.name.toLowerCase().includes(uc.toLowerCase()))
    );
  }
  
  /**
   * Determines what type of specialist might be appropriate
   */
  private determineSpecialistType(
    conditions: PotentialCondition[],
    bodyLocation?: string
  ): string | null {
    if (!bodyLocation) return null;
    
    const locationSpecialistMap: Record<string, string> = {
      "skin": "Dermatologist",
      "head": "Neurologist",
      "chest": "Cardiologist or Pulmonologist",
      "abdomen": "Gastroenterologist",
      "back": "Orthopedist or Rheumatologist",
      "joints": "Rheumatologist",
      "eyes": "Ophthalmologist",
      "ears": "Otolaryngologist (ENT)",
      "throat": "Otolaryngologist (ENT)"
    };
    
    return locationSpecialistMap[bodyLocation] || null;
  }
  
  /**
   * Gets condition-specific care suggestions
   */
  private getConditionSpecificCare(conditions: PotentialCondition[]): {
    suggestions: string[];
  } {
    const suggestions: string[] = [];
    
    // Add specific suggestions based on condition types
    const conditionTypes = new Set(conditions.map(c => this.categorizeCondition(c.name)));
    
    if (conditionTypes.has("dermatological")) {
      suggestions.push("Avoid scratching affected skin areas");
      suggestions.push("Use gentle, fragrance-free products on skin");
    }
    
    if (conditionTypes.has("respiratory")) {
      suggestions.push("Stay in a well-ventilated area");
      suggestions.push("Use a humidifier if air is dry");
      suggestions.push("Avoid smoke and other respiratory irritants");
    }
    
    if (conditionTypes.has("gastrointestinal")) {
      suggestions.push("Eat smaller, more frequent meals");
      suggestions.push("Stay hydrated with clear fluids");
      suggestions.push("Avoid spicy, greasy, or irritating foods");
    }
    
    if (conditionTypes.has("musculoskeletal")) {
      suggestions.push("Apply ice to reduce inflammation");
      suggestions.push("Rest the affected area but maintain gentle movement as tolerated");
      suggestions.push("Consider over-the-counter pain relievers (following package directions)");
    }
    
    // Limit to 5 suggestions maximum
    return { suggestions: suggestions.slice(0, 5) };
  }
  
  /**
   * Categorizes a condition into a general type
   */
  private categorizeCondition(conditionName: string): string {
    const lowerName = conditionName.toLowerCase();
    
    if (lowerName.includes("rash") || lowerName.includes("dermatitis") || 
        lowerName.includes("eczema") || lowerName.includes("acne")) {
      return "dermatological";
    }
    
    if (lowerName.includes("cough") || lowerName.includes("asthma") || 
        lowerName.includes("pneumonia") || lowerName.includes("bronchitis")) {
      return "respiratory";
    }
    
    if (lowerName.includes("stomach") || lowerName.includes("intestinal") || 
        lowerName.includes("gastritis") || lowerName.includes("colitis")) {
      return "gastrointestinal";
    }
    
    if (lowerName.includes("sprain") || lowerName.includes("strain") || 
        lowerName.includes("arthritis") || lowerName.includes("tendonitis")) {
      return "musculoskeletal";
    }
    
    return "general";
  }
  
  /**
   * Combines arrays without duplicates
   */
  private mergeArrays<T>(arr1: T[], arr2: T[]): T[] {
    const set = new Set<T>();
    arr1.forEach(item => set.add(item));
    arr2.forEach(item => set.add(item));
    return Array.from(set);
  }
  
  /**
   * Loads the medical conditions database
   * In a production system, this would connect to a proper medical database
   */
  private loadMedicalConditions(): Record<string, MedicalCondition> {
    // This is a simplified knowledge base with a few common conditions
    return {
      "common cold": {
        description: "A viral infection of the upper respiratory tract that primarily affects the nose and throat. It's usually harmless and tends to resolve on its own within 7-10 days.",
        commonSymptoms: ["Runny nose", "Sore throat", "Cough", "Congestion", "Sneezing", "Mild fever", "Headache"],
        bodyLocations: ["head", "throat"],
        urgency: "low",
        learnMoreUrl: "https://www.mayoclinic.org/diseases-conditions/common-cold/symptoms-causes/syc-20351605"
      },
      "influenza": {
        description: "A viral infection that attacks your respiratory system — your nose, throat and lungs. Commonly called the flu, it's more severe than the common cold and can lead to complications.",
        commonSymptoms: ["Fever", "Chills", "Muscle aches", "Headache", "Fatigue", "Cough", "Sore throat"],
        bodyLocations: ["general", "chest", "head", "throat"],
        urgency: "medium",
        learnMoreUrl: "https://www.mayoclinic.org/diseases-conditions/flu/symptoms-causes/syc-20351719"
      },
      "migraine": {
        description: "A neurological condition characterized by intense, debilitating headaches, often accompanied by nausea, vomiting, and sensitivity to light and sound.",
        commonSymptoms: ["Throbbing headache", "Nausea", "Vomiting", "Sensitivity to light", "Sensitivity to sound", "Visual disturbances"],
        bodyLocations: ["head"],
        urgency: "medium",
        learnMoreUrl: "https://www.mayoclinic.org/diseases-conditions/migraine-headache/symptoms-causes/syc-20360201"
      },
      "tension headache": {
        description: "The most common type of headache that causes mild to moderate pain. It often feels like a tight band around the head.",
        commonSymptoms: ["Head pain", "Pressure around head", "Tenderness", "Tightness in neck or shoulders"],
        bodyLocations: ["head", "neck"],
        urgency: "low",
        learnMoreUrl: "https://www.mayoclinic.org/diseases-conditions/tension-headache/symptoms-causes/syc-20353977"
      },
      "contact dermatitis": {
        description: "An inflammatory skin condition that occurs when skin comes into contact with irritants or allergens. Common symptoms include red, itchy skin with possible bumps or blisters.",
        commonSymptoms: ["Skin rash", "Itching", "Redness", "Bumps", "Blisters", "Skin tenderness"],
        bodyLocations: ["skin"],
        urgency: "low",
        learnMoreUrl: "https://www.mayoclinic.org/diseases-conditions/contact-dermatitis/symptoms-causes/syc-20352742"
      },
      "atopic dermatitis": {
        description: "A chronic skin condition characterized by itchy, inflamed skin. Often appears on arms, neck, and flexural areas. Symptoms often worsen at night and may be triggered by various factors.",
        commonSymptoms: ["Itchy skin", "Redness", "Dry, scaly skin", "Worse at night", "Skin inflammation", "Crusting"],
        bodyLocations: ["skin"],
        urgency: "low",
        learnMoreUrl: "https://www.mayoclinic.org/diseases-conditions/atopic-dermatitis-eczema/symptoms-causes/syc-20353273"
      },
      "gastroenteritis": {
        description: "Often called stomach flu, gastroenteritis is an intestinal infection marked by diarrhea, abdominal cramps, nausea, vomiting, and sometimes fever.",
        commonSymptoms: ["Diarrhea", "Abdominal cramps", "Nausea", "Vomiting", "Low-grade fever", "Muscle aches"],
        bodyLocations: ["abdomen"],
        urgency: "medium",
        learnMoreUrl: "https://www.mayoclinic.org/diseases-conditions/viral-gastroenteritis/symptoms-causes/syc-20378847"
      },
      "sinusitis": {
        description: "Inflammation of the sinuses, often caused by a viral, bacterial, or fungal infection. It can cause facial pain, pressure, and nasal congestion.",
        commonSymptoms: ["Facial pain/pressure", "Nasal congestion", "Thick nasal discharge", "Post-nasal drip", "Headache", "Reduced sense of smell"],
        bodyLocations: ["head"],
        urgency: "low",
        learnMoreUrl: "https://www.mayoclinic.org/diseases-conditions/acute-sinusitis/symptoms-causes/syc-20351671"
      },
      "sprained ankle": {
        description: "A common injury that occurs when you roll, twist or turn your ankle in an awkward way, stretching or tearing the ligaments that help hold your ankle bones together.",
        commonSymptoms: ["Pain", "Swelling", "Bruising", "Limited mobility", "Tenderness", "Instability"],
        bodyLocations: ["legs"],
        urgency: "low",
        learnMoreUrl: "https://www.mayoclinic.org/diseases-conditions/sprained-ankle/symptoms-causes/syc-20353225"
      },
      "conjunctivitis": {
        description: "Also known as pink eye, this is inflammation or infection of the transparent membrane that lines your eyelid and covers the white part of your eyeball.",
        commonSymptoms: ["Pink or red appearance in the white of the eye", "Eye discharge", "Itching", "Burning", "Gritty feeling", "Increased tearing"],
        bodyLocations: ["eyes"],
        urgency: "low",
        learnMoreUrl: "https://www.mayoclinic.org/diseases-conditions/pink-eye/symptoms-causes/syc-20376355"
      }
    };
  }
  
  /**
   * Loads common symptom to condition associations
   * This helps the knowledge base suggest conditions based on symptoms
   */
  private loadSymptomAssociations(): Record<string, string[]> {
    return {
      "headache": ["Migraine", "Tension Headache", "Sinusitis", "Common Cold", "Influenza"],
      "fever": ["Influenza", "Common Cold", "Gastroenteritis"],
      "cough": ["Common Cold", "Influenza", "Bronchitis", "Asthma"],
      "rash": ["Contact Dermatitis", "Atopic Dermatitis", "Allergic Reaction"],
      "itching": ["Contact Dermatitis", "Atopic Dermatitis", "Allergic Reaction"],
      "pain": ["Tension Headache", "Migraine", "Sprained Ankle", "Arthritis"],
      "nausea": ["Gastroenteritis", "Migraine", "Food Poisoning"],
      "fatigue": ["Influenza", "Common Cold", "Anemia", "Depression"],
      "dizziness": ["Migraine", "Vertigo", "Low Blood Pressure"],
      "sore throat": ["Common Cold", "Influenza", "Strep Throat"]
    };
  }
  
  /**
   * Loads body location to condition associations
   * This helps the knowledge base suggest conditions based on body location
   */
  private loadBodyLocationConditions(): Record<string, string[]> {
    return {
      "head": ["Migraine", "Tension Headache", "Sinusitis"],
      "chest": ["Bronchitis", "Asthma", "Pneumonia"],
      "abdomen": ["Gastroenteritis", "Appendicitis", "Irritable Bowel Syndrome"],
      "back": ["Muscle Strain", "Herniated Disc", "Sciatica"],
      "arms": ["Tendonitis", "Arthritis", "Carpal Tunnel Syndrome"],
      "legs": ["Sprained Ankle", "Shin Splints", "Deep Vein Thrombosis"],
      "skin": ["Contact Dermatitis", "Atopic Dermatitis", "Psoriasis"],
      "throat": ["Strep Throat", "Common Cold", "Influenza"],
      "eyes": ["Conjunctivitis", "Dry Eye Syndrome", "Stye"],
      "general": ["Influenza", "Common Cold", "Allergic Reaction"]
    };
  }
}

// Define the structure for our medical conditions database
interface MedicalCondition {
  description: string;
  commonSymptoms: string[];
  bodyLocations: string[];
  urgency: "low" | "medium" | "high";
  learnMoreUrl?: string;
}

// Create and export a singleton instance
export const knowledgeBase = new KnowledgeBase();