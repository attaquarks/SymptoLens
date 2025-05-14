import { apiRequest } from "@/lib/queryClient";
import { SymptomAnalysis } from "@shared/schema";

interface SymptomData {
  description: string;
  duration?: string;
  severity?: string;
  bodyLocation?: string;
  uploadedImages?: string[];
}

export async function analyzeSymptoms(symptomData: SymptomData): Promise<SymptomAnalysis> {
  const response = await apiRequest('POST', '/api/symptoms', symptomData);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to analyze symptoms');
  }
  
  return response.json();
}

export async function getSymptomById(id: number): Promise<SymptomAnalysis> {
  const response = await apiRequest('GET', `/api/symptoms/${id}`, undefined);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch symptom data');
  }
  
  return response.json();
}
