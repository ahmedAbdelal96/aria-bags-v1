'use client';

import Image from 'next/image';
import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload, X, AlertCircle, Check } from 'lucide-react';

interface ProductImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  bucketName?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export function ProductImageUpload({
  value,
  onChange,
  bucketName = 'product-images',
}: ProductImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(false);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Please select an image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const supabase = createClient();

      const timestamp = Date.now();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `products/${timestamp}-${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);

      if (!urlData.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      onChange(urlData.publicUrl);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (!value) return;

    try {
      const supabase = createClient();
      const urlObj = new URL(value);
      const pathParts = urlObj.pathname.split('/');
      const filePath = pathParts.slice(pathParts.indexOf(bucketName) + 1).join('/');

      if (filePath) {
        await supabase.storage.from(bucketName).remove([filePath]);
      }
    } catch (err) {
      console.error('Error removing file:', err);
    }

    onChange('');
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Cover image</label>

      {value ? (
        <div className="relative inline-block">
          <div className="relative w-48 h-48 rounded-lg overflow-hidden border border-border">
            <Image
              src={value}
              alt="Product preview"
              fill
              sizes="192px"
              className="object-cover"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 flex items-center justify-center h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          {success && (
            <div className="absolute -bottom-8 left-0 flex items-center text-green-600 text-xs">
              <Check className="h-3 w-3 mr-1" />
              Uploaded
            </div>
          )}
        </div>
      ) : (
        <div
          className={`flex flex-col items-center justify-center w-48 h-48 rounded-lg border-2 border-dashed border-border bg-slate-50 cursor-pointer transition-colors hover:border-primary hover:bg-slate-100 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <div className="flex flex-col items-center text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
              <span className="text-xs">Uploading...</span>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-xs text-muted-foreground">Click to upload</span>
              <span className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF, WebP</span>
              <span className="text-xs text-muted-foreground">Max 5MB</span>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Upload a handbag cover image for the storefront and admin previews.
      </p>
    </div>
  );
}
