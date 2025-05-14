import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

// Initialize Postgres client
let client;
let db;

if (databaseUrl) {
  // For direct database access using postgres.js
  client = postgres(databaseUrl, { ssl: 'require' });
  db = drizzle(client, { schema });
} else {
  console.warn('DATABASE_URL not found in environment variables');
}

// Also initialize Supabase client for auth and storage features
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

let supabase;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn('Supabase credentials not found in environment variables');
}

// Export the database client
export { supabase, db };

// Helper function to check DB connection
export async function checkDbConnection() {
  if (!db) {
    console.error('Database not initialized');
    return false;
  }
  
  try {
    // Try a simple query to check if database is accessible
    const result = await db.select().from(schema.users).limit(1);
    return true;
  } catch (err) {
    console.error('Database connection failed:', err);
    return false;
  }
}

// Helper functions for the medical conditions table
export async function seedMedicalConditions() {
  if (!db) {
    console.error('Database not initialized, cannot seed medical conditions');
    return;
  }
  
  try {
    // Check if there are already conditions in the database
    const existingConditions = await db.select().from(schema.medicalConditions).limit(1);
    
    if (existingConditions && existingConditions.length > 0) {
      console.log('Medical conditions already seeded, skipping...');
      return;
    }
    
    // Define default medical conditions from the knowledge base
    const defaultConditions = [
      {
        name: "Influenza",
        description: "Influenza is a viral infection that attacks your respiratory system — your nose, throat and lungs. Commonly called the flu.",
        symptoms: ["fever", "cough", "sore throat", "body aches", "fatigue", "chills", "headache"],
        visualCues: [],
        urgency: "medium",
        recommendation: "Rest, drink fluids, and consider over-the-counter pain relievers. See a doctor if symptoms are severe or if you are in a high-risk group."
      },
      {
        name: "Lyme Disease",
        description: "Lyme disease is a bacterial infection transmitted by infected ticks, characterized by fever, headache, fatigue, and a skin rash called erythema migrans.",
        symptoms: ["fever", "fatigue", "headache", "muscle aches", "joint pain"],
        visualCues: ["bullseye rash", "circular rash", "expanding rash"],
        urgency: "high",
        recommendation: "Requires antibiotic treatment. Consult a doctor immediately if Lyme disease is suspected, especially after a tick bite or with a characteristic rash."
      },
      {
        name: "Common Cold",
        description: "The common cold is a viral infection of your nose and throat (upper respiratory tract).",
        symptoms: ["runny nose", "sore throat", "cough", "congestion", "sneezing", "mild body aches", "mild headache"],
        visualCues: [],
        urgency: "low",
        recommendation: "Rest, stay hydrated, and use over-the-counter remedies for symptom relief. Symptoms usually resolve within a week or two."
      },
      {
        name: "Eczema",
        description: "Eczema (atopic dermatitis) is a condition that makes your skin red and itchy. It's common in children but can occur at any age.",
        symptoms: ["itchy skin", "dry skin", "red patches", "scaly skin", "skin inflammation"],
        visualCues: ["red patches", "dry flaky skin", "thickened skin", "small raised bumps"],
        urgency: "low-medium",
        recommendation: "Moisturize regularly, avoid irritants, and use topical corticosteroids if prescribed by a doctor. See a doctor for diagnosis and management plan."
      },
      {
        name: "Conjunctivitis",
        description: "Conjunctivitis, or pink eye, is an inflammation or infection of the transparent membrane (conjunctiva) that lines your eyelid and covers the white part of your eyeball.",
        symptoms: ["eye redness", "itchy eyes", "gritty feeling in eye", "eye discharge", "watery eyes"],
        visualCues: ["red eyes", "pink eyes", "swollen eyelids", "eye discharge (watery or thick)"],
        urgency: "medium",
        recommendation: "Depends on the cause (viral, bacterial, allergic). See a doctor for diagnosis. Practice good hygiene to prevent spread."
      },
      {
        name: "Bronchitis",
        description: "Bronchitis is an inflammation of the lining of your bronchial tubes, which carry air to and from your lungs.",
        symptoms: ["cough", "mucus production", "fatigue", "shortness of breath", "mild fever", "chest discomfort"],
        visualCues: [],
        urgency: "medium",
        recommendation: "Rest, fluids, humidifier. See a doctor if cough is severe, lasts weeks, or if you have underlying lung conditions."
      },
      {
        name: "Pneumonia",
        description: "Pneumonia is an infection that inflames the air sacs in one or both lungs. The air sacs may fill with fluid or pus.",
        symptoms: ["cough", "fever", "chills", "difficulty breathing", "chest pain", "fatigue"],
        visualCues: [],
        urgency: "high",
        recommendation: "Seek medical attention promptly. Treatment depends on the type and severity."
      },
      {
        name: "Skin Allergy",
        description: "A skin allergy occurs when your skin reacts to an allergen, causing a rash or other symptoms.",
        symptoms: ["rash", "itchiness", "redness", "swelling", "bumps", "blisters"],
        visualCues: ["hives", "contact dermatitis rash", "localized redness", "swelling"],
        urgency: "low-medium",
        recommendation: "Avoid the allergen. Use antihistamines or topical creams. See a doctor for persistent or severe reactions."
      },
      {
        name: "Gastroenteritis",
        description: "Gastroenteritis is an inflammation of the stomach and intestines, typically caused by a viral or bacterial infection.",
        symptoms: ["diarrhea", "vomiting", "nausea", "abdominal cramps", "stomach pain", "mild fever"],
        visualCues: [],
        urgency: "medium",
        recommendation: "Stay hydrated with plenty of fluids. Eat bland foods. Rest. See a doctor if symptoms are severe, persistent, or if there are signs of dehydration."
      }
    ];

    // Insert conditions into the database
    for (const condition of defaultConditions) {
      await db.insert(schema.medicalConditions).values(condition);
    }

    console.log('Successfully seeded medical conditions');
  } catch (err) {
    console.error('Error seeding medical conditions:', err);
  }
}