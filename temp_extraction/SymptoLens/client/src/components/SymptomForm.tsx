import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ImageUpload from "./ImageUpload";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SymptomAnalysis } from "@shared/schema";

// Create a schema for the form with validation
const formSchema = z.object({
  description: z.string().min(10, "Please provide a more detailed description of your symptoms"),
  duration: z.string().optional(),
  severity: z.string().optional(),
  bodyLocation: z.string().optional(),
  uploadedImages: z.array(z.string()).optional().default([]),
});

type FormValues = z.infer<typeof formSchema>;

interface SymptomFormProps {
  onAnalysisComplete: (analysis: SymptomAnalysis) => void;
}

const SymptomForm: React.FC<SymptomFormProps> = ({ onAnalysisComplete }) => {
  const { toast } = useToast();
  const [charCount, setCharCount] = useState(0);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      duration: "",
      severity: "",
      bodyLocation: "",
      uploadedImages: [],
    },
  });
  
  const submitMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest('POST', '/api/symptoms', {
        description: data.description,
        duration: data.duration,
        severity: data.severity,
        bodyLocation: data.bodyLocation,
        uploadedImages: data.uploadedImages,
      });
      return response.json();
    },
    onSuccess: (data: SymptomAnalysis) => {
      onAnalysisComplete(data);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to analyze symptoms. Please try again.",
        variant: "destructive",
      });
      console.error("Error analyzing symptoms:", error);
    },
  });

  const onSubmit = (values: FormValues) => {
    submitMutation.mutate(values);
  };

  // Handle description input change to update character count
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharCount(e.target.value.length);
    form.setValue("description", e.target.value);
  };

  // Handle image uploads
  const handleImagesChange = (fileUrls: string[]) => {
    form.setValue("uploadedImages", fileUrls);
  };

  return (
    <div className="bg-white rounded-xl shadow-card p-6">
      <h2 className="text-xl font-semibold text-neutral-800 mb-6 flex items-center">
        <span className="material-icons text-primary mr-2">description</span>
        Describe Your Symptoms
      </h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-neutral-700">
                  What symptoms are you experiencing?
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your symptoms in detail (e.g., throbbing headache on right side, blurry vision)"
                    className="w-full rounded-lg border-neutral-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20 transition duration-150 ease-in-out resize-none"
                    rows={4}
                    {...field}
                    onChange={handleDescriptionChange}
                  />
                </FormControl>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-neutral-500">Be as detailed as possible</span>
                  <span className="text-xs text-neutral-500">{charCount}/1000</span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Duration</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full rounded-lg border-neutral-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20 transition duration-150 ease-in-out">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                      <SelectItem value="years">Years</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Severity</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full rounded-lg border-neutral-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20 transition duration-150 ease-in-out">
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="bodyLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Body Location</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full rounded-lg border-neutral-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20 transition duration-150 ease-in-out">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="head">Head</SelectItem>
                      <SelectItem value="chest">Chest</SelectItem>
                      <SelectItem value="abdomen">Abdomen</SelectItem>
                      <SelectItem value="back">Back</SelectItem>
                      <SelectItem value="arms">Arms</SelectItem>
                      <SelectItem value="legs">Legs</SelectItem>
                      <SelectItem value="skin">Skin</SelectItem>
                      <SelectItem value="general">General/Whole body</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="uploadedImages"
            render={() => (
              <FormItem>
                <FormLabel className="text-md font-medium text-neutral-700 mb-2 flex items-center">
                  <span className="material-icons text-primary mr-2">add_photo_alternate</span>
                  Upload Related Images (Optional)
                </FormLabel>
                <p className="text-sm text-neutral-500 mb-3">
                  Upload images of visual symptoms (e.g., skin conditions, eye appearance). 
                  Our multimodal AI system will analyze both your text description and these images for a more comprehensive assessment.
                </p>
                <FormControl>
                  <ImageUpload onImagesChange={handleImagesChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="sm:order-2">
              <Button
                type="submit"
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 focus:ring-primary/30 focus:ring-offset-2 text-white font-medium py-2.5 px-6 rounded-lg transition duration-150 ease-in-out flex items-center justify-center"
                disabled={submitMutation.isPending}
              >
                <span className="material-icons mr-2">search</span>
                {submitMutation.isPending ? "Analyzing..." : "Analyze Symptoms"}
              </Button>
            </div>
            <div className="text-sm text-neutral-500 sm:order-1">
              <p>By submitting, you agree to our <a href="#" className="text-primary hover:underline">Terms</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a></p>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SymptomForm;
