import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Camera } from 'react-native-camera';
import { manipulateAsync } from 'expo-image-manipulator';

type Props = {
  onScanComplete: (uri: string, docType: string) => void;
  documentTypes: string[];
};

export default function DocumentScanner({ onScanComplete, documentTypes }: Props) {
  const cameraRef = useRef<Camera>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastPhotoUri, setLastPhotoUri] = useState('');
  
  const takePicture = async () => {
    if (cameraRef.current && !isScanning) {
      setIsScanning(true);
      try {
        const { uri } = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: true,
        });
        
        // Basic edge detection and perspective correction
        const processed = await manipulateAsync(
          uri,
          [
            { resize: { width: 1000 } },
            { crop: { originX: 50, originY: 50, width: 900, height: 1200 } },
          ],
          { compress: 0.7, format: 'jpeg' }
        );
        
        setLastPhotoUri(processed.uri);
        // Auto-classify document type (simple first version)
        const docType = documentTypes.length > 0 ? documentTypes[0] : 'general';
        onScanComplete(processed.uri, docType);
      } catch (error) {
        console.error('Scan failed:', error);
      } finally {
        setIsScanning(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.preview}
        type={Camera.Constants.Type.back}
        captureAudio={false}
      />
      <View style={styles.overlay}>
        <View style={styles.border} />
        <Text style={styles.helpText}>Align document within frame</Text>
      </View>
      <TouchableOpacity 
        style={styles.captureButton} 
        onPress={takePicture}
        disabled={isScanning}
      >
        <Text style={styles.buttonText}>
          {isScanning ? 'Processing...' : 'Capture'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  preview: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  border: { width: 250, height: 350, borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)' },
  helpText: { color: 'white', marginTop: 20, fontSize: 16 },
  captureButton: { 
    backgroundColor: 'rgba(0,122,255,0.8)', 
    padding: 15, 
    borderRadius: 5, 
    margin: 20 
  },
  buttonText: { color: 'white', fontSize: 18 }
});