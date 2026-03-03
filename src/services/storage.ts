import { getSupabaseClient } from '@/config/supabase';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  fileName?: string;
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` };
  }

  // Check MIME type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { valid: false, error: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` };
  }

  // Check extension
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: `Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` };
  }

  return { valid: true };
}

export function sanitizeFileName(fileName: string): string {
  // Remove path traversal, special chars, whitespace
  return fileName
    .replace(/\\/g, '')
    .replace(/\\.\\./g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 100);
}

export async function uploadDocument(
  jobId: string,
  file: File,
  userId: string
): Promise<UploadResult> {
  const validation = validateFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const supabase = getSupabaseClient();
    const sanitizedName = sanitizeFileName(file.name);
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}_${sanitizedName}`;
    
    // Upload to user-specific folder
    const filePath = `${userId}/${jobId}/${uniqueFileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    // Save document record to database
    const { error: dbError } = await supabase.from('documents').insert({
      job_id: jobId,
      user_id: userId,
      file_name: file.name,
      file_url: urlData.publicUrl,
      file_type: file.type,
    });

    if (dbError) {
      throw new Error(dbError.message);
    }

    return {
      success: true,
      url: urlData.publicUrl,
      fileName: file.name,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return { success: false, error: message };
  }
}

export async function deleteDocument(documentId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseClient();

    // Get document info
    const { data: doc } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', userId)
      .single();

    if (!doc) {
      return { success: false, error: 'Document not found' };
    }

    // Extract path from URL
    const url = new URL(doc.file_url);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(pathParts.indexOf('documents') + 1).join('/');

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([filePath]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
    }

    // Delete database record
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', userId);

    if (dbError) {
      throw new Error(dbError.message);
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Delete failed';
    return { success: false, error: message };
  }
}

export async function getDocumentsForJob(jobId: string, userId: string) {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('job_id', jobId)
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;

    return { success: true, documents: data || [] };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch documents';
    return { success: false, error: message, documents: [] };
  }
}

// React hook for document uploads
export function useDocumentUpload() {
  const { user, isAuthenticated } = useSupabaseAuth();

  const upload = async (jobId: string, file: File): Promise<UploadResult> => {
    if (!isAuthenticated || !user) {
      return { success: false, error: 'Authentication required' };
    }
    return uploadDocument(jobId, file, user.id);
  };

  const deleteDoc = async (documentId: string) => {
    if (!isAuthenticated || !user) {
      return { success: false, error: 'Authentication required' };
    }
    return deleteDocument(documentId, user.id);
  };

  const getDocuments = async (jobId: string) => {
    if (!isAuthenticated || !user) {
      return { success: false, error: 'Authentication required', documents: [] };
    }
    return getDocumentsForJob(jobId, user.id);
  };

  return {
    upload,
    delete: deleteDoc,
    getDocuments,
    validateFile,
    maxFileSize: MAX_FILE_SIZE,
    allowedTypes: ALLOWED_FILE_TYPES,
  };
}
