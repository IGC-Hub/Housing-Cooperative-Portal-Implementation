import React from 'react';
import { File, Image, FileText, X } from 'lucide-react';

interface FilePreviewProps {
  files: Array<{
    url: string;
    name: string;
    size: number;
    type: string;
  }>;
  onRemove?: (index: number) => void;
}

export function FilePreview({ files, onRemove }: FilePreviewProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return Image;
    } else if (type.includes('pdf') || type.includes('word')) {
      return FileText;
    }
    return File;
  };

  return (
    <div className="space-y-2">
      {files.map((file, index) => {
        const Icon = getFileIcon(file.type);

        return (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <Icon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
              </div>
            </div>
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}