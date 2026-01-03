import { supabase } from './supabase';

/**
 * Storage helper functions for file operations
 */

export const storage = {
  /**
   * Upload a file to Supabase Storage
   */
  async uploadFile(
    bucket: string,
    path: string,
    file: File | Blob,
    options?: {
      cacheControl?: string;
      contentType?: string;
      upsert?: boolean;
    }
  ): Promise<{ path: string; fullPath: string }> {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: options?.cacheControl || '3600',
      contentType: options?.contentType || file.type,
      upsert: options?.upsert || false,
    });

    if (error) throw error;
    return { path: data.path, fullPath: `${bucket}/${data.path}` };
  },

  /**
   * Get a public URL for a file (if bucket is public)
   */
  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Get a signed URL for a file (for private buckets)
   */
  async getSignedUrl(
    bucket: string,
    path: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
    if (error) throw error;
    return data.signedUrl;
  },

  /**
   * Delete a file from storage
   */
  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  },

  /**
   * Delete multiple files from storage
   */
  async deleteFiles(bucket: string, paths: string[]): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove(paths);
    if (error) throw error;
  },

  /**
   * List files in a bucket/folder
   */
  async listFiles(bucket: string, folder?: string): Promise<string[]> {
    const { data, error } = await supabase.storage.from(bucket).list(folder || '');
    if (error) throw error;
    return data.map((file) => file.name);
  },

  /**
   * Check if a bucket exists
   */
  async bucketExists(bucket: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage.from(bucket).list('', { limit: 1 });
      // If we can list (even if empty), bucket exists
      // If error is "not found" or similar, bucket doesn't exist
      if (error) {
        if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
          return false;
        }
        throw error;
      }
      return true;
    } catch (error: any) {
      // If error indicates bucket doesn't exist, return false
      if (error?.message?.includes('not found') || error?.message?.includes('does not exist')) {
        return false;
      }
      // For other errors, assume bucket might exist but we can't verify
      // Return true to avoid blocking operations
      return true;
    }
  },
};

