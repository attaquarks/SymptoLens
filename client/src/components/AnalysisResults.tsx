import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SymptomAnalysis, PotentialCondition } from '@shared/schema';
import { BrainCircuit, AlertCircle, InfoIcon, Activity, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AnalysisResultsProps {
  analysis: SymptomAnalysis | null;
  loading?: boolean;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analysis, loading = false }) => {
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5 text-primary animate-pulse" />
            Analyzing your symptoms...
          </CardTitle>
          <CardDescription>
            Our AI is processing your symptom information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="h-20 bg-muted/30 rounded-md animate-pulse"></div>
            <div className="h-12 w-3/4 bg-muted/30 rounded-md animate-pulse"></div>
            <div className="h-12 w-2/3 bg-muted/30 rounded-md animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis || !analysis.potentialConditions) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="mr-2 h-5 w-5 text-destructive" />
            No Analysis Available
          </CardTitle>
          <CardDescription>
            Please submit your symptoms to receive an analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Enter your symptoms and relevant details to get a personalized analysis.</p>
        </CardContent>
      </Card>
    );
  }

  // Group conditions by relevance
  const highRelevance = analysis.potentialConditions.filter(c => c.relevance === 'high');
  const mediumRelevance = analysis.potentialConditions.filter(c => c.relevance === 'medium');
  const lowRelevance = analysis.potentialConditions.filter(c => c.relevance === 'low');

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'medium': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    if (!urgency) return null;
    
    let label = '';
    let color = '';
    
    if (urgency.includes('high')) {
      label = 'High Urgency';
      color = 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
    } else if (urgency.includes('medium')) {
      label = 'Medium Urgency';
      color = 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300';
    } else if (urgency.includes('low')) {
      label = 'Low Urgency';
      color = 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    } else {
      return null;
    }
    
    return <Badge className={`mr-2 ${color}`}>{label}</Badge>;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BrainCircuit className="mr-2 h-5 w-5 text-primary" />
          Symptom Analysis Results
        </CardTitle>
        <CardDescription>
          Based on your provided symptoms and medical knowledge
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Analysis summary */}
        <div className="bg-secondary/20 p-4 rounded-lg">
          <h3 className="font-medium text-sm text-muted-foreground mb-2 flex items-center">
            <InfoIcon className="h-4 w-4 mr-1" /> SUMMARY
          </h3>
          <p className="text-sm">{analysis.disclaimer}</p>
        </div>

        {/* Potential conditions */}
        <div>
          <h3 className="font-medium text-lg mb-4">Potential Conditions</h3>
          
          {highRelevance.length > 0 && (
            <>
              <h4 className="text-sm font-medium mb-2 text-muted-foreground">Higher Association</h4>
              <div className="space-y-3 mb-6">
                {highRelevance.map((condition, idx) => (
                  <ConditionCard key={idx} condition={condition} />
                ))}
              </div>
            </>
          )}
          
          {mediumRelevance.length > 0 && (
            <>
              <h4 className="text-sm font-medium mb-2 text-muted-foreground">Moderate Association</h4>
              <div className="space-y-3 mb-6">
                {mediumRelevance.map((condition, idx) => (
                  <ConditionCard key={idx} condition={condition} />
                ))}
              </div>
            </>
          )}
          
          {lowRelevance.length > 0 && (
            <>
              <h4 className="text-sm font-medium mb-2 text-muted-foreground">Lower Association</h4>
              <div className="space-y-3">
                {lowRelevance.map((condition, idx) => (
                  <ConditionCard key={idx} condition={condition} />
                ))}
              </div>
            </>
          )}
        </div>
        
        <Separator />
        
        {/* Next steps */}
        <div>
          <h3 className="font-medium text-lg mb-4">Recommended Next Steps</h3>
          <div className="space-y-4">
            {analysis.nextSteps.map((step, idx) => (
              <Card key={idx} className="border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                  {step.suggestions && step.suggestions.length > 0 && (
                    <ul className="space-y-2">
                      {step.suggestions.map((suggestion, sidx) => (
                        <li key={sidx} className="text-sm flex items-start">
                          <ArrowRight className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <p className="text-xs text-muted-foreground">
          <AlertCircle className="h-3 w-3 inline mr-1" />
          This analysis is based on the symptoms you provided and is for educational purposes only.
          It should not replace professional medical advice or diagnosis.
        </p>
      </CardFooter>
    </Card>
  );
};

const ConditionCard: React.FC<{ condition: PotentialCondition }> = ({ condition }) => {
  const relevanceClass = {
    'high': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    'medium': 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
    'low': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
  }[condition.relevance || 'low'];

  return (
    <Card className="border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span>{condition.name}</span>
          <div>
            {condition.urgency && (
              <Badge className="mr-2 bg-secondary">{condition.urgency.toUpperCase().replace('-', ' ')}</Badge>
            )}
            <Badge className={relevanceClass}>{condition.relevance.toUpperCase()} ASSOCIATION</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm mb-3">{condition.description}</p>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="matching-symptoms">
            <AccordionTrigger className="text-sm py-2">Matching Symptoms</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {condition.symptoms?.map((symptom, idx) => (
                  <div key={idx} className="flex items-center text-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-primary" />
                    {symptom}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          {condition.recommendation && (
            <AccordionItem value="recommendations">
              <AccordionTrigger className="text-sm py-2">Recommendations</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm">{condition.recommendation}</p>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default AnalysisResults;