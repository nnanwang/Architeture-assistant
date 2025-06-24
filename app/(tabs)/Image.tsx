// Import core components and utilities from React Native.
import { View, StyleSheet, Alert, ActivityIndicator, Text, ScrollView } from "react-native";
// Import ImageManipulator from Expo for image processing tasks.
import * as ImageManipulator from 'expo-image-manipulator';
// Import custom UI components: Button, ImageViewer, and CameraComponent.
import Button from '../../components/Button'; 
import ImageViewer from '../../components/ImageViewer';
import CameraComponent from "../../components/Camera";
// Import the Expo ImagePicker to allow users to pick images from the device.
import * as ImagePicker from 'expo-image-picker';
// Import the useState hook to manage component state.
import { useState } from 'react';
// Import a placeholder image to display when no image is selected.
import PlaceholderImage from "../../assets/images/background-image.png";
import {OPENAI_API_KEY} from "../../components/OPENAI_API_KEY"

// Define constants for the external API that will analyze the image.
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'; // API endpoint URL.


// Define a TypeScript type for analysis results.
type AnalysisResult = {
  content: string; // Full text content returned by the analysis.
  issues?: string[]; // Optionally, an array of issues (lines starting with '-' from the response).
};

// Main functional component that manages image selection, camera view, and analysis.
export default function Image() {
  // State variable to store the selected image URI.
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  // State variable to control whether the camera is visible.
  const [showCamera, setShowCamera] = useState(false);
  // State variable to store the analysis result returned by the API.
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  // State variable to indicate whether the analysis is in progress.
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // State variable to store any error messages.
  const [error, setError] = useState<string | null>(null);

  // Function to analyze the architectural image using an external API.
  const analyzeArchitecture = async () => {
    // If no image is selected, alert the user.
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }
  
    // Set analysis state: mark analysis in progress, clear previous errors and results.
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
  
    try {
      // 1. Compress and resize the selected image, and convert it to a base64 string.
      const compressedImage = await ImageManipulator.manipulateAsync(
        selectedImage, // Use the selected image URI.
        [{ resize: { width: 300 } }], // Resize the image to a width of 500 pixels.
        {
          compress: 0.5, // Compress image to 50% quality.
          format: ImageManipulator.SaveFormat.JPEG, // Save as JPEG.
          base64: true, // Include base64 encoding of the image.
        }
      );
  
  
      // If base64 conversion fails, throw an error.
      if (!compressedImage.base64) {
        throw new Error('Failed to process image');
      }
  
      // 2. Create a prompt for the API that includes instructions and the base64 image data.
      // Use backticks (`) to create a template literal so that the base64 string is embedded correctly.
      const userPrompt = JSON.stringify([
        {
          type: "text",
          text: "Analyze this architectural image and list potential issues.\n\n1. [Category]: [Issue]"
        },
        {
          type: "image_url",
          image_url: { url: `data:image/jpeg;base64,${compressedImage.base64}` }
        }
      ]);
  
      // Log the final prompt for debugging purposes.
      console.log("User Prompt:", userPrompt);
  
      // 3. Make a POST request to the analysis API with the constructed prompt.
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST', // Use the POST HTTP method.
        headers: {
          'Content-Type': 'application/json', // Specify that the request body is JSON.
          'Authorization': `Bearer ${OPENAI_API_KEY}`, // Provide the API key for authentication.
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // Specify the model for analysis.
          messages: [
            {
              role: "user",
              content: 
                userPrompt // Use the trimmed prompt as the message content.
            },
          ],
          temperature: 0.5, // Set temperature for response variability.
          max_tokens: 500, // Limit the maximum tokens in the response.
        }),
      });
  
      // 4. Try to parse the API response as JSON.
      let data;
      try {
        data = await response.json(); // Attempt to convert the response to JSON.
      } catch (jsonError) {
        const rawText = await response.text(); // Retrieve the raw response text for debugging.
        console.error("Failed to parse JSON. Raw response:", rawText);
        throw new Error("FAILED TO PARSE API RESPONSE");
      }
  
      // 5. If the response is not successful, throw an error.
      if (!response.ok) {
        throw new Error(data.error?.message || 'Analysis failed. Please try again.');
      }
  
      // 6. Process the text result from the API response.
      const resultText = data.choices[0].message.content;
      // Optionally, split the result text into individual issues (lines starting with '-').
      const issues = resultText.split('\n').filter(line => line.startsWith('-'));
  
      // Update the analysisResult state with the processed text and any issues found.
      setAnalysisResult({
        content: resultText,
        issues: issues.length > 0 ? issues : undefined,
      });
  
    } catch (err) {
      // If any error occurs during analysis, update the error state with the error message.
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      // Mark the analysis process as setcomplete.
      setIsAnalyzing(false);
    }
  };

  // Function to pick an image from the device's gallery.
  const pickImageAsync = async () => {
    try {
      // Launch the image library.
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Allow only images.
        allowsEditing: true, // Allow basic editing of the image.
        quality: 0.8, // Set the quality of the selected image.
        aspect: [4, 3], // Maintain a 4:3 aspect ratio.
      });

      // If an image is selected successfully...
      if (!result.canceled && result.assets[0]?.uri) {
        // Compress and resize the selected image.
        const compressed = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 800 } }], // Resize to a width of 800 pixels.
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Compression and format options.
        );
        setSelectedImage(compressed.uri);  // Update the state with the compressed image URI.
        setShowCamera(false); // Hide the camera if it was open.
      }
    } catch (err) {
      // Alert the user if processing the image fails.
      Alert.alert('Error', 'Failed to process image');
    }
  };

  // Function to toggle the visibility of the camera view.
  const toggleCamera = () => {
    setShowCamera(!showCamera);  // Toggle camera visibility.
    // If opening the camera, clear any previously selected image.
    if (!showCamera) setSelectedImage(undefined);
  };

  // Function to explicitly close the camera.
  const closeCamera = () => {
    setShowCamera(false);  // Hide the camera.
    // If there is no selected image, ensure the state is cleared.
    if (!selectedImage) {
      setSelectedImage(undefined);
    }
  };

  // Render the UI of the component.
// Render the component UI inside a ScrollView for scrollability.
return (
  <ScrollView contentContainerStyle={styles.container}>
    {/* Image container: Conditionally render the ImageViewer or the CameraComponent. */}
    <View style={styles.imageContainer}>
      {!showCamera ? (
        // If the camera is not active, display the ImageViewer using either the selected image or a placeholder.
        <ImageViewer imgSource={selectedImage ? { uri: selectedImage } : PlaceholderImage} />
      ) : (
        // If the camera is active, render the CameraComponent.
        <CameraComponent onPictureTaken={(uri) => {
          setSelectedImage(uri); // Update state with the captured image URI.
          setShowCamera(false);  // Hide the camera after capturing the image.
        }} />
      )}
    </View>
    {/* Footer container for action buttons and analysis display. */}
    <View style={styles.footerContainer}>
      {/* Button to toggle camera view */}
      <Button theme="primary" label="Open Camera" onPress={toggleCamera} />
      {/* Button to select an image from the gallery */}
      <Button theme="primary" label="Choose a photo" onPress={pickImageAsync} />
      {/* Close camera button, visible when the camera is active */}
      {showCamera && <Button theme="primary" label="Close camera" onPress={closeCamera} />}
      {/* Analyze button is shown only when an image is selected */}
      {selectedImage && (
        <Button
          theme="primary"
          label={isAnalyzing ? "Analyzing..." : "Analyze Architecture"}
          onPress={analyzeArchitecture}
          disabled={isAnalyzing} // Disable while analysis is in progress.
        />
      )}
      {/* Activity indicator shows when analysis is running */}
      {isAnalyzing && <ActivityIndicator size="large" color="#ffffff" />}
      {/* Render the analysis result container if results are available */}
      {analysisResult && (
        <View style={styles.resultContainer}>
          {analysisResult.issues ? (
            // If there are specific issues, map them to Text elements.
            analysisResult.issues.map((issue, index) => (
              <Text key={index} style={styles.issueText}>{issue}</Text>
            ))
          ) : (
            // Otherwise, display the full analysis content.
            <Text style={styles.resultText}>{analysisResult.content}</Text>
          )}
        </View>
      )}
      {/* Render error container if there is an error */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  </ScrollView>
);
}

// Define component styles using StyleSheet.
const styles = StyleSheet.create({
container: {
  flexGrow: 1,                   // Allow the container to grow with content.
  backgroundColor: '#25292e',    // Set dark background color.
  alignItems: 'center',          // Center content horizontally.
  paddingTop: 30,                
  marginBottom: 30,             
},
imageContainer: {
  flex: 1,                      
},
footerContainer: {
  width: '100%',                 
  alignItems: 'center',         
  padding: 10,                   
},
resultContainer: {
  marginTop: 10,                 
  padding: 10,                   
  backgroundColor: "lightyellow",      
  borderRadius: 8,   
  
},
issueText: {
  color: '#333',                 
  fontSize: 14,                  
  marginVertical: 2,             
},
resultText: {
  color: '#333',
  fontSize: 16,                 
},
errorContainer: {
  marginTop: 10,                 
  padding: 10,                   
  backgroundColor: '#ffcccc',    
  borderRadius: 8,               
},
errorText: {
  color: '#cc0000',              // Red text for errors.
  fontSize: 14,                  // Font size for error text.
},
});