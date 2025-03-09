import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface UploadOptions {
  bucket?: string;
  folder?: string;
  maxSize?: number; // in MB
  allowedTypes?: string[];
}

const DEFAULT_OPTIONS: UploadOptions = {
  bucket: 'forum-attachments',
  folder: 'files',
  maxSize: 10, // 10MB
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
};

export function useStorage() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (
    file: File,
    options: UploadOptions = DEFAULT_OPTIONS
  ) => {
    const { bucket = 'forum-attachments', folder = 'files', maxSize = 10, allowedTypes } = options;

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Validation de la taille
      if (file.size > maxSize * 1024 * 1024) {
        throw new Error(`Le fichier dépasse la taille maximale de ${maxSize}MB`);
      }

      // Validation du type
      if (allowedTypes && !allowedTypes.includes(file.type)) {
        throw new Error('Type de fichier non autorisé');
      }

      // Création d'un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Téléversement du fichier
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percentage = (progress.loaded / progress.total) * 100;
            setProgress(Math.round(percentage));
          },
        });

      if (uploadError) throw uploadError;

      // Récupération de l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return {
        path: filePath,
        url: publicUrl,
        name: file.name,
        size: file.size,
        type: file.type
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du téléversement');
      throw err;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const deleteFile = async (path: string, bucket: string = 'forum-attachments') => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      throw err;
    }
  };

  return {
    uploadFile,
    deleteFile,
    uploading,
    error,
    progress
  };
}