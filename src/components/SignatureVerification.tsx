import React, { useEffect, useState } from 'react';
import { FileSignature, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { useDocumentSignature } from '../hooks/useDocumentSignature';

interface SignatureVerificationProps {
  documentId: string;
}

export function SignatureVerification({ documentId }: SignatureVerificationProps) {
  const { verifySignature } = useDocumentSignature();
  const [signatureData, setSignatureData] = useState<{
    signedBy: string;
    signedAt: string;
    signatureUrl: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSignature = async () => {
      try {
        const data = await verifySignature(documentId);
        setSignatureData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de vérification');
      } finally {
        setLoading(false);
      }
    };

    checkSignature();
  }, [documentId]);

  if (loading) {
    return (
      <div className="flex items-center text-gray-500">
        <Clock className="h-5 w-5 mr-2 animate-spin" />
        Vérification de la signature...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center text-red-600">
        <AlertTriangle className="h-5 w-5 mr-2" />
        {error}
      </div>
    );
  }

  if (!signatureData) {
    return (
      <div className="flex items-center text-gray-500">
        <FileSignature className="h-5 w-5 mr-2" />
        Document non signé
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-start">
        <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-green-800">
            Document signé électroniquement
          </h3>
          <div className="mt-2 text-sm text-green-700">
            <p>
              Signé le {new Date(signatureData.signedAt).toLocaleDateString()} à{' '}
              {new Date(signatureData.signedAt).toLocaleTimeString()}
            </p>
          </div>
          <div className="mt-2">
            <img
              src={signatureData.signatureUrl}
              alt="Signature"
              className="h-16 object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}