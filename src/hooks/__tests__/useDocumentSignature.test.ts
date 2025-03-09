import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useDocumentSignature } from '../useDocumentSignature';
import { supabase } from '../../lib/supabase';

describe('useDocumentSignature', () => {
  const mockSignatureData = 'data:image/png;base64,test';
  const mockUserId = 'test-user';
  const mockDocumentId = 'test-doc';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('signs a document successfully', async () => {
    const { result } = renderHook(() => useDocumentSignature());

    // Mock storage upload
    vi.spyOn(supabase.storage.from(''), 'upload').mockResolvedValueOnce({
      data: { path: 'test-path' },
      error: null
    });

    // Mock document update
    vi.spyOn(supabase.from(''), 'update').mockImplementationOnce(() => ({
      eq: () => Promise.resolve({ data: null, error: null })
    }));

    await act(async () => {
      await result.current.signDocument(mockDocumentId, mockSignatureData, mockUserId);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.signing).toBe(false);
  });

  it('verifies a signature successfully', async () => {
    const mockSignatureMetadata = {
      signedBy: mockUserId,
      signedAt: new Date().toISOString(),
      signatureUrl: 'test-url'
    };

    vi.spyOn(supabase.from(''), 'select').mockImplementationOnce(() => ({
      eq: () => ({
        single: () => Promise.resolve({
          data: { signature_metadata: mockSignatureMetadata },
          error: null
        })
      })
    }));

    const { result } = renderHook(() => useDocumentSignature());

    await act(async () => {
      const data = await result.current.verifySignature(mockDocumentId);
      expect(data).toEqual(mockSignatureMetadata);
    });
  });

  it('handles signature errors', async () => {
    const { result } = renderHook(() => useDocumentSignature());

    vi.spyOn(supabase.storage.from(''), 'upload').mockRejectedValueOnce(
      new Error('Upload failed')
    );

    await act(async () => {
      try {
        await result.current.signDocument(mockDocumentId, mockSignatureData, mockUserId);
      } catch (err) {
        expect(err).toBeDefined();
      }
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.signing).toBe(false);
  });
});