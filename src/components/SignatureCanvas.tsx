import React, { useRef, useState } from 'react';
import SignaturePad from 'react-signature-canvas';
import { Eraser, Download, Check } from 'lucide-react';

interface SignatureCanvasProps {
  onSave: (signature: string) => void;
  onCancel: () => void;
  width?: number;
  height?: number;
}

export function SignatureCanvas({
  onSave,
  onCancel,
  width = 500,
  height = 200
}: SignatureCanvasProps) {
  const signaturePadRef = useRef<SignaturePad>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const handleClear = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      setIsEmpty(true);
    }
  };

  const handleSave = () => {
    if (signaturePadRef.current && !isEmpty) {
      const signatureData = signaturePadRef.current.toDataURL();
      onSave(signatureData);
    }
  };

  const handleBegin = () => {
    setIsEmpty(false);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <div className="border rounded-lg overflow-hidden">
        <SignaturePad
          ref={signaturePadRef}
          canvasProps={{
            width,
            height,
            className: 'signature-canvas bg-white',
            style: { width: '100%', height: '100%' }
          }}
          onBegin={handleBegin}
        />
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <div className="space-x-2">
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Eraser className="h-4 w-4 mr-2" />
            Effacer
          </button>
        </div>
        
        <div className="space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isEmpty}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="h-4 w-4 mr-2" />
            Valider
          </button>
        </div>
      </div>
    </div>
  );
}