import { supabase } from './config';

const BUCKET_NAME = 'products';

/**
 * Uploads an image to Supabase Storage.
 * Handles file naming and returns the public URL.
 */
export const uploadProductImage = async (file: File, folder: string = 'general'): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Deletes an image from Supabase Storage given its full URL or path.
 */
export const deleteProductImage = async (pathOrUrl: string) => {
  try {
    // Extract path if full URL is provided
    let path = pathOrUrl;
    if (pathOrUrl.includes(`${BUCKET_NAME}/`)) {
        path = pathOrUrl.split(`${BUCKET_NAME}/`).pop() || '';
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};