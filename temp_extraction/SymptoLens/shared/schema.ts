import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
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
  description: text("description").notNull(),
  duration: text("duration"),
  severity: text("severity"),
  bodyLocation: text("body_location"),
  uploadedImages: jsonb("uploaded_images").$type<string[]>(), // Array of image paths
  analysis: jsonb("analysis").$type<SymptomAnalysis>(), // Structured analysis result
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSymptomSchema = createInsertSchema(symptoms).omit({
  id: true,
  analysis: true,
  createdAt: true,
});

export type InsertSymptom = z.infer<typeof insertSymptomSchema>;
export type Symptom = typeof symptoms.$inferSelect;

// Structured analysis result type
export interface SymptomAnalysis {
  potentialConditions: PotentialCondition[];
  nextSteps: NextStep[];
}

export interface PotentialCondition {
  name: string;
  description: string;
  relevance: 'low' | 'medium' | 'high';
  symptoms: string[];
  learnMoreUrl?: string;
}

export interface NextStep {
  type: 'consult' | 'general';
  title: string;
  description: string;
  suggestions?: string[];
}

// Form validation schema with more specific validations
export const symptomFormSchema = insertSymptomSchema.extend({
  description: z.string().min(10, "Please provide a more detailed description of your symptoms"),
  duration: z.string().optional(),
  severity: z.string().optional(),
  bodyLocation: z.string().optional(),
  uploadedImages: z.array(z.string()).optional(),
});
