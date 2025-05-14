import React, { useState } from "react";
import SymptomForm from "@/components/SymptomForm";
import InfoCard from "@/components/InfoCard";
import AnalysisResults from "@/components/AnalysisResults";
import { SymptomAnalysis } from "@shared/schema";

const Home: React.FC = () => {
  const [showResults, setShowResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SymptomAnalysis | undefined>(undefined);
  const [symptomData, setSymptomData] = useState({
    description: "",
    duration: "",
    severity: "",
    bodyLocation: "",
  });

  const handleAnalysisComplete = (analysisResult: SymptomAnalysis) => {
    setAnalysis(analysisResult);
    setIsAnalyzing(false);
    setShowResults(true);
    
    // Scroll to results
    setTimeout(() => {
      const resultsElement = document.getElementById('analysisResults');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSubmitForm = (data: any) => {
    setSymptomData({
      description: data.description,
      duration: data.duration,
      severity: data.severity,
      bodyLocation: data.bodyLocation,
    });
    setIsAnalyzing(true);
    setShowResults(true);
  };

  const handleStartOver = () => {
    setShowResults(false);
    setAnalysis(undefined);
    
    // Scroll back to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-secondary min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Intro Section */}
        <section className="mb-12 text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-800 mb-4 flex items-center justify-center">
            <span className="material-icons text-primary mr-2">biotech</span>
            AI Powered Symptom Analysis
          </h1>
          <p className="text-lg text-neutral-600 mb-6">
            Describe your symptoms and upload relevant images to get AI-powered insights about potential conditions.
          </p>
          <div className="bg-[#F17D80]/20 border border-[#F17D80] rounded-lg p-4 mb-8">
            <div className="flex items-start">
              <span className="material-icons text-[#F17D80] mr-3 mt-0.5">info</span>
              <p className="text-neutral-700 text-left text-sm">
                <strong>Important:</strong> SymptoLens is not a diagnostic tool and does not replace professional medical advice. 
                Always consult with a healthcare professional about your symptoms and concerns.
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <SymptomForm onAnalysisComplete={handleAnalysisComplete} />
          </div>
          
          <div className="lg:col-span-1">
            <InfoCard />
          </div>
        </div>
        
        {/* Analysis Results Section */}
        {showResults && (
          <section id="analysisResults">
            <AnalysisResults 
              isLoading={isAnalyzing} 
              analysis={analysis}
              symptomData={symptomData}
              onStartOver={handleStartOver}
            />
          </section>
        )}
      </main>
    </div>
  );
};

export default Home;
