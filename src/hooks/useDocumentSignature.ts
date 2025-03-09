import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface SignatureMetadata {
  signedBy: string;
  signedAt: string;
  signatureUrl: string;
}

export function useDocumentSignature() {
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signDocument = async (
    documentId: string,
    signatureData: string,
    userId: string
  ) => {
    setSigning(true);
    setError(null);

    try {
      // 1. Upload signature image
      const signatureFileName = `signatures/${documentId}/${userId}_${Date.now()}.png`;
      const signatureFile = await fetch(signatureData).then(res => res.blob());

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(signatureFileName, signatureFile, {
          contentType: 'image/png',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 2. Get public URL for signature
      const { data: { publicUrl: signatureUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(signatureFileName);

      // 3. Create signature record
      const signatureMetadata: SignatureMetadata = {
        signedBy: userId,
        signedAt: new Date().toISOString(),
        signatureUrl
      };

      const { error: updateError } = await supabase
        .from('documents')
        .update({
          signed_by: userId,
          signed_at: signatureMetadata.signedAt,
          signature_metadata: signatureMetadata
        })
        .eq('id', documentId);

      if (updateError) throw updateError;

      return signatureMetadata;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la signature');
      throw err;
    } finally {
      setSigning(false);
    }
  };

  const verifySignature = async (documentId: string) => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('signature_metadata')
        .eq('id', documentId)
        .single();

      if (error) throw error;

      return data?.signature_metadata as SignatureMetadata | null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la vérification');
      throw err;
    }
  };

  return {
    signDocument,
    verifySignature,
    signing,
    error
  };
}