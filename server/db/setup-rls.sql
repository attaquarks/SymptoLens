
-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Symptoms table policies
CREATE POLICY "Users can read their own symptoms" ON symptoms
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own symptoms" ON symptoms
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Medical conditions are readable by all authenticated users
CREATE POLICY "Anyone can read medical conditions" ON medical_conditions
  FOR SELECT USING (true);

-- AI predictions are only readable by the user who created them
CREATE POLICY "Users can read their own predictions" ON ai_predictions
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM symptoms WHERE symptoms.id = symptom_id AND symptoms.user_id = auth.uid()
  ));

-- User feedback is only readable by the user who created it
CREATE POLICY "Users can read their own feedback" ON user_feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback" ON user_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);
