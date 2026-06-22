'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { Upload, X, FileIcon, AlertCircle, Check, Loader2 } from 'lucide-react';

interface ProductFileUploadProps {
  value?: string | null;
  onChange: (path: string) => void;
  onFileSizeChange?: (size: number) => void;
  productId?: string;
  bucketName?: string;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/zip',
  'application/x-rar-compressed',
  'application/octet-stream',
  'video/mp4',
  'video/quicktime',
  'audio/mpeg',
  'audio/wav',
  'image/png',
  'image/jpeg',
  'application/vnd.adobe.photoshop',
  'application/postscript',
  'application/vnd.sketch',
  'application/figma',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const ACCEPTED_EXTENSIONS = [
  '.pdf', '.zip', '.rar', '.mp4', '.mov', '.mp3', '.wav',
  '.png', '.jpg', '.jpeg', '.psd', '.ai', '.eps', '.sketch', '.fig',
  '.docx', '.xlsx', '.pptx',
];

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileExtension(filename: string): string {
  return '.' + filename.split('.').pop()?.toLowerCase();
}

export function ProductFileUpload({
  value,
  onChange,
  onFileSizeChange,
  productId,
  bucketName = 'product-files',
}: ProductFileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(false);

    const fileExt = getFileExtension(file.name);
    const isValidType = ACCEPTED_EXTENSIONS.includes(fileExt.toLowerCase());

    if (!isValidType) {
      setError(`Invalid file type. Allowed: ${ACCEPTED_EXTENSIONS.join(', ')}`);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`);
      return;
    }

    setUploading(true);
    setUploadProgress('Preparing upload...');

    try {
      const supabase = createClient();

      const timestamp = Date.now();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const folderPath = productId ? `products/${productId}` : 'products/temp';
      const filePath = `${folderPath}/${timestamp}-${safeFileName}`;

      setUploadProgress('Uploading...');

      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      setUploadProgress('Processing...');

      if (onFileSizeChange) {
        onFileSizeChange(file.size);
      }

      onChange(filePath);
      setSuccess(true);
      setUploadProgress('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploadProgress('');
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
      await supabase.storage.from(bucketName).remove([value]);
    } catch (err) {
      console.error('Error removing file:', err);
    }

    onChange('');
    if (onFileSizeChange) {
      onFileSizeChange(0);
    }
  };

  const getFileName = (path: string): string => {
    return path.split('/').pop() || path;
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Digital Product File</label>

      {value ? (
        <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-slate-50">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <FileIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{getFileName(value)}</p>
              <p className="text-xs text-muted-foreground">Private file stored securely</p>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {success && (
              <span className="flex items-center text-green-600 text-xs">
                <Check className="h-4 w-4 mr-1" />
                Uploaded
              </span>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed border-border bg-slate-50 cursor-pointer transition-colors hover:border-primary hover:bg-slate-100 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <div className="flex flex-col items-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <span className="text-xs">{uploadProgress}</span>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Click to upload file</span>
              <span className="text-xs text-muted-foreground mt-1">
                PDF, ZIP, RAR, MP4, PSD, AI, DOCX, XLSX (Max {formatFileSize(MAX_FILE_SIZE)})
              </span>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS.join(',')}
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
        This file is stored privately. Only paid customers can download after purchase.
      </p>
    </div>
  );
}
