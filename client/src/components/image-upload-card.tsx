import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeftIcon, RefreshCwIcon, TrashIcon, UploadCloudIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";

interface ImageUploadCardProps {
  imageFile: File | null;
  imageDescription: string;
  setImageFile: (file: File | null) => void;
  setImageDescription: (description: string) => void;
  onBack: () => void;
  onAnalyze: () => void;
}

export default function ImageUploadCard({
  imageFile,
  imageDescription,
  setImageFile,
  setImageDescription,
  onBack,
  onAnalyze,
}: ImageUploadCardProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setImageFile(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [setImageFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.heic']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1
  });

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setImageDescription(e.target.value);
  };

  return (
    <Card className="bg-white rounded-lg shadow-md">
      <CardContent className="p-6">
        <h2 className="text-xl font-heading font-medium mb-4 text-neutral-900">
          Upload Relevant Images
        </h2>
        <p className="text-neutral-700 mb-6">
          If applicable, upload clear images of visible symptoms (rash, swelling, discoloration, etc.). 
          This helps our AI provide better analysis.
        </p>

        <div 
          className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center mb-6"
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          
          {!imageFile ? (
            <div>
              <UploadCloudIcon className="h-12 w-12 text-neutral-400 mx-auto mb-2" />
              <p className="text-neutral-700 mb-2">
                {isDragActive 
                  ? "Drop the image here..." 
                  : "Drag and drop image here or"}
              </p>
              <Button 
                type="button" 
                className="bg-primary-light text-white px-4 py-2 rounded-md hover:bg-primary transition"
              >
                Browse Files
              </Button>
              <p className="text-xs text-neutral-500 mt-2">
                Supports: JPG, PNG, HEIC | Max size: 10MB
              </p>
            </div>
          ) : (
            <div>
              {previewUrl && (
                <img
                  src={previewUrl}
                  className="max-h-48 mx-auto mb-3 rounded-md object-contain"
                  alt="Uploaded symptom"
                />
              )}
              <div className="flex justify-center space-x-2">
                <Button 
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                  className="flex items-center"
                >
                  <TrashIcon className="h-4 w-4 mr-1" /> Remove
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-neutral-200 text-neutral-700 hover:bg-neutral-300 flex items-center"
                >
                  <RefreshCwIcon className="h-4 w-4 mr-1" /> Replace
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <Label 
            htmlFor="imageDescription" 
            className="block text-sm font-medium text-neutral-700 mb-2"
          >
            Image Description (Optional)
          </Label>
          <Textarea
            id="imageDescription"
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            rows={2}
            placeholder="Describe what the image shows (e.g., 'Rash on left forearm, appeared yesterday')"
            value={imageDescription}
            onChange={handleDescriptionChange}
          />
        </div>

        <div className="flex justify-between">
          <Button 
            type="button" 
            variant="outline"
            onClick={onBack}
            className="border border-neutral-300 text-neutral-700 px-4 py-2 rounded-md hover:bg-neutral-100 transition flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back
          </Button>

          <Button 
            type="button" 
            onClick={onAnalyze}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition flex items-center"
          >
            Analyze 
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="ml-1 h-4 w-4"
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
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
