import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SymptomAnalysis, PotentialCondition, NextStep } from "@shared/schema";

interface AnalysisResultsProps {
  isLoading: boolean;
  analysis?: SymptomAnalysis;
  symptomData: {
    description: string;
    duration?: string;
    severity?: string;
    bodyLocation?: string;
  };
  onStartOver: () => void;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  isLoading,
  analysis,
  symptomData,
  onStartOver,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-card p-8 text-center slide-up">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
        <h2 className="text-xl font-semibold text-neutral-800 mb-2">Analyzing Your Symptoms</h2>
        <p className="text-neutral-600">Our AI is processing your information to provide potential insights...</p>
      </div>
    );
  }

  if (!analysis) return null;

  const getRelevanceBadgeColor = (relevance: string) => {
    switch (relevance) {
      case 'high':
        return "bg-[#F8C471]/30 text-[#F6B24E]";
      case 'medium':
        return "bg-[#F8C471]/50 text-[#F6B24E]";
      case 'low':
        return "bg-[#F8C471]/70 text-[#F6B24E]";
      default:
        return "bg-neutral-100 text-neutral-600";
    }
  };

  return (
    <section className="slide-up">
      <div className="bg-white rounded-xl shadow-card p-6 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-800 mb-1">Analysis Results</h2>
            <p className="text-neutral-500">Based on your description and images</p>
          </div>
          <button
            type="button"
            className="text-neutral-400 hover:text-neutral-700"
            aria-label="Save results"
          >
            <span className="material-icons">bookmark_border</span>
          </button>
        </div>
        
        <div className="bg-[#F17D80]/10 border border-[#F17D80]/30 rounded-lg p-4 mb-6">
          <div className="flex">
            <span className="material-icons text-[#F17D80] mr-3 mt-0.5">warning</span>
            <div>
              <h3 className="font-medium text-neutral-800 mb-1">Medical Disclaimer</h3>
              <p className="text-sm text-neutral-600">
                This analysis is not a medical diagnosis. The information provided is for educational purposes only. 
                Please consult with a qualified healthcare professional for proper diagnosis and treatment of medical conditions.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium text-neutral-800 mb-3">Your Reported Symptoms</h3>
          <div className="bg-secondary rounded-lg p-4">
            <p className="text-neutral-700">
              {symptomData.description}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {symptomData.duration && (
                <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                  Duration: {symptomData.duration}
                </span>
              )}
              {symptomData.severity && (
                <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                  Severity: {symptomData.severity}
                </span>
              )}
              {symptomData.bodyLocation && (
                <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                  Location: {symptomData.bodyLocation}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-medium text-neutral-800 mb-4">Potential Related Conditions</h3>
          <p className="text-sm text-neutral-500 mb-4">Based on your symptoms, these conditions might be relevant:</p>
          
          <div className="space-y-4">
            {analysis.potentialConditions.map((condition, index) => (
              <Card key={index} className="border border-neutral-200 rounded-lg overflow-hidden">
                <CardHeader className="bg-secondary px-4 py-3 flex justify-between items-center">
                  <h4 className="font-medium text-neutral-800">{condition.name}</h4>
                  <Badge className={`text-sm px-3 py-1 rounded-full ${getRelevanceBadgeColor(condition.relevance)}`}>
                    {condition.relevance.charAt(0).toUpperCase() + condition.relevance.slice(1)} Relevance
                  </Badge>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-neutral-600 text-sm mb-3">
                    {condition.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {condition.symptoms.map((symptom, symptomIndex) => (
                      <span key={symptomIndex} className="bg-neutral-100 text-neutral-700 text-xs px-2 py-1 rounded-full">
                        {symptom}
                      </span>
                    ))}
                  </div>
                  <a href="#" className="text-primary hover:text-primary/90 text-sm font-medium flex items-center">
                    Learn more
                    <span className="material-icons text-sm ml-1">arrow_forward</span>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-neutral-800 mb-4">Recommended Next Steps</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.nextSteps.map((step, index) => (
              <Card key={index} className="border border-neutral-200 rounded-lg overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start mb-2">
                    <span className="material-icons text-primary mr-2">
                      {step.type === 'consult' ? 'medical_services' : 'tips_and_updates'}
                    </span>
                    <h4 className="font-medium text-neutral-800">{step.title}</h4>
                  </div>
                  <p className="text-sm text-neutral-600 mb-3">
                    {step.description}
                  </p>
                  
                  {step.type === 'consult' ? (
                    <button
                      type="button"
                      className="text-primary hover:text-primary/90 text-sm font-medium flex items-center"
                    >
                      Find specialists near you
                      <span className="material-icons text-sm ml-1">arrow_forward</span>
                    </button>
                  ) : (
                    step.suggestions && (
                      <ul className="text-sm text-neutral-600 space-y-2 mb-1">
                        {step.suggestions.map((suggestion, suggIndex) => (
                          <li key={suggIndex} className="flex items-start">
                            <span className="material-icons text-primary text-xs mr-2 mt-1">check_circle</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    )
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex justify-center mb-12">
        <Button
          type="button"
          variant="ghost"
          className="text-neutral-600 hover:text-neutral-800 flex items-center"
          onClick={onStartOver}
        >
          <span className="material-icons mr-1">refresh</span>
          Start a new analysis
        </Button>
      </div>
    </section>
  );
};

export default AnalysisResults;
