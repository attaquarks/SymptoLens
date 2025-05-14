import NodeCache from 'node-cache';
import { storage } from '../storage';
import { MedicalCondition } from '@shared/schema';

/**
 * KnowledgeBase: Structured repository of medical information
 * This module provides access to medical knowledge for validating and contextualizing
 * the AI's predictions, ensuring they are grounded in medical understanding.
 */
export class KnowledgeBase {
  private cache: NodeCache;
  private conditionsLoaded: boolean = false;
  
  constructor() {
    // Initialize cache with standard TTL of 1 hour
    this.cache = new NodeCache({
      stdTTL: 60 * 60, // 1 hour in seconds
      checkperiod: 120, // Check for expired keys every 2 minutes
    });
  }
  
  /**
   * Load all medical conditions from storage into the cache
   */
  private async loadConditions(): Promise<void> {
    if (this.conditionsLoaded) return;
    
    try {
      // Get all conditions from storage
      const conditions = await storage.getAllMedicalConditions();
      
      // Store each condition in cache by name
      conditions.forEach(condition => {
        this.cache.set(`condition:${condition.name.toLowerCase()}`, condition);
      });
      
      // Also store the full list
      this.cache.set('all_conditions', conditions);
      
      this.conditionsLoaded = true;
    } catch (error) {
      console.error("Error loading conditions into knowledge base:", error);
      throw error;
    }
  }
  
  /**
   * Get all medical conditions
   * @returns Array of all medical conditions
   */
  public async getAllConditions(): Promise<MedicalCondition[]> {
    await this.ensureConditionsLoaded();
    
    // Try to get from cache first
    const cachedConditions = this.cache.get<MedicalCondition[]>('all_conditions');
    if (cachedConditions) {
      return cachedConditions;
    }
    
    // If not in cache, load from storage
    const conditions = await storage.getAllMedicalConditions();
    this.cache.set('all_conditions', conditions);
    return conditions;
  }
  
  /**
   * Get a medical condition by name
   * @param name - The name of the condition
   * @returns The medical condition or undefined if not found
   */
  public async getConditionByName(name: string): Promise<MedicalCondition | undefined> {
    await this.ensureConditionsLoaded();
    
    const key = `condition:${name.toLowerCase()}`;
    
    // Try to get from cache first
    const cachedCondition = this.cache.get<MedicalCondition>(key);
    if (cachedCondition) {
      return cachedCondition;
    }
    
    // If not in cache, get from storage
    const condition = await storage.getMedicalConditionByName(name);
    if (condition) {
      this.cache.set(key, condition);
    }
    
    return condition;
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
    
    const conditionSymptoms = condition.symptoms as string[];
    
    // Count how many identified factors match the condition's symptoms
    let matchCount = 0;
    for (const factor of identifiedFactors) {
      if (conditionSymptoms.some(s => s.toLowerCase().includes(factor.toLowerCase()))) {
        matchCount++;
      }
    }
    
    // Calculate a match score
    // This is a simple calculation; a real system would use more sophisticated methods
    if (identifiedFactors.length === 0) return 0;
    
    // Take into account both the number of matches and the ratio of matches to total symptoms
    const matchRatio = matchCount / identifiedFactors.length;
    const coverageRatio = matchCount / conditionSymptoms.length;
    
    // Combined score (weighted average)
    return 0.7 * matchRatio + 0.3 * coverageRatio;
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
    
    const conditionSymptoms = condition.symptoms as string[];
    
    // Find identified factors that match the condition's symptoms
    const matchingFactors: string[] = [];
    
    for (const factor of identifiedFactors) {
      for (const symptom of conditionSymptoms) {
        if (symptom.toLowerCase().includes(factor.toLowerCase()) || 
            factor.toLowerCase().includes(symptom.toLowerCase())) {
          matchingFactors.push(factor);
          break;
        }
      }
    }
    
    return [...new Set(matchingFactors)]; // Remove duplicates
  }
  
  private async ensureConditionsLoaded(): Promise<void> {
    if (!this.conditionsLoaded) {
      await this.loadConditions();
    }
  }
}

export const knowledgeBase = new KnowledgeBase();
