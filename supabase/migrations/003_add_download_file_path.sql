-- Migration: Add download_file_path for private product files
-- Run this in your Supabase SQL Editor

-- Add download_file_path column to products table
-- This stores the private storage path for paid download files
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS download_file_path TEXT;

-- Add file_size_bytes for accurate file size (separate from cover image size)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT;

-- Add is_paid_product flag to distinguish free vs paid products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS is_paid_product BOOLEAN DEFAULT TRUE;

-- Add paid_product file metadata tracking
COMMENT ON COLUMN public.products.download_file_path IS 'Private storage path for paid download files (not a public URL)';
COMMENT ON COLUMN public.products.file_size_bytes IS 'File size in bytes for the paid download file';
COMMENT ON COLUMN public.products.is_paid_product IS 'Whether this product requires purchase to download';
