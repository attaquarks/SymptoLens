import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { delay } from "@/lib/utils";

export interface Condition {
  id: string;
  name: string;
  confidence: number;
  description: string;
  matchingFactors: string[];
  additionalInfo?: string;
  recommendedActions?: string[];
}

export interface AnalysisResults {
  summary: string;
  conditions: Condition[];
}

export type SymptomFormValues = {
  description: string;
  age: number;
  gender: string;
};

export const symptomFormSchema = z.object({
  description: z.string().min(20, "Please provide at least 20 characters for better analysis"),
  age: z.coerce.number().min(0).max(120),
  gender: z.string().min(1, "Please select a gender"),
});

export function useSymptomAnalysis() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDescription, setImageDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const { toast } = useToast();

  const symptomsForm = useForm<SymptomFormValues>({
    resolver: zodResolver(symptomFormSchema),
    defaultValues: {
      description: "",
      age: 0,
      gender: "",
    },
  });

  const analyzeSymptoms = async () => {
    try {
      const formData = symptomsForm.getValues();
      setIsAnalyzing(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append("description", formData.description);
      formDataToSend.append("age", formData.age.toString());
      formDataToSend.append("gender", formData.gender);
      formDataToSend.append("imageDescription", imageDescription);
      
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }
      
      // Make API call
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formDataToSend,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const results = await response.json();
      setAnalysisResults(results);
    } catch (error) {
      console.error("Error analyzing symptoms:", error);
      toast({
        title: "Error analyzing symptoms",
        description: "There was a problem analyzing your symptoms. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    symptomsForm.reset();
    setImageFile(null);
    setImageDescription("");
    setAnalysisResults(null);
  };

  return {
    symptomsForm,
    imageFile,
    imageDescription,
    setImageFile,
    setImageDescription,
    isAnalyzing,
    analysisResults,
    analyzeSymptoms,
    resetAnalysis,
  };
}
