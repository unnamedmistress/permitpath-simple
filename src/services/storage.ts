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

// In-memory storage for anonymous users (session-based)
const anonymousDocuments: Map<string, any[]> = new Map();

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  fileName?: string;
  documentId?: string;
}

export interface AnonymousDocument {
  id: string;
  jobId: string;
  name: string;
  fileType: string;
  data: string; // base64 data URL
  uploadedAt: Date;
  requirementId?: string;
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

// Convert file to base64 for anonymous storage
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function uploadDocument(
  jobId: string,
  file: File,
  userId: string | null,
  requirementId?: string
): Promise<UploadResult> {
  const validation = validateFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Anonymous upload (no auth)
  if (!userId) {
    try {
      const base64Data = await fileToBase64(file);
      const docId = `anon-doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const doc: AnonymousDocument = {
        id: docId,
        jobId,
        name: file.name,
        fileType: file.type,
        data: base64Data,
        uploadedAt: new Date(),
        requirementId,
      };

      // Store in memory (and localStorage if available)
      const existing = anonymousDocuments.get(jobId) || [];
      existing.push(doc);
      anonymousDocuments.set(jobId, existing);
      
      // Also try to save to localStorage
      try {
        const key = `permitpath_docs_${jobId}`;
        localStorage.setItem(key, JSON.stringify(existing));
      } catch (e) {
        // localStorage might be full, ignore
      }
      
      return {
        success: true,
        url: base64Data,
        fileName: file.name,
        documentId: docId,
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Anonymous upload failed' 
      };
    }
  }

  // Authenticated upload to Supabase
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
    const { data: docData, error: dbError } = await supabase.from('documents').insert({
      job_id: jobId,
      user_id: userId,
      file_name: file.name,
      file_url: urlData.publicUrl,
      file_type: file.type,
      requirement_id: requirementId,
    }).select().single();

    if (dbError) {
      throw new Error(dbError.message);
    }

    return {
      success: true,
      url: urlData.publicUrl,
      fileName: file.name,
      documentId: docData.id,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return { success: false, error: message };
  }
}

export async function deleteDocument(
  documentId: string, 
  userId: string | null,
  jobId?: string
): Promise<{ success: boolean; error?: string }> {
  // Anonymous delete
  if (!userId && jobId) {
    const existing = anonymousDocuments.get(jobId) || [];
    const filtered = existing.filter(d => d.id !== documentId);
    
    if (filtered.length !== existing.length) {
      anonymousDocuments.set(jobId, filtered);
      // Update localStorage
      try {
        localStorage.setItem(`permitpath_docs_${jobId}`, JSON.stringify(filtered));
      } catch (e) {}
      return { success: true };
    }
    
    return { success: false, error: 'Document not found' };
  }

  // Authenticated delete
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

export async function getDocumentsForJob(
  jobId: string, 
  userId: string | null
): Promise<{ success: boolean; error?: string; documents: any[] }> {
  // Anonymous - get from memory/storage
  if (!userId) {
    // Check memory first
    let docs = anonymousDocuments.get(jobId) || [];
    
    // Try to load from localStorage if memory is empty
    if (docs.length === 0) {
      try {
        const stored = localStorage.getItem(`permitpath_docs_${jobId}`);
        if (stored) {
          docs = JSON.parse(stored).map((d: any) => ({
            ...d,
            uploadedAt: new Date(d.uploadedAt),
          }));
          anonymousDocuments.set(jobId, docs);
        }
      } catch (e) {}
    }
    
    return { 
      success: true, 
      documents: docs.map(d => ({
        id: d.id,
        job_id: jobId,
        file_name: d.name,
        file_url: d.data,
        file_type: d.fileType,
        requirement_id: d.requirementId,
        uploaded_at: d.uploadedAt.toISOString(),
      }))
    };
  }

  // Authenticated - get from Supabase
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('job_id', jobId)
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;

    return { success: true, documents: data || [], error: undefined };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch documents';
    return { success: false, error: message, documents: [] };
  }
}

// React hook for document uploads
export function useDocumentUpload() {
  const { user, isAuthenticated } = useSupabaseAuth();

  const upload = async (jobId: string, file: File, requirementId?: string): Promise<UploadResult> => {
    return uploadDocument(jobId, file, user?.id || null, requirementId);
  };

  const deleteDoc = async (documentId: string, jobId?: string) => {
    return deleteDocument(documentId, user?.id || null, jobId);
  };

  const getDocuments = async (jobId: string) => {
    return getDocumentsForJob(jobId, user?.id || null);
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