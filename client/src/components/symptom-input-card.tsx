import { Card, CardContent } from "@/components/ui/card";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from "react-hook-form";
import { SymptomFormValues } from "@/lib/hooks/use-symptom-analysis";

interface SymptomInputCardProps {
  symptomsForm: UseFormReturn<SymptomFormValues>;
  onContinue: () => void;
}

export default function SymptomInputCard({ 
  symptomsForm, 
  onContinue 
}: SymptomInputCardProps) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = symptomsForm;

  const onSubmit = () => {
    onContinue();
  };

  return (
    <Card className="bg-white rounded-lg shadow-md">
      <CardContent className="p-6">
        <h2 className="text-xl font-heading font-medium mb-4 text-neutral-900">
          Describe Your Symptoms
        </h2>
        <p className="text-neutral-700 mb-6">
          Please describe all your symptoms in detail. Include when they started, severity, 
          and any other relevant information.
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-6">
            <Label 
              htmlFor="symptomsText" 
              className="block text-sm font-medium text-neutral-700 mb-2"
            >
              Symptoms Description
            </Label>
            <Textarea
              id="symptomsText"
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              rows={5}
              placeholder="Example: I've had a persistent dry cough for the past 3 days, along with a mild fever (around 100°F) and occasional headaches..."
              {...register("description", { 
                required: "Symptom description is required",
                minLength: {
                  value: 20,
                  message: "Please provide at least 20 characters for better analysis"
                }
              })}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
            )}
            <div className="mt-1 text-sm text-neutral-500">
              Min. 20 characters required for better analysis
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <Label 
                htmlFor="ageInput" 
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Age
              </Label>
              <Input
                type="number"
                id="ageInput"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="25"
                {...register("age", { 
                  required: "Age is required",
                  min: {
                    value: 0,
                    message: "Age must be a positive number"
                  },
                  max: {
                    value: 120,
                    message: "Age must be less than 120"
                  }
                })}
              />
              {errors.age && (
                <p className="mt-1 text-sm text-destructive">{errors.age.message}</p>
              )}
            </div>
            <div>
              <Label 
                htmlFor="genderSelect" 
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Gender
              </Label>
              <Select
                value={watch("gender")}
                onValueChange={(value) => setValue("gender", value)}
              >
                <SelectTrigger id="genderSelect" className="w-full">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="mt-1 text-sm text-destructive">{errors.gender.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition flex items-center"
            >
              Continue <ArrowRightIcon className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
