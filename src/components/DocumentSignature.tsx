import React, { useState } from 'react';
import { FileSignature, Check, AlertTriangle } from 'lucide-react';
import { SignatureCanvas } from './SignatureCanvas';
import { useDocumentSignature } from '../hooks/useDocumentSignature';
import { useAuthStore } from '../store/authStore';

interface DocumentSignatureProps {
  documentId: string;
  onSignatureComplete?: () => void;
}

export function DocumentSignature({
  documentId,
  onSignatureComplete
}: DocumentSignatureProps) {
  const user = useAuthStore(state => state.user);
  const [showSignatureCanvas, setShowSignatureCanvas] = useState(false);
  const { signDocument, verifySignature, signing, error } = useDocumentSignature();

  const handleSignature = async (signatureData: string) => {
    if (!user) return;

    try {
      await signDocument(documentId, signatureData, user.id);
      setShowSignatureCanvas(false);
      onSignatureComplete?.();
    } catch (err) {
      console.error('Signature error:', err);
    }
  };

  return (
    <div>
      {!showSignatureCanvas ? (
        <button
          onClick={() => setShowSignatureCanvas(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <FileSignature className="h-5 w-5 mr-2" />
          Signer le document
        </button>
      ) : (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Signature électronique
              </h3>
              <button
                onClick={() => setShowSignatureCanvas(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Fermer</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Erreur lors de la signature
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Veuillez signer dans la zone ci-dessous. Cette signature électronique
                a la même valeur qu'une signature manuscrite.
              </p>
            </div>

            <SignatureCanvas
              onSave={handleSignature}
              onCancel={() => setShowSignatureCanvas(false)}
            />

            {signing && (
              <div className="mt-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                <span className="ml-2 text-sm text-gray-500">
                  Enregistrement de la signature...
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}