import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { SignatureCanvas } from '../SignatureCanvas';

// Mock react-signature-canvas
vi.mock('react-signature-canvas', () => ({
  default: vi.fn().mockImplementation(() => ({
    clear: vi.fn(),
    toDataURL: vi.fn().mockReturnValue('data:image/png;base64,test'),
    isEmpty: vi.fn().mockReturnValue(false)
  }))
}));

describe('SignatureCanvas', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders signature pad', () => {
    render(
      <SignatureCanvas
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Effacer')).toBeInTheDocument();
    expect(screen.getByText('Valider')).toBeInTheDocument();
    expect(screen.getByText('Annuler')).toBeInTheDocument();
  });

  it('handles clear button click', () => {
    render(
      <SignatureCanvas
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText('Effacer'));
  });

  it('handles save button click', () => {
    render(
      <SignatureCanvas
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText('Valider'));
    expect(mockOnSave).toHaveBeenCalled();
  });

  it('handles cancel button click', () => {
    render(
      <SignatureCanvas
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText('Annuler'));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});