import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Symptom Analysis table
export const symptomAnalyses = pgTable("symptom_analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  textSymptoms: text("text_symptoms").notNull(),
  imageId: text("image_id"),
  imageDescription: text("image_description"),
  patientAge: integer("patient_age"),
  patientGender: text("patient_gender"),
  results: json("results").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSymptomAnalysisSchema = createInsertSchema(symptomAnalyses).omit({
  id: true,
  createdAt: true,
});

// Medical Condition Reference table
export const medicalConditions = pgTable("medical_conditions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  symptoms: json("symptoms").notNull(),
  additionalInfo: text("additional_info"),
  recommendedActions: json("recommended_actions"),
});

export const insertMedicalConditionSchema = createInsertSchema(medicalConditions).omit({
  id: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type SymptomAnalysis = typeof symptomAnalyses.$inferSelect;
export type InsertSymptomAnalysis = z.infer<typeof insertSymptomAnalysisSchema>;

export type MedicalCondition = typeof medicalConditions.$inferSelect;
export type InsertMedicalCondition = z.infer<typeof insertMedicalConditionSchema>;
