import { pgTable, text, serial, integer, boolean, jsonb, timestamp, primaryKey, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Symptom analysis table
export const symptoms = pgTable("symptoms", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  description: text("description").notNull(),
  duration: text("duration"),
  severity: text("severity"),
  bodyLocation: text("body_location"),
  uploadedImages: jsonb("uploaded_images").$type<string[]>(), // Array of image paths
  analysis: jsonb("analysis").$type<SymptomAnalysis>(), // Structured analysis result
  extractedSymptoms: jsonb("extracted_symptoms").$type<string[]>(), // Extracted symptoms from text
  reasoningNotes: jsonb("reasoning_notes").$type<string[]>(), // Notes from reasoning engine
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Knowledge base table for medical conditions
export const medicalConditions = pgTable("medical_conditions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  symptoms: jsonb("symptoms").$type<string[]>().notNull(),
  visualCues: jsonb("visual_cues").$type<string[]>().default([]),
  urgency: text("urgency").notNull(),
  recommendation: text("recommendation").notNull(),
  commonInAgeGroup: text("common_in_age_group"),
  learnMoreUrl: text("learn_more_url"),
});

// Table for AI model performance tracking
export const aiPredictions = pgTable("ai_predictions", {
  id: serial("id").primaryKey(),
  symptomId: integer("symptom_id").references(() => symptoms.id).notNull(),
  rawPredictions: jsonb("raw_predictions").$type<Array<{name: string, score: number}>>().notNull(),
  refinedPredictions: jsonb("refined_predictions").$type<Array<{name: string, score: number}>>().notNull(),
  textEmbedding: jsonb("text_embedding").$type<number[]>(),
  imageEmbedding: jsonb("image_embedding").$type<number[]>(),
  confidence: text("confidence").notNull(),
  processingTime: integer("processing_time"), // in milliseconds
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Table for user feedback on analysis accuracy
export const userFeedback = pgTable("user_feedback", {
  id: serial("id").primaryKey(),
  symptomId: integer("symptom_id").references(() => symptoms.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  feedbackRating: integer("feedback_rating"), // 1-5 scale
  feedbackText: text("feedback_text"),
  correctCondition: text("correct_condition"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSymptomSchema = createInsertSchema(symptoms).omit({
  id: true,
  analysis: true,
  extractedSymptoms: true,
  reasoningNotes: true,
  createdAt: true,
  userId: true,
});

export const insertMedicalConditionSchema = createInsertSchema(medicalConditions).omit({
  id: true,
});

export type InsertSymptom = z.infer<typeof insertSymptomSchema>;
export type Symptom = typeof symptoms.$inferSelect;
export type MedicalCondition = typeof medicalConditions.$inferSelect;

// Structured analysis result type
export interface SymptomAnalysis {
  potentialConditions: PotentialCondition[];
  nextSteps: NextStep[];
  disclaimer: string;
  extractedTextualSymptoms?: string[];
  userInputText?: string;
}

export interface PotentialCondition {
  name: string;
  description: string;
  relevance: 'low' | 'medium' | 'high';
  symptoms: string[];
  visualCues?: string[];
  score?: number;
  urgency?: string;
  recommendation?: string;
  reasoningNotes?: string[];
  learnMoreUrl?: string;
}

export interface NextStep {
  type: 'consult' | 'general';
  title: string;
  description: string;
  suggestions?: string[];
}

// AI Model types
export interface TextEncoderOutput {
  identifiedSymptoms: string[];
  embedding: number[];
  rawText: string;
}

export interface ImageEncoderOutput {
  identifiedFeatures: string[];
  embedding: number[];
  hasImage: boolean;
  imageDescription: string;
}

export interface MultimodalFusionOutput {
  fusedEmbedding: number[];
  allIdentifiedFactors: string[];
  textSymptoms: string[];
  visualFeatures: string[];
  rawTextInput: string;
  hasImage: boolean;
}

export interface ReasoningOutput {
  conditions: PotentialCondition[];
  summary: string;
  inputFactors: string[];
  textSymptoms: string[];
  visualFeatures: string[];
  hasImage: boolean;
}

// Form validation schema with more specific validations
export const symptomFormSchema = insertSymptomSchema.extend({
  description: z.string().min(10, "Please provide a more detailed description of your symptoms"),
  duration: z.string().optional(),
  severity: z.string().optional(),
  bodyLocation: z.string().optional(),
  uploadedImages: z.array(z.string()).optional(),
});
