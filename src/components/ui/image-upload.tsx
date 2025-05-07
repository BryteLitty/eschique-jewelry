import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from './button';
import { cn } from '../../lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onError?: (error: string) => void;
  folder: string;
  className?: string;
}

export function ImageUpload({ value, onChange, onError, folder, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      onChange(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!value) return;

    try {
      // Extract file path from URL
      const filePath = value.split('/').pop();
      if (!filePath) return;

      // Delete from Supabase Storage
      const { error } = await supabase.storage
        .from('products')
        .remove([`${folder}/${filePath}`]);

      if (error) throw error;

      onChange('');
    } catch (error) {
      console.error('Error removing image:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to remove image');
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            id="image-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="image-upload"
            className={cn(
              "flex items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer",
              "hover:border-primary/50 transition-colors",
              isUploading && "opacity-50 cursor-not-allowed"
            )}
          >
            {value ? (
              <img
                src={value}
                alt="Uploaded"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500">
                <Upload className="w-8 h-8 mb-2" />
                <span className="text-sm">Upload Image</span>
              </div>
            )}
          </label>
        </div>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            className="text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      {isUploading && (
        <p className="text-sm text-gray-500">Uploading...</p>
      )}
    </div>
  );
} 