import NodeCache from 'node-cache';
import { MedicalCondition } from '@shared/schema';
import { db } from '../db';
import * as schema from '@shared/schema';

/**
 * KnowledgeBase: Structured repository of medical information
 * This module provides access to medical knowledge for validating and contextualizing
 * the AI's predictions, ensuring they are grounded in medical understanding.
 */
export class KnowledgeBase {
  private cache: NodeCache;
  private conditionsLoaded: boolean = false;
  
  constructor() {
    this.cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour
  }
  
  /**
   * Load all medical conditions from storage into the cache
   */
  private async loadConditions(): Promise<void> {
    try {
      if (!db) {
        throw new Error('Database not initialized');
      }
      
      // Fetch conditions from database
      const conditions = await db.select().from(schema.medicalConditions);
      
      if (conditions && conditions.length > 0) {
        // Store each condition in cache with name as key
        conditions.forEach((condition: MedicalCondition) => {
          this.cache.set(`condition:${condition.name.toLowerCase()}`, condition);
        });
        
        // Also store the full list for quick access
        this.cache.set('all_conditions', conditions);
        this.conditionsLoaded = true;
      } else {
        console.warn('No medical conditions found in database');
        this.conditionsLoaded = false;
      }
    } catch (error) {
      console.error('Error loading conditions from database:', error);
      this.conditionsLoaded = false;
      
      // Fall back to default conditions if database fails
      this.loadDefaultConditions();
    }
  }
  
  /**
   * Loads default conditions as fallback if database is unavailable
   */
  private loadDefaultConditions(): void {
    const defaultConditions = [
      {
        id: 1,
        name: "Influenza",
        description: "Influenza is a viral infection that attacks your respiratory system — your nose, throat and lungs. Commonly called the flu.",
        symptoms: ["fever", "cough", "sore throat", "body aches", "fatigue", "chills", "headache"],
        visualCues: [],
        urgency: "medium",
        recommendedActions: ["Rest", "Stay hydrated", "Take over-the-counter pain relievers"],
        symptomsRelationships: {
          required: ["fever", "fatigue"],
          commonly_together: ["fever", "body aches", "chills"],
          rarely_together: ["fever", "no respiratory symptoms"]
        }
      },
      {
        id: 4,
        name: "Migraine",
        description: "A neurological condition causing severe headaches, often with visual disturbances and nausea.",
        symptoms: ["severe headache", "nausea", "light sensitivity", "vision changes", "dizziness"],
        visualCues: ["facial pallor", "squinting"],
        urgency: "medium",
        recommendedActions: ["Rest in dark room", "Take prescribed medication"],
        symptomsRelationships: {
          required: ["severe headache"],
          commonly_together: ["light sensitivity", "nausea"],
          rarely_together: ["severe headache", "no sensitivity symptoms"]
        }
      },
      {
        id: 5,
        name: "Bronchitis",
        description: "Inflammation of the bronchial tubes that carry air to and from the lungs.",
        symptoms: ["persistent cough", "chest congestion", "fatigue", "mild fever", "shortness of breath"],
        visualCues: [],
        urgency: "medium",
        recommendedActions: ["Rest", "Use humidifier", "Stay hydrated"],
        symptomsRelationships: {
          required: ["persistent cough"],
          commonly_together: ["chest congestion", "shortness of breath"],
          rarely_together: ["persistent cough", "no respiratory symptoms"]
        }
      },
      {
        id: 2,
        name: "Common Cold",
        description: "The common cold is a viral infection of your nose and throat (upper respiratory tract).",
        symptoms: ["runny nose", "sore throat", "cough", "congestion", "sneezing", "mild body aches", "mild headache"],
        visualCues: [],
        urgency: "low",
        recommendation: "Rest, stay hydrated, and use over-the-counter remedies for symptom relief. Symptoms usually resolve within a week or two."
      },
      {
        id: 3,
        name: "Skin Allergy",
        description: "A skin allergy occurs when your skin reacts to an allergen, causing a rash or other symptoms.",
        symptoms: ["rash", "itchiness", "redness", "swelling", "bumps", "blisters"],
        visualCues: ["hives", "contact dermatitis rash", "localized redness", "swelling"],
        urgency: "low-medium",
        recommendation: "Avoid the allergen. Use antihistamines or topical creams. See a doctor for persistent or severe reactions."
      }
    ];
    
    // Store each condition in cache
    defaultConditions.forEach(condition => {
      this.cache.set(`condition:${condition.name.toLowerCase()}`, condition);
    });
    
    // Also store the full list for quick access
    this.cache.set('all_conditions', defaultConditions);
    this.conditionsLoaded = true;
  }
  
  /**
   * Get all medical conditions
   * @returns Array of all medical conditions
   */
  public async getAllConditions(): Promise<MedicalCondition[]> {
    await this.ensureConditionsLoaded();
    
    const conditions = this.cache.get<MedicalCondition[]>('all_conditions');
    return conditions || [];
  }
  
  /**
   * Get a medical condition by name
   * @param name - The name of the condition
   * @returns The medical condition or undefined if not found
   */
  public async getConditionByName(name: string): Promise<MedicalCondition | undefined> {
    await this.ensureConditionsLoaded();
    
    return this.cache.get<MedicalCondition>(`condition:${name.toLowerCase()}`);
  }
  
  /**
   * Calculate how strongly a condition is associated with a set of symptoms
   * @param conditionName - The name of the condition
   * @param identifiedFactors - Array of identified symptoms and features
   * @returns A score between 0 and 1 representing the strength of association
   */
  public async calculateSymptomAssociation(
    conditionName: string,
    identifiedFactors: string[]
  ): Promise<number> {
    const condition = await this.getConditionByName(conditionName);
    if (!condition) return 0;
    
    const symptoms = condition.symptoms || [];
    const visualCues = condition.visualCues || [];
    
    const allConditionFactors = [
      ...symptoms,
      ...visualCues
    ];
    
    // Count how many of the identified factors match the condition's factors
    let matchCount = 0;
    identifiedFactors.forEach(factor => {
      if (allConditionFactors.some(cf => cf.toLowerCase() === factor.toLowerCase())) {
        matchCount++;
      }
    });
    
    // Calculate the score
    // 1) Based on the percentage of identified factors that match the condition
    const coverageScore = identifiedFactors.length > 0 
      ? matchCount / identifiedFactors.length 
      : 0;
    
    // 2) Based on the percentage of condition factors that are covered by identified factors
    const specificityScore = allConditionFactors.length > 0 
      ? matchCount / allConditionFactors.length 
      : 0;
    
    // Combine the scores (giving more weight to specificity)
    return (0.4 * coverageScore) + (0.6 * specificityScore);
  }
  
  /**
   * Get matching factors between a condition and identified symptoms
   * @param conditionName - The name of the condition
   * @param identifiedFactors - Array of identified symptoms and features
   * @returns Array of matching factors
   */
  public async getMatchingFactors(
    conditionName: string,
    identifiedFactors: string[]
  ): Promise<string[]> {
    const condition = await this.getConditionByName(conditionName);
    if (!condition) return [];
    
    const symptoms = condition.symptoms || [];
    const visualCues = condition.visualCues || [];
    
    const allConditionFactors = [
      ...symptoms,
      ...visualCues
    ];
    
    // Find all matches
    return identifiedFactors.filter(factor => 
      allConditionFactors.some(cf => cf.toLowerCase() === factor.toLowerCase())
    );
  }
  
  private async ensureConditionsLoaded(): Promise<void> {
    if (!this.conditionsLoaded) {
      await this.loadConditions();
    }
  }
}

export const knowledgeBase = new KnowledgeBase();