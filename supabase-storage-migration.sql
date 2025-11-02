-- Create Storage Bucket for Property Images
-- Run this SQL in your Supabase SQL Editor

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for the bucket
-- Allow authenticated users to upload images to the 'properties' folder
CREATE POLICY "Users can upload property images" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-images' AND
  (storage.foldername(name))[1] = 'properties'::text
);

-- Allow anyone to view images (public bucket)
CREATE POLICY "Anyone can view property images" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'property-images');

-- Allow authenticated users to update images in the 'properties' folder
CREATE POLICY "Users can update property images" ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'property-images' AND
  (storage.foldername(name))[1] = 'properties'::text
)
WITH CHECK (
  bucket_id = 'property-images' AND
  (storage.foldername(name))[1] = 'properties'::text
);

-- Allow authenticated users to delete images in the 'properties' folder
CREATE POLICY "Users can delete property images" ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-images' AND
  (storage.foldername(name))[1] = 'properties'::text
);

