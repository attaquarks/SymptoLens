import React, { useState } from 'react';
import { SymptomForm } from '@/components/SymptomForm';
import { AnalysisResults } from '@/components/AnalysisResults';
import { SymptomAnalysis } from '@shared/schema';
import { Button } from "@/components/ui/button";
import { ArrowLeft, BrainCircuit, SearchCheck, BadgeInfo, ThumbsUp } from 'lucide-react';

export const Home: React.FC = () => {
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showingResult, setShowingResult] = useState(false);

  const handleAnalysisSubmit = () => {
    setIsAnalyzing(true);
  };

  const handleAnalysisSuccess = (result: SymptomAnalysis) => {
    setAnalysis(result);
    setIsAnalyzing(false);
    setShowingResult(true);
  };

  const handleStartNew = () => {
    setShowingResult(false);
    setAnalysis(null);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Hero Section */}
      {!showingResult && !isAnalyzing && (
        <section className="py-12 mb-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <BrainCircuit className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              SymptoLens AI Medical Analysis
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Describe your symptoms and receive AI-powered educational insights, combining 
              multimodal analysis with medical knowledge for a comprehensive understanding.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-start gap-2 max-w-xs">
                <SearchCheck className="h-6 w-6 text-primary mt-1" />
                <div className="text-left">
                  <h3 className="font-medium">Multimodal Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload images along with text descriptions for more accurate symptom identification
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 max-w-xs">
                <BadgeInfo className="h-6 w-6 text-primary mt-1" />
                <div className="text-left">
                  <h3 className="font-medium">Medical Knowledge Base</h3>
                  <p className="text-sm text-muted-foreground">
                    Analysis validated against a structured repository of medical conditions and symptoms
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 max-w-xs">
                <ThumbsUp className="h-6 w-6 text-primary mt-1" />
                <div className="text-left">
                  <h3 className="font-medium">Educational Guidance</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive personalized next steps and recommendations based on your symptoms
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main content */}
      <div className="max-w-4xl mx-auto">
        {showingResult ? (
          <div className="space-y-6">
            <Button
              variant="outline"
              onClick={handleStartNew}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> New Analysis
            </Button>
            <AnalysisResults analysis={analysis} />
          </div>
        ) : (
          <div className="space-y-6">
            <SymptomForm 
              onSubmitSuccess={handleAnalysisSuccess} 
              onSubmit={handleAnalysisSubmit}
            />
            <AnalysisResults analysis={null} loading={isAnalyzing} />
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="max-w-4xl mx-auto mt-12 bg-muted/30 p-6 rounded-lg">
        <h3 className="font-medium text-lg mb-3">Important Disclaimer</h3>
        <p className="text-muted-foreground mb-3">
          SymptoLens provides educational information only and is not a substitute for professional medical advice, 
          diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider 
          with any questions you may have regarding a medical condition.
        </p>
        <p className="text-muted-foreground">
          Never disregard professional medical advice or delay in seeking it because of something you have 
          read on this website. If you think you may have a medical emergency, call your doctor or emergency 
          services immediately.
        </p>
      </div>
    </div>
  );
};

export default Home;