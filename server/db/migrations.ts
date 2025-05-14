
import { db } from '../db';
import * as schema from '@shared/schema';

export async function runMigrations() {
  try {
    // Create medical_conditions table
    // Drop and recreate approach for clean migration
    await db.execute(`
      DROP TABLE IF EXISTS medical_conditions CASCADE;
      CREATE TABLE medical_conditions (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        symptoms JSONB NOT NULL,
        visual_cues JSONB DEFAULT '[]',
        urgency TEXT NOT NULL,
        recommendation TEXT NOT NULL,
        common_in_age_group TEXT,
        learn_more_url TEXT
      );
    `);
    
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
}
