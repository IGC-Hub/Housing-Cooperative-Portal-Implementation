import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { FileUpload } from '../FileUpload';
import { useStorage } from '../../hooks/useStorage';

// Mock useStorage hook
vi.mock('../../hooks/useStorage', () => ({
  useStorage: vi.fn()
}));

describe('FileUpload', () => {
  const mockOnUpload = vi.fn();
  const mockUploadFile = vi.fn();

  beforeEach(() => {
    vi.mocked(useStorage).mockReturnValue({
      uploadFile: mockUploadFile,
      uploading: false,
      error: null,
      progress: 0,
      deleteFile: vi.fn()
    });
  });

  it('renders upload area', () => {
    render(<FileUpload onUpload={mockOnUpload} />);
    
    expect(screen.getByText(/Glissez-déposez des fichiers ici/i)).toBeInTheDocument();
  });

  it('handles file upload', async () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    mockUploadFile.mockResolvedValueOnce({
      url: 'test-url',
      name: 'test.jpg',
      size: 1000,
      type: 'image/jpeg'
    });

    render(<FileUpload onUpload={mockOnUpload} />);

    const input = screen.getByRole('button');
    await fireEvent.drop(input, {
      dataTransfer: {
        files: [file]
      }
    });

    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith([{
        url: 'test-url',
        name: 'test.jpg',
        size: 1000,
        type: 'image/jpeg'
      }]);
    });
  });

  it('shows error message', () => {
    vi.mocked(useStorage).mockReturnValue({
      uploadFile: mockUploadFile,
      uploading: false,
      error: 'Upload failed',
      progress: 0,
      deleteFile: vi.fn()
    });

    render(<FileUpload onUpload={mockOnUpload} />);
    
    expect(screen.getByText('Upload failed')).toBeInTheDocument();
  });

  it('shows upload progress', () => {
    vi.mocked(useStorage).mockReturnValue({
      uploadFile: mockUploadFile,
      uploading: true,
      error: null,
      progress: 50,
      deleteFile: vi.fn()
    });

    render(<FileUpload onUpload={mockOnUpload} />);
    
    expect(screen.getByText('50%')).toBeInTheDocument();
  });
});