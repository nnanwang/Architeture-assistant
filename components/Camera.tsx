// Imports the necessary functions and types from the expo-camera package.
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';

// Imports useState for managing component state and useRef for referencing the camera view.
import { useState, useRef } from 'react';

// Imports basic UI components from react-native and the FontAwesome icon set from @expo/vector-icons.
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

// Imports functionalities to interact with the device's media library and image picker.
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';

// Defines the functional component CameraComponent.
export default function CameraComponnent() {
  // State hook for managing camera direction, permission status, and photo taken status.
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photoTaken, setPhotoTaken] = useState(false);
  
  // Ref hook to reference the camera component for actions like taking a picture.
  const cameraRef = useRef(null);

  // Handles the conditional rendering based on camera permission status.
  if (!permission) {
    return <View />; // Renders an empty view if permissions are still loading.
  }

  if (!permission.granted) {
    // Renders a view requesting camera permissions if not already granted.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  // Function to toggle the camera facing direction between front and back.
  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  // Async function to handle taking a picture.
  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setPhotoTaken(true); // Updates the photoTaken state upon taking a photo.
      savePhoto(photo.uri); // Initiates saving the photo.
    }
  };

  // Async function to save a photo to the device's gallery.
  const savePhoto = async (uri) => {
    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) {
      alert('Permissions to access media library were denied');
      return;
    }
    try {
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('YourAlbumName', asset, false);
      alert('Photo saved to gallery!');
    } catch (error) {
      console.error('Error saving photo', error);
      alert('Failed to save photo!');
    }
  };

  // Async function to request permissions to access the media library.
  const requestMediaLibraryPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  };
  
  // Main component view rendering the camera interface and control buttons.
  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} facing={facing}>
        <View style={styles.camera}>
          {!photoTaken && (
            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
              <FontAwesome name="refresh" size={25} color="white" />
            </TouchableOpacity>
          )}
          {!photoTaken && (
            <TouchableOpacity style={styles.takePhotoButton} onPress={takePicture}>
              <FontAwesome name="camera" size={25} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </CameraView>
    </View>
  );
}

// StyleSheet for styling the components in CameraComponent.
const styles = StyleSheet.create({
  container: {
    width: 320,
    height: 440,
    borderRadius: 18,
  },
  message: {
    textAlign: 'center',
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  flipButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 6,
  },
  takePhotoButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
  },
});
