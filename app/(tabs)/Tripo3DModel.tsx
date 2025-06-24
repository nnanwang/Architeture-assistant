import React, { useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView, Alert, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Button from '../../components/Button'; // Assume you have a custom Button component
import {TRIPO_API_KEY} from "../../components/TRIPO_API_KEY"

const TRIPO_UPLOAD_URL = 'https://api.tripo3d.ai/v2/openapi/upload';
const TRIPO_TASK_URL = 'https://api.tripo3d.ai/v2/openapi/task';
const TRIPO_TASK_STATUS_URL = 'https://api.tripo3d.ai/v2/openapi/task';


export default function Tripo3DModel() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [modelLink, setModelLink] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [taskId, setTaskId] = useState<string | null>(null);

    // Pick image from gallery
    const pickImage = async () => {
        setModelLink(null);
        setError(null);
        setTaskId(null);

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled && result.assets[0]?.uri) {
            const uri = result.assets[0].uri;
            setSelectedImage(uri);
            uploadToTripo(uri);
        }
    };


    // Upload image to Tripo
    const uploadToTripo = async (imageUri: string) => {
        try {
        setLoading(true);
        setError(null);

        const formData: any = new FormData();
        formData.append('file', {
            uri: imageUri,
            name: 'image.jpg',
            type: 'image/jpeg',
        });

        const response = await fetch(TRIPO_UPLOAD_URL, {
            method: 'POST',
            headers: {
            'Authorization': `Bearer ${TRIPO_API_KEY}`,
            },
            body: formData,
        });

        const data = await response.json();
        if (!response.ok || !data.data?.image_token) {
            throw new Error(data.message || 'Image upload failed');
        }

        create3DModel(data.data.image_token);
        } catch (err: any) {
        console.error('Upload error:', err);
        setError(err.message || 'Upload failed.');
        setLoading(false);
        }
    };


    // Request Tripo to generate model
    const create3DModel = async (imageToken: string) => {
        try {
        const modelResponse = await fetch(TRIPO_TASK_URL, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TRIPO_API_KEY}`,
            },
            body: JSON.stringify({
                type: 'image_to_model',
                file: {
                    type: 'jpg',
                    file_token: imageToken,
                },
            }),
        });

        const modelData = await modelResponse.json();
        if (!modelResponse.ok || !modelData.data?.task_id) {
            throw new Error(modelData.message || 'Model generation failed');
        }

        const id = modelData.data.task_id;
        setTaskId(id);
        await pollModelStatus(id);
        } catch (err: any) {
            console.error('Model generation error:', err);
            setError(err?.message || '3D model generation failed.');
            setLoading(false);
        }
    };

      // Poll Tripo to get model generation status
    const pollModelStatus = async (id: string, retries = 60, delay = 8000) => {
        for (let i = 0; i < retries; i++) {
        const res = await fetch(`${TRIPO_TASK_STATUS_URL}/${id}`, {
            headers: {
            'Authorization': `Bearer ${TRIPO_API_KEY}`,
            },
        });

        const data = await res.json();
        console.log('Polling result:', data);

        if (data?.data?.status === 'success') {
            setModelLink(`https://www.tripo3d.ai/view/${id}`);
            setLoading(false);
            return;
        }

        if (data?.data?.status === 'failed') {
            throw new Error('Model generation failed.');
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
        }

        setError('⏳ Timeout. The model is still being processed. Try again later or tap Retry.');
        setModelLink(null);
        setLoading(false);
    };

    return (
            <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>🧊 Tripo 3D Model Generator</Text>

      <Button label="Select Image" theme="primary" onPress={pickImage} />

      {selectedImage && <Image source={{ uri: selectedImage }} style={styles.imagePreview} />}

      {loading && <ActivityIndicator size="large" color="#fff" />}

      {modelLink && (
        <View style={styles.webviewContainer}>
          <Text style={styles.successText}>✅ Model Ready!</Text>

             <Text selectable style={styles.modelUrlText}>
            {modelLink}
          </Text>

          {/* Copy link button */}
          <Button
            label="📋 Copy Model Link"
            
            onPress={() => {
              if (modelLink) {
                Clipboard.setStringAsync(modelLink);  // ✅ Correct API
                Alert.alert('Copied!', 'The model URL has been copied to clipboard.');
              }
            }}
          />

          {/* Open in browser */}
          <Button
            label="📥 Open Model in Browser"
            onPress={() => {
              if (modelLink) {
                Linking.openURL(modelLink);
              }
            }}
          />
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {taskId && !modelLink && !loading && (
        <Button
          label="🔁 Retry"
          theme="primary"
          onPress={() => {
            setError(null);
            setLoading(true);
            pollModelStatus(taskId);
          }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#25292e',
    flexGrow: 1,
  },
  header: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 15,
  },
  imagePreview: {
    width: 300,
    height: 400,
    borderRadius: 10,
    marginVertical: 15,
  },
  webviewContainer: {
    marginTop: 20,
    width: '100%',
    height: 400,
    borderRadius: 10,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
  },
  successText: {
    fontSize: 16,
    color: '#2e7d32',
    marginBottom: 10,
  },
  modelUrlText: {
    color: '#87ceeb',
    marginVertical: 10,
    textAlign: 'center',
  },
  errorContainer: {
    marginTop: 20,
    backgroundColor: '#ffcccc',
    padding: 10,
    borderRadius: 8,
  },
  errorText: {
    color: '#b00020',
    fontSize: 14,
    textAlign: 'center',
  },
});
