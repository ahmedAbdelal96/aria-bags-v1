-- Migration: Create private product-files bucket
-- Run this in your Supabase SQL Editor

-- Create private bucket for paid download files
-- This bucket is NOT public - files can only be accessed via signed URLs

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-files',
  'product-files',
  false, -- PRIVATE bucket - not publicly accessible
  104857600, -- 100MB file size limit for product files
  ARRAY['application/pdf', 'application/zip', 'application/x-rar-compressed', 'application/octet-stream',
         'video/mp4', 'video/quicktime', 'audio/mpeg', 'audio/wav', 'image/png', 'image/jpeg',
         'application/vnd.adobe.photoshop', 'application/postscript',
         'application/vnd.sketch', 'application/figma',
         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for product-files bucket

-- Allow authenticated users to upload files (admin uploads)
CREATE POLICY "Admin can upload product files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-files');

-- Only admins and service role can read files (for management)
CREATE POLICY "Admin can read product files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'product-files');

-- Admins can update their own files
CREATE POLICY "Admin can update product files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'product-files');

-- Admins can delete files
CREATE POLICY "Admin can delete product files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product-files');

-- IMPORTANT: Do NOT create a public read policy for product-files
-- These are private files that require signed URLs for access
