import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { symptomFormSchema, SymptomAnalysis } from '@shared/schema';
import { Stethoscope, Upload, Clock, PieChart, MapPin, Camera, SendHorizontal, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface SymptomFormProps {
  onSubmitSuccess: (analysis: SymptomAnalysis) => void;
  onSubmit?: () => void;
}

export const SymptomForm: React.FC<SymptomFormProps> = ({ onSubmitSuccess, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(symptomFormSchema),
    defaultValues: {
      description: '',
      duration: '',
      severity: '',
      bodyLocation: '',
      uploadedImages: []
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: File[] = [];
    const newImageUrls: string[] = [];

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Only accept images
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Only image files are allowed",
          variant: "destructive"
        });
        continue;
      }
      
      // Create preview URL
      const imageUrl = URL.createObjectURL(file);
      
      newFiles.push(file);
      newImageUrls.push(imageUrl);
    }

    // Update state
    setImageFiles([...imageFiles, ...newFiles]);
    setUploadedImages([...uploadedImages, ...newImageUrls]);
    
    // Update form
    form.setValue('uploadedImages', [...uploadedImages, ...newImageUrls]);
  };

  const removeImage = (index: number) => {
    const newImages = [...uploadedImages];
    const newFiles = [...imageFiles];
    
    // Release the object URL to avoid memory leaks
    URL.revokeObjectURL(newImages[index]);
    
    // Remove the image and file from arrays
    newImages.splice(index, 1);
    newFiles.splice(index, 1);
    
    setUploadedImages(newImages);
    setImageFiles(newFiles);
    
    // Update form
    form.setValue('uploadedImages', newImages);
  };

  const handleSubmit = async (data: any) => {
    if (onSubmit) {
      onSubmit();
    }
    
    setIsSubmitting(true);
    
    try {
      // First, upload any images
      let uploadedImagePaths: string[] = [];
      
      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach(file => {
          formData.append('images', file);
        });
        
        try {
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });
          
          if (!response.ok) {
            throw new Error('Failed to upload images');
          }
          
          const result = await response.json();
          uploadedImagePaths = result.files.map((file: any) => file.path);
        } catch (error) {
          console.error('Error uploading images:', error);
          toast({
            title: "Image upload failed",
            description: "Could not upload images, but proceeding with text analysis",
            variant: "destructive"
          });
        }
      }
      
      // Now submit the symptom data with image paths
      const analysisData = {
        ...data,
        uploadedImages: uploadedImagePaths
      };
      
      // Create symptom record and get analysis
      const response = await apiRequest(
        'POST',
        '/api/symptoms',
        analysisData
      );
      
      if (response) {
        onSubmitSuccess(response);
        toast({
          title: "Analysis complete",
          description: "Your symptoms have been analyzed successfully",
        });
        
        // Reset form
        form.reset();
        setUploadedImages([]);
        setImageFiles([]);
      }
    } catch (error) {
      console.error('Error submitting symptoms:', error);
      toast({
        title: "Submission failed",
        description: "There was an error analyzing your symptoms. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Stethoscope className="mr-2 h-5 w-5 text-primary" />
          Symptom Analyzer
        </CardTitle>
        <CardDescription>
          Describe your symptoms for AI-powered analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Description field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Symptom Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your symptoms in detail. What are you experiencing? When did it start? Is it constant or intermittent?" 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    The more details you provide, the more accurate the analysis will be.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Duration field */}
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" /> Duration
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., 3 days, 2 weeks" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Severity field */}
              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <PieChart className="mr-1 h-4 w-4" /> Severity
                    </FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
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
              
              {/* Body location field */}
              <FormField
                control={form.control}
                name="bodyLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <MapPin className="mr-1 h-4 w-4" /> Body Location
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., chest, left arm, lower back" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Image upload */}
            <div className="space-y-4">
              <FormLabel className="flex items-center">
                <Camera className="mr-1 h-4 w-4" /> Upload Images (Optional)
              </FormLabel>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  id="image-upload"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <label 
                  htmlFor="image-upload" 
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Drag and drop or click to upload</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload photos of visible symptoms (rashes, swelling, etc.)
                  </p>
                </label>
              </div>
              
              {/* Preview uploaded images */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                  {uploadedImages.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={imageUrl} 
                        alt={`Uploaded symptom ${index + 1}`} 
                        className="h-24 w-full object-cover rounded-md border" 
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Submit button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <SendHorizontal className="mr-2 h-4 w-4" />
                  Analyze Symptoms
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-start text-xs text-muted-foreground">
        <p>
          Your information is processed using secure AI technology to provide educational insights only.
        </p>
        <p className="mt-1">
          This is not a medical diagnosis. Always consult with a healthcare professional.
        </p>
      </CardFooter>
    </Card>
  );
};

export default SymptomForm;