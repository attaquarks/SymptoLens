import { useState } from "react";
import AppContainer from "@/components/app-container";
import SymptomInputCard from "@/components/symptom-input-card";
import ImageUploadCard from "@/components/image-upload-card";
import ProcessingScreen from "@/components/processing-screen";
import ResultsSection from "@/components/results-section";
import Stepper from "@/components/stepper";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { useSymptomAnalysis } from "@/lib/hooks/use-symptom-analysis";

export default function Home() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const {
    symptomsForm,
    imageFile,
    imageDescription,
    setImageFile,
    setImageDescription,
    isAnalyzing,
    analysisResults,
    resetAnalysis,
    analyzeSymptoms,
  } = useSymptomAnalysis();

  const handleProceedToImageUpload = () => {
    setCurrentStep(2);
  };

  const handleBackToSymptoms = () => {
    setCurrentStep(1);
  };

  const handleAnalyzeSymptoms = async () => {
    setCurrentStep(3);
    await analyzeSymptoms();
    setCurrentStep(4);
  };

  const handleStartNewAnalysis = () => {
    resetAnalysis();
    setCurrentStep(1);
  };

  const renderCurrentStep = () => {
    if (currentStep === 1) {
      return (
        <div className="grid md:grid-cols-2 gap-8">
          <SymptomInputCard 
            symptomsForm={symptomsForm}
            onContinue={handleProceedToImageUpload}
          />
          {/* Second card placeholder for symmetry */}
          <div className="hidden md:block"></div>
        </div>
      );
    } else if (currentStep === 2) {
      return (
        <div className="grid md:grid-cols-2 gap-8">
          <ImageUploadCard
            imageFile={imageFile}
            imageDescription={imageDescription}
            setImageFile={setImageFile}
            setImageDescription={setImageDescription}
            onBack={handleBackToSymptoms}
            onAnalyze={handleAnalyzeSymptoms}
          />
          {/* Second card placeholder for symmetry */}
          <div className="hidden md:block"></div>
        </div>
      );
    } else if (currentStep === 3) {
      return <ProcessingScreen />;
    } else if (currentStep === 4) {
      return (
        <ResultsSection
          results={analysisResults}
          onNewAnalysis={handleStartNewAnalysis}
        />
      );
    }
  };

  return (
    <AppContainer>
      <div className="container mx-auto px-4 py-8">
        <Alert className="bg-neutral-100 border-l-4 border-warning mb-8">
          <InfoIcon className="h-5 w-5 text-warning" />
          <AlertTitle className="font-medium text-neutral-800">Medical Disclaimer</AlertTitle>
          <AlertDescription className="text-neutral-700 text-sm">
            SymptoLens provides preliminary assessments, not medical diagnoses. Always consult with healthcare professionals for proper medical advice and treatment.
          </AlertDescription>
        </Alert>

        <div className="mb-8 hidden md:block">
          <Stepper 
            steps={["Symptoms", "Image", "Analysis", "Results"]} 
            currentStep={currentStep}
          />
        </div>

        {renderCurrentStep()}
      </div>
    </AppContainer>
  );
}
