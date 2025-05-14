import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onImagesChange: (fileUrls: string[]) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImagesChange }) => {
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; file: File }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Check file types
      const validFiles = acceptedFiles.filter(file => 
        file.type.startsWith('image/')
      );

      // Check file sizes (5MB max)
      const validSizeFiles = validFiles.filter(file => file.size <= 5 * 1024 * 1024);
      
      if (validSizeFiles.length !== acceptedFiles.length) {
        toast({
          title: "Some files were too large",
          description: "Maximum file size is 5MB",
          variant: "destructive",
        });
      }

      if (validFiles.length !== acceptedFiles.length) {
        toast({
          title: "Some files were rejected",
          description: "Only image files are allowed",
          variant: "destructive",
        });
      }

      if (validSizeFiles.length === 0) return;

      // Simulate file upload with a progress indicator
      setIsUploading(true);
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          
          // Process the files (in a real app, this would happen after actual upload)
          const newImages = validSizeFiles.map(file => ({
            url: URL.createObjectURL(file),
            file
          }));
          
          setUploadedImages(prevImages => [...prevImages, ...newImages]);
          onImagesChange([...uploadedImages, ...newImages].map(img => img.url));
        }
      }, 200);
    },
    [uploadedImages, onImagesChange, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.heic']
    },
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const removeImage = (indexToRemove: number) => {
    setUploadedImages(prev => {
      const filtered = prev.filter((_img, index) => index !== indexToRemove);
      onImagesChange(filtered.map(img => img.url));
      return filtered;
    });
  };

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-neutral-300"
        }`}
      >
        <input {...getInputProps()} data-testid="file-input" />
        
        {uploadedImages.length === 0 && !isUploading && (
          <div className="flex flex-col items-center">
            <span className="material-icons text-neutral-400 text-4xl mb-2">cloud_upload</span>
            <p className="text-neutral-600 mb-2">
              {isDragActive ? "Drop your images here" : "Drag and drop your images here"}
            </p>
            <p className="text-neutral-500 text-xs mb-3">or</p>
            <button
              type="button"
              className="px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              Browse Files
            </button>
            <p className="text-xs text-neutral-500 mt-3">Supported formats: JPG, PNG, HEIC - Max size: 5MB</p>
          </div>
        )}
        
        {isUploading && (
          <div className="mt-4">
            <Progress value={uploadProgress} className="h-1.5" />
            <p className="text-xs text-neutral-500 mt-1">Uploading... {uploadProgress}%</p>
          </div>
        )}
      </div>
      
      {uploadedImages.length > 0 && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-3 justify-start">
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.url}
                  alt={`Uploaded symptom image ${index + 1}`}
                  className="w-[100px] h-[100px] object-cover rounded-lg border border-neutral-300"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="absolute -top-2 -right-2 bg-accent text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="material-icons text-sm">close</span>
                </button>
              </div>
            ))}
            
            {/* Add more button if there are images */}
            <div 
              className="w-[100px] h-[100px] border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                const input = document.querySelector('input[data-testid="file-input"]') as HTMLInputElement;
                if (input) input.click();
              }}
            >
              <span className="material-icons text-neutral-400">add</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
