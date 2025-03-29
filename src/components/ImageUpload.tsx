
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (file: File, base64: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      // Pass file and base64 data to parent
      const base64Data = result.split(',')[1];
      onImageUpload(file, base64Data);
    };
    reader.readAsDataURL(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {!preview ? (
        <div 
          className="image-upload-area h-48"
          onClick={handleClick}
        >
          <Upload className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-gray-500 mb-1">לחץ להעלאת תמונה</p>
          <p className="text-gray-400 text-sm">או גרור לכאן</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden border border-gray-200">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full object-contain max-h-[400px]" 
            />
            <Button 
              variant="outline" 
              size="sm" 
              className="absolute bottom-2 right-2 bg-white/90"
              onClick={handleClick}
            >
              <ImageIcon className="h-4 w-4 mr-1" />
              החלף תמונה
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
