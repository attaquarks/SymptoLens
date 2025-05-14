import { 
  users, 
  type User, 
  type InsertUser, 
  symptomAnalyses, 
  type SymptomAnalysis, 
  type InsertSymptomAnalysis, 
  medicalConditions, 
  type MedicalCondition, 
  type InsertMedicalCondition 
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Symptom analysis operations
  getSymptomAnalysis(id: number): Promise<SymptomAnalysis | undefined>;
  getSymptomAnalysesByUserId(userId: number): Promise<SymptomAnalysis[]>;
  createSymptomAnalysis(analysis: InsertSymptomAnalysis): Promise<SymptomAnalysis>;
  
  // Medical condition operations
  getMedicalCondition(id: number): Promise<MedicalCondition | undefined>;
  getMedicalConditionByName(name: string): Promise<MedicalCondition | undefined>;
  getAllMedicalConditions(): Promise<MedicalCondition[]>;
  createMedicalCondition(condition: InsertMedicalCondition): Promise<MedicalCondition>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private symptomAnalyses: Map<number, SymptomAnalysis>;
  private medicalConditions: Map<number, MedicalCondition>;
  private currentUserId: number;
  private currentAnalysisId: number;
  private currentConditionId: number;

  constructor() {
    this.users = new Map();
    this.symptomAnalyses = new Map();
    this.medicalConditions = new Map();
    this.currentUserId = 1;
    this.currentAnalysisId = 1;
    this.currentConditionId = 1;
    
    // Initialize with some sample medical conditions
    this.initializeMedicalConditions();
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Symptom analysis operations
  async getSymptomAnalysis(id: number): Promise<SymptomAnalysis | undefined> {
    return this.symptomAnalyses.get(id);
  }
  
  async getSymptomAnalysesByUserId(userId: number): Promise<SymptomAnalysis[]> {
    return Array.from(this.symptomAnalyses.values()).filter(
      (analysis) => analysis.userId === userId
    );
  }
  
  async createSymptomAnalysis(insertAnalysis: InsertSymptomAnalysis): Promise<SymptomAnalysis> {
    const id = this.currentAnalysisId++;
    const createdAt = new Date();
    const analysis: SymptomAnalysis = { ...insertAnalysis, id, createdAt };
    this.symptomAnalyses.set(id, analysis);
    return analysis;
  }
  
  // Medical condition operations
  async getMedicalCondition(id: number): Promise<MedicalCondition | undefined> {
    return this.medicalConditions.get(id);
  }
  
  async getMedicalConditionByName(name: string): Promise<MedicalCondition | undefined> {
    return Array.from(this.medicalConditions.values()).find(
      (condition) => condition.name.toLowerCase() === name.toLowerCase()
    );
  }
  
  async getAllMedicalConditions(): Promise<MedicalCondition[]> {
    return Array.from(this.medicalConditions.values());
  }
  
  async createMedicalCondition(insertCondition: InsertMedicalCondition): Promise<MedicalCondition> {
    const id = this.currentConditionId++;
    const condition: MedicalCondition = { ...insertCondition, id };
    this.medicalConditions.set(id, condition);
    return condition;
  }
  
  // Initialize with sample medical conditions
  private async initializeMedicalConditions() {
    const commonConditions: InsertMedicalCondition[] = [
      {
        name: "Upper Respiratory Infection",
        description: "A common viral infection affecting the nose, throat, and upper airways. Typically includes symptoms like coughing, sore throat, runny nose, and mild fever.",
        symptoms: ["cough", "sore throat", "runny nose", "mild fever", "congestion"],
        additionalInfo: "Most URIs are caused by viruses and typically resolve on their own within 7-10 days. Rest, hydration, and over-the-counter medications can help manage symptoms.",
        recommendedActions: [
          "Get plenty of rest",
          "Stay hydrated",
          "Use over-the-counter pain relievers for fever or discomfort",
          "Consider a humidifier to ease congestion",
          "Consult a doctor if symptoms persist beyond 10 days or worsen significantly"
        ]
      },
      {
        name: "Seasonal Allergies",
        description: "An immune response to environmental triggers like pollen, dust, or pet dander. Can cause symptoms similar to a cold, including coughing, congestion, and sometimes headaches.",
        symptoms: ["sneezing", "runny nose", "congestion", "itchy eyes", "cough", "headache"],
        additionalInfo: "Unlike colds, allergies are not contagious and typically last as long as exposure to the allergen continues. Antihistamines and nasal steroids can help manage symptoms.",
        recommendedActions: [
          "Identify and avoid your triggers when possible",
          "Try over-the-counter antihistamines",
          "Use nasal steroid sprays as directed",
          "Keep windows closed during high pollen seasons",
          "Consider consulting with an allergist for testing and treatment options"
        ]
      },
      {
        name: "Early COVID-19",
        description: "A viral infection caused by the SARS-CoV-2 virus. Early symptoms can include fever, cough, and fatigue. Can progress to more severe symptoms in some cases.",
        symptoms: ["fever", "dry cough", "fatigue", "loss of taste or smell", "sore throat", "headache"],
        additionalInfo: "COVID-19 symptoms can vary widely. Testing is available to confirm diagnosis. Most people recover at home with rest and symptom management, but some may develop severe illness requiring medical care.",
        recommendedActions: [
          "Get tested for COVID-19",
          "Self-isolate to prevent spread to others",
          "Rest and stay hydrated",
          "Monitor symptoms, especially breathing difficulties",
          "Seek emergency medical attention for severe symptoms like difficulty breathing or persistent chest pain"
        ]
      }
    ];
    
    for (const condition of commonConditions) {
      await this.createMedicalCondition(condition);
    }
  }
}

export const storage = new MemStorage();
