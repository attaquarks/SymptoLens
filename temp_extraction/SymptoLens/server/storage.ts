import { symptoms, users, type User, type InsertUser, type Symptom, type InsertSymptom, type SymptomAnalysis } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Symptom methods
  createSymptom(symptom: InsertSymptom): Promise<Symptom>;
  getSymptom(id: number): Promise<Symptom | undefined>;
  updateSymptomAnalysis(id: number, analysis: SymptomAnalysis): Promise<Symptom | undefined>;
  getRecentSymptoms(limit?: number): Promise<Symptom[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private symptomsMap: Map<number, Symptom>;
  userCurrentId: number;
  symptomCurrentId: number;

  constructor() {
    this.users = new Map();
    this.symptomsMap = new Map();
    this.userCurrentId = 1;
    this.symptomCurrentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createSymptom(insertSymptom: InsertSymptom): Promise<Symptom> {
    const id = this.symptomCurrentId++;
    const now = new Date();
    
    const symptom: Symptom = {
      ...insertSymptom,
      id,
      createdAt: now,
      analysis: {
        potentialConditions: [],
        nextSteps: []
      }
    };
    
    this.symptomsMap.set(id, symptom);
    return symptom;
  }

  async getSymptom(id: number): Promise<Symptom | undefined> {
    return this.symptomsMap.get(id);
  }

  async updateSymptomAnalysis(id: number, analysis: SymptomAnalysis): Promise<Symptom | undefined> {
    const symptom = this.symptomsMap.get(id);
    if (!symptom) return undefined;
    
    const updatedSymptom = { ...symptom, analysis };
    this.symptomsMap.set(id, updatedSymptom);
    
    return updatedSymptom;
  }

  async getRecentSymptoms(limit: number = 10): Promise<Symptom[]> {
    return Array.from(this.symptomsMap.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
