import { supabase } from './supabase';
import { storage } from './storage';

export interface Resource {
  id: string;
  title: string;
  description?: string;
  file_path?: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  category: string;
  created_by: string;
  created_by_name: string;
  created_by_image?: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Load all resources from Supabase
 */
export const loadResources = async (): Promise<Resource[]> => {
  try {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Resource[];
  } catch (error) {
    console.error('Error loading resources:', error);
    throw error;
  }
};

/**
 * Create a new resource
 */
export const createResource = async (
  resourceData: {
    title: string;
    description?: string;
    file_path?: string;
    file_name?: string;
    file_size?: number;
    mime_type?: string;
    category: string;
    created_by: string;
    created_by_name: string;
    created_by_image?: string;
  }
): Promise<Resource> => {
  try {
    const { data, error } = await supabase
      .from('resources')
      .insert({
        title: resourceData.title,
        description: resourceData.description || null,
        file_path: resourceData.file_path || null,
        file_name: resourceData.file_name || null,
        file_size: resourceData.file_size || null,
        mime_type: resourceData.mime_type || null,
        category: resourceData.category,
        created_by: resourceData.created_by,
        created_by_name: resourceData.created_by_name,
        created_by_image: resourceData.created_by_image || null,
      } as any)
      .select()
      .single();

    if (error) throw error;
    return data as Resource;
  } catch (error) {
    console.error('Error creating resource:', error);
    throw error;
  }
};

/**
 * Update a resource
 */
export const updateResource = async (
  resourceId: string,
  updates: {
    title?: string;
    description?: string;
    file_path?: string;
    file_name?: string;
    file_size?: number;
    mime_type?: string;
    category?: string;
  }
): Promise<Resource> => {
  try {
    const { data, error } = await (supabase
      .from('resources') as any)
      .update(updates)
      .eq('id', resourceId)
      .select()
      .single();

    if (error) throw error;
    return data as Resource;
  } catch (error) {
    console.error('Error updating resource:', error);
    throw error;
  }
};

/**
 * Delete a resource and its associated file
 */
export const deleteResource = async (resourceId: string, filePath?: string): Promise<void> => {
  try {
    // Delete file from storage if it exists
    if (filePath) {
      try {
        await storage.deleteFile('resources', filePath);
      } catch (fileError) {
        console.warn('Error deleting file from storage:', fileError);
        // Continue with resource deletion even if file deletion fails
      }
    }

    // Delete resource record
    const { error } = await supabase.from('resources').delete().eq('id', resourceId);
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting resource:', error);
    throw error;
  }
};

/**
 * Upload a file to Supabase Storage and return the file path
 */
export const uploadResourceFile = async (
  file: File,
  userId: string
): Promise<{ path: string; fileName: string; fileSize: number; mimeType: string }> => {
  try {
    // Check if bucket exists
    const bucketExists = await storage.bucketExists('resources');
    if (!bucketExists) {
      const error = new Error('Storage bucket "resources" not found. Please create it in Supabase Storage settings. See RESOURCES_SETUP_COMPLETE.md for instructions.');
      (error as any).code = 'BUCKET_NOT_FOUND';
      throw error;
    }

    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${userId}/${timestamp}-${sanitizedFileName}`;

    await storage.uploadFile('resources', filePath, file, {
      contentType: file.type,
      upsert: false,
    });

    return {
      path: filePath,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Get a signed URL for a resource file
 */
export const getResourceFileUrl = async (filePath: string): Promise<string> => {
  try {
    return await storage.getSignedUrl('resources', filePath, 3600); // 1 hour expiry
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
};

