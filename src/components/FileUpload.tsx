import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Loader, File, X } from 'lucide-react';
import { useStorage } from '../hooks/useStorage';

interface FileUploadProps {
  onUpload: (files: Array<{ url: string; name: string; size: number; type: string }>) => void;
  maxFiles?: number;
  maxSize?: number;
  allowedTypes?: string[];
}

export function FileUpload({
  onUpload,
  maxFiles = 5,
  maxSize = 10,
  allowedTypes
}: FileUploadProps) {
  const { uploadFile, uploading, progress, error } = useStorage();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      const uploadedFiles = await Promise.all(
        acceptedFiles.map(file =>
          uploadFile(file, {
            maxSize,
            allowedTypes
          })
        )
      );
      onUpload(uploadedFiles);
    } catch (err) {
      console.error('Upload error:', err);
    }
  }, [uploadFile, onUpload, maxSize, allowedTypes]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize: maxSize * 1024 * 1024,
    accept: allowedTypes?.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>)
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <File className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? 'Déposez les fichiers ici...'
            : 'Glissez-déposez des fichiers ici, ou cliquez pour sélectionner'}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Maximum {maxFiles} fichiers, {maxSize}MB chacun
        </p>
      </div>

      {uploading && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Loader className="h-5 w-5 text-indigo-500 animate-spin mr-2" />
              <span className="text-sm text-gray-600">Téléversement en cours...</span>
            </div>
            <span className="text-sm font-medium text-indigo-600">{progress}%</span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <X className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Erreur lors du téléversement
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}