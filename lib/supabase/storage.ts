import { supabase } from './config';

export const STORAGE_BUCKET = 'storage-arte';

export const uploadImage = async (bucket: string, file: File, path: string) => {
  try {
    // Force usage of the correct bucket if a generic category was passed by mistake, 
    // or use the passed bucket if it matches the real one.
    // For this project, we primarily use 'storage-arte'.
    const targetBucket = bucket === 'products' || bucket === 'avatars' ? STORAGE_BUCKET : bucket;

    const { data, error } = await supabase.storage
      .from(targetBucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const getPublicUrl = (bucket: string, path: string) => {
  const targetBucket = bucket === 'products' || bucket === 'avatars' ? STORAGE_BUCKET : bucket;
  
  const { data } = supabase.storage
    .from(targetBucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
};

export const deleteImage = async (bucket: string, path: string) => {
  try {
    const targetBucket = bucket === 'products' || bucket === 'avatars' ? STORAGE_BUCKET : bucket;

    const { error } = await supabase.storage
      .from(targetBucket)
      .remove([path]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};