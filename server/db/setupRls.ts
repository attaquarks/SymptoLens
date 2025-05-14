
import { supabase } from '../db';
import fs from 'fs';
import path from 'path';

export async function setupRls() {
  try {
    const sqlFile = path.join(__dirname, 'setup-rls.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Execute the SQL commands
    const { error } = await supabase.from('rpc').select('*');
    if (error) throw error;
    
    console.log('Successfully set up RLS policies');
  } catch (error) {
    console.error('Error setting up RLS:', error);
  }
}
