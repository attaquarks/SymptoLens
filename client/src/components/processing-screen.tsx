import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const processingSteps = [
  "Processing text symptoms",
  "Analyzing image",
  "Applying multimodal fusion",
  "Querying knowledge base",
  "Generating results"
];

export default function ProcessingScreen() {
  const [progress, setProgress] = useState(0);
  const [currentOperation, setCurrentOperation] = useState(processingSteps[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 5;
        
        // Update the operation text based on progress
        if (newProgress < 20) {
          setCurrentOperation(processingSteps[0]);
        } else if (newProgress < 40) {
          setCurrentOperation(processingSteps[1]);
        } else if (newProgress < 60) {
          setCurrentOperation(processingSteps[2]);
        } else if (newProgress < 80) {
          setCurrentOperation(processingSteps[3]);
        } else {
          setCurrentOperation(processingSteps[4]);
        }
        
        if (newProgress >= 100) {
          clearInterval(interval);
        }
        
        return Math.min(newProgress, 100);
      });
    }, 150);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <Card className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto text-center mt-8">
      <CardContent className="p-0">
        <div className="flex flex-col items-center">
          {/* Animation container */}
          <div className="w-24 h-24 mb-6 relative">
            <div className="absolute inset-0 border-4 border-neutral-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-primary border-transparent rounded-full animate-spin"></div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary text-4xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3"/>
              <path d="M3 9a4 4 0 0 1 5 1"/>
              <path d="M13 18a4 4 0 0 0 6-4"/>
              <circle cx="8" cy="16" r="3"/>
              <circle cx="16" cy="8" r="3"/>
              <path d="M3 4h1"/>
              <path d="M20 4h1"/>
              <path d="M18 3v1"/>
              <path d="M18 20v1"/>
              <path d="M3 20h1"/>
              <path d="M6 3v1"/>
            </svg>
          </div>
          
          <h2 className="text-xl font-heading font-medium mb-3 text-neutral-900">
            Analyzing Your Symptoms
          </h2>
          <p className="text-neutral-700 mb-6">
            Our multimodal AI system is processing your information. This may take a moment.
          </p>
          
          <div className="w-full mb-4">
            <Progress value={progress} className="h-2 bg-neutral-200 rounded-full mb-1" />
            <div className="flex justify-between text-xs text-neutral-500">
              <span>Text Analysis</span>
              <span>Image Analysis</span>
              <span>Knowledge Base</span>
            </div>
          </div>
          
          <div className="text-neutral-600 text-sm">
            <p>
              <span className="font-medium">{currentOperation}</span>...
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
