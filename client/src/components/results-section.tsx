import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowRightIcon, 
  CheckCircleIcon,
  InfoIcon, 
  RefreshCw,
  SaveIcon,
  AlertTriangleIcon,
  UserSearchIcon
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { AnalysisResults, Condition } from "@/lib/hooks/use-symptom-analysis";
import { getConfidenceColor, getConfidenceText, getConfidenceTextClass } from "@/lib/utils";

interface ResultsSectionProps {
  results: AnalysisResults | null;
  onNewAnalysis: () => void;
}

export default function ResultsSection({ results, onNewAnalysis }: ResultsSectionProps) {
  const [expandedConditions, setExpandedConditions] = useState<Set<string>>(new Set());

  if (!results) {
    return null;
  }

  const toggleConditionDetails = (conditionId: string) => {
    setExpandedConditions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(conditionId)) {
        newSet.delete(conditionId);
      } else {
        newSet.add(conditionId);
      }
      return newSet;
    });
  };

  return (
    <Card className="bg-white rounded-lg shadow-md max-w-4xl mx-auto mt-8">
      <CardContent className="p-6">
        <div className="flex items-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-primary mr-2"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 3v18h18"/>
            <path d="M18.4 14.5a6 6 0 0 0-7 7"/>
            <path d="m8 17 3.9-4.4 4.8 2.7"/>
            <path d="m13.6 8.3 3.9-4.4 4.8 2.7"/>
          </svg>
          <h2 className="text-xl font-heading font-medium text-neutral-900">Analysis Results</h2>
        </div>
        
        <div className="bg-neutral-100 p-4 rounded-md mb-6">
          <h3 className="font-medium text-neutral-800 mb-2">Summary</h3>
          <p className="text-neutral-700">{results.summary}</p>
        </div>
        
        <h3 className="font-medium text-neutral-800 mb-4">Potential Conditions</h3>
        
        {results.conditions.map((condition, index) => (
          <ConditionCard 
            key={index}
            condition={condition}
            isExpanded={expandedConditions.has(condition.id)}
            onToggleDetails={() => toggleConditionDetails(condition.id)}
          />
        ))}
        
        {/* Next Steps Section */}
        <div className="bg-primary-light bg-opacity-10 p-6 rounded-lg mt-6">
          <h3 className="font-medium text-neutral-900 mb-4 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22a8 8 0 0 1-8-8 12.89 12.89 0 0 1 2-7 10 10 0 0 0 5 1h2a10 10 0 0 0 5-1 12.89 12.89 0 0 1 2 7 8 8 0 0 1-8 8Z"/>
              <path d="M15 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
              <path d="M12 9v4"/>
              <path d="M12 16h.01"/>
            </svg>
            Recommended Next Steps
          </h3>
          
          <ul className="space-y-3">
            <li className="flex">
              <CheckCircleIcon className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
              <span className="text-neutral-800">Consider consulting with a primary care physician to discuss these findings.</span>
            </li>
            <li className="flex">
              <CheckCircleIcon className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
              <span className="text-neutral-800">Monitor your symptoms for changes in severity or new developments.</span>
            </li>
            <li className="flex">
              <CheckCircleIcon className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
              <span className="text-neutral-800">Rest and maintain good hydration while recovering.</span>
            </li>
            <li className="flex">
              <AlertTriangleIcon className="h-5 w-5 text-warning mr-2 flex-shrink-0" />
              <span className="text-neutral-800">Seek immediate medical attention if you develop difficulty breathing, persistent chest pain, or high fever.</span>
            </li>
          </ul>
          
          <div className="mt-6 flex justify-end">
            <Button 
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition flex items-center"
            >
              Find Doctors Near Me <UserSearchIcon className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Medical Disclaimer */}
        <div className="mt-6 p-4 border border-neutral-300 rounded-md bg-neutral-50">
          <h4 className="text-sm font-medium text-neutral-800 mb-2">Important Medical Disclaimer</h4>
          <p className="text-xs text-neutral-700">
            This AI-powered analysis provides preliminary information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read on this application.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-6 flex justify-between">
          <Button 
            variant="outline"
            onClick={onNewAnalysis}
            className="border border-neutral-300 text-neutral-700 px-4 py-2 rounded-md hover:bg-neutral-100 transition flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-1" /> New Analysis
          </Button>
          
          <Button 
            className="bg-accent text-white px-4 py-2 rounded-md hover:bg-accent-dark transition flex items-center"
          >
            <SaveIcon className="h-4 w-4 mr-1" /> Save Results
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface ConditionCardProps {
  condition: Condition;
  isExpanded: boolean;
  onToggleDetails: () => void;
}

function ConditionCard({ condition, isExpanded, onToggleDetails }: ConditionCardProps) {
  const confidenceColor = getConfidenceColor(condition.confidence);
  const confidenceText = getConfidenceText(condition.confidence);
  const confidenceTextClass = getConfidenceTextClass(condition.confidence);
  
  return (
    <div className="mb-6 border border-neutral-200 rounded-lg p-4 hover:shadow-md transition">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
        <h4 className="text-lg font-medium text-neutral-900">{condition.name}</h4>
        <div className="mt-2 md:mt-0">
          <span className={`inline-block ${confidenceTextClass} text-xs px-2 py-1 rounded-full`}>
            {confidenceText}
          </span>
        </div>
      </div>
      
      <div className="confidence-bar mb-4">
        <div 
          className={`confidence-level ${confidenceColor}`} 
          style={{ width: `${condition.confidence}%` }}
        ></div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h5 className="text-sm font-medium text-neutral-800 mb-2">Description</h5>
          <p className="text-sm text-neutral-700">{condition.description}</p>
        </div>
        <div>
          <h5 className="text-sm font-medium text-neutral-800 mb-2">Matching Factors</h5>
          <ul className="text-sm text-neutral-700 list-disc pl-5">
            {condition.matchingFactors.map((factor, index) => (
              <li key={index}>{factor}</li>
            ))}
          </ul>
        </div>
      </div>
      
      <Collapsible open={isExpanded}>
        <Separator className="my-4" />
        
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            onClick={onToggleDetails}
            className="text-primary hover:text-primary-dark text-sm flex items-center p-0"
          >
            <InfoIcon className="h-4 w-4 mr-1" /> 
            {isExpanded ? "Hide Details" : "More Information"}
            <ArrowRightIcon className={`h-4 w-4 ml-1 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="mt-4 text-sm text-neutral-700">
            <h5 className="font-medium text-neutral-800 mb-2">Additional Information</h5>
            <p>{condition.additionalInfo}</p>
            
            {condition.recommendedActions && (
              <>
                <h5 className="font-medium text-neutral-800 mt-4 mb-2">Recommended Actions</h5>
                <ul className="list-disc pl-5">
                  {condition.recommendedActions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
