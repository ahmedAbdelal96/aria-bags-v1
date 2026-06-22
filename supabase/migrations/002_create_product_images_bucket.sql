-- Migration: Create product-images storage bucket
-- Run this in your Supabase SQL Editor
-- Note: Buckets are typically created via Supabase Dashboard > Storage, but can also be done via SQL

-- Insert storage.buckets record if not exists
-- This creates the bucket metadata
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true, -- public bucket
  5242880, -- 5MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'] -- allowed types
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for the bucket
-- Public can read images
CREATE POLICY "Public read product images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Authenticated users can upload images
CREATE POLICY "Authenticated can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Users can update their own images
CREATE POLICY "Users can update own product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Note: For admin-only uploads, run this after creating admin users
-- Or manage bucket access through Supabase Dashboard > Storage > Policies
