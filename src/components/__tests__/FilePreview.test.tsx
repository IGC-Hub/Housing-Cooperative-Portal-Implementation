import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilePreview } from '../FilePreview';

describe('FilePreview', () => {
  const mockFiles = [
    {
      url: 'test1.jpg',
      name: 'test1.jpg',
      size: 1024,
      type: 'image/jpeg'
    },
    {
      url: 'test2.pdf',
      name: 'test2.pdf',
      size: 2048,
      type: 'application/pdf'
    }
  ];

  it('renders file list', () => {
    render(<FilePreview files={mockFiles} />);
    
    expect(screen.getByText('test1.jpg')).toBeInTheDocument();
    expect(screen.getByText('test2.pdf')).toBeInTheDocument();
  });

  it('formats file sizes correctly', () => {
    render(<FilePreview files={mockFiles} />);
    
    expect(screen.getByText('1.0 KB')).toBeInTheDocument();
    expect(screen.getByText('2.0 KB')).toBeInTheDocument();
  });

  it('handles file removal', () => {
    const onRemove = vi.fn();
    render(<FilePreview files={mockFiles} onRemove={onRemove} />);
    
    const removeButtons = screen.getAllByRole('button');
    fireEvent.click(removeButtons[0]);
    
    expect(onRemove).toHaveBeenCalledWith(0);
  });

  it('shows correct icons for different file types', () => {
    render(<FilePreview files={mockFiles} />);
    
    // Vérifier que les icônes sont rendus correctement
    const icons = screen.getAllByRole('img', { hidden: true });
    expect(icons).toHaveLength(2);
  });
});