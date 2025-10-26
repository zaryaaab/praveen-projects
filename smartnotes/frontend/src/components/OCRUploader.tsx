import React, { useState } from 'react';
import { createWorker } from 'tesseract.js';
import { Upload, Loader2 } from 'lucide-react';

interface OCRUploaderProps {
  onTextExtracted: (text: string) => void;
  onClose: () => void;
}

export function OCRUploader({ onTextExtracted, onClose }: OCRUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);

    try {
      const worker = await createWorker();

      worker.progress = (p: number) => {
        setProgress(Math.round(p * 100));
      };

      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();
      
      onTextExtracted(text);
      onClose();
    } catch (error) {
      console.error('OCR Error:', error);
      alert('Error processing image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Process
    await processImage(file);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">Upload Handwritten Note</h2>
        
        <div className="mb-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            {isProcessing ? (
              <div className="space-y-4">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                <p className="text-gray-600">Processing image... {progress}%</p>
              </div>
            ) : (
              <>
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-h-64 mx-auto mb-4 rounded-lg"
                  />
                ) : (
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                )}
                <div className="space-y-2">
                  <p className="text-gray-600">
                    Upload an image of your handwritten note
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports PNG, JPG up to 10MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}