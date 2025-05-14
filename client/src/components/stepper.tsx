import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex items-center justify-center max-w-3xl mx-auto">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "step-circle",
                currentStep > index + 1 && "completed",
                currentStep === index + 1 && "active"
              )}
            >
              {currentStep > index + 1 ? (
                <CheckIcon className="h-3 w-3" />
              ) : (
                index + 1
              )}
            </div>
            <span className="text-xs mt-2 text-neutral-700">{step}</span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "step-connector flex-grow mx-2",
                currentStep > index + 1 && "active"
              )}
            ></div>
          )}
        </div>
      ))}
    </div>
  );
}
