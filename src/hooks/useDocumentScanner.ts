import { useState } from 'react';
import * as FileSystem from 'expo-file-system';
import { PDFDocument, rgb } from 'pdf-lib';

type ScannedDocument = {
  uri: string;
  type: string;
  pages: string[];
  pdfUri?: string;
};

export default function useDocumentScanner() {
  const [documents, setDocuments] = useState<ScannedDocument[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const addScan = async (uri: string, docType: string) => {
    setIsProcessing(true);
    try {
      // Create PDF with the scanned page
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([612, 792]); // Letter size
      
      // For demo - in production we'd embed the actual image
      page.drawText('Scanned Document Preview', {
        x: 50, y: 700, size: 18, color: rgb(0, 0, 0)
      });
      
      const pdfBytes = await pdfDoc.save();
      const pdfUri = `${FileSystem.documentDirectory}${Date.now()}.pdf`;
      await FileSystem.writeAsStringAsync(pdfUri, btoa(String.fromCharCode(...pdfBytes)), {
        encoding: FileSystem.EncodingType.Base64
      });
      
      setDocuments(prev => [...prev, {
        uri,
        type: docType,
        pages: [uri],
        pdfUri
      }]);
    } catch (error) {
      console.error('PDF creation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };
  
  return {
    documents,
    isProcessing,
    addScan,
    removeDocument
  };
}