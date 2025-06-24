// Import core components and utilities from React Native.
import { View, StyleSheet, Alert, ActivityIndicator, Text, ScrollView, TextInput } from "react-native";
// Import the useState hook for managing component state.
import { useState } from 'react';
// Import a custom Button component (or use React Native's built-in Button if preferred).
import Button from '../../components/Button';

import { OPENAI_API_KEY} from '../../components/OPENAI_API_KEY'

// Define constants for the OpenAI API endpoint and your API key.
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
// const API_KEY = "YOUR_OPENAI_API_KEY"; // Your API key (replace with your actual key).

// Define a TypeScript type for each architecture result.
type Architecture = {
  name: string;
  issues: string;
};

// Main functional component for the Search Architectures tab.
export default function SearchArchitectures() {
  // State to store the user's location input.
  const [location, setLocation] = useState<string>("");
  // State to store the search results (an array of architectures).
  const [results, setResults] = useState<Architecture[]>([]);
  // State to indicate if a search/API call is in progress.
  const [loading, setLoading] = useState<boolean>(false);
  // State to store any error messages from the API.
  const [error, setError] = useState<string | null>(null);

  // Function to search for famous architectures in the given location.
  const searchArchitectures = async () => {
    // Ensure the user has entered a location.
    if (!location.trim()) {
      Alert.alert("Error", "Please enter a location");
      return;
    }
    
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      // Construct the prompt for the GPT API.
      // The prompt instructs the model to list three famous architectural landmarks in the given location
      // and describe potential issues for each landmark.
      const prompt = `
        You are an expert in architecture. Given the location "${location.trim()}", please list three famous architectural landmarks in that location.
        For each landmark, list potential issues related to maintenance, environmental challenges, or structural problems.
        Format your response as follows:
        1. Landmark Name: Issue description
        2. Landmark Name: Issue description
        3. Landmark Name: Issue description
      `;
      
      // Log the prompt for debugging.
      console.log("Search prompt:", prompt.trim());

      // Call the OpenAI API via a POST request.
      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // Specify the model to use.
          messages: [{
            role: "user",
            content: prompt.trim(),
          }],
          temperature: 0.5,
          max_tokens: 100,
        }),
      });

      // Attempt to parse the API response as JSON.
      const data = await response.json();

      // If the API returns an error, throw an error.
      if (!response.ok) {
        throw new Error(data.error?.message || "Search failed. Please try again.");
      }

      // Extract the response text.
      const text = data.choices[0].message.content;
      console.log("API Response Text:", text);

      // Assume the API response follows the expected format (each line starts with "1.", "2.", "3.").
      // Split the text by newlines and process each line.
      const lines = text.split('\n').filter((line: string) => line.trim().length > 0);
      // Parse each line into an architecture object.
      const arches: Architecture[] = lines.map((line: string) => {
        // Split the line at ":" to separate the landmark name from its issues.
        const [numAndName, ...issueParts] = line.split(':');
        const name = numAndName.replace(/^\d+\.\s*/, "").trim(); // Remove any numbering.
        const issues = issueParts.join(':').trim(); // Join the rest of the parts as the issue description.
        return { name, issues };
      });

      // Update state with the retrieved architecture search results.
      setResults(arches);
    } catch (err) {
      // Set the error state if an error occurs.
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      // Mark the loading process as complete.
      setLoading(false);
    }
  };

  // Render the UI.
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Search Famous Architecture</Text>
      {/* TextInput for the user to enter a location */}
      <TextInput
        style={styles.input}
        placeholder="Enter location (e.g., Paris)"
        placeholderTextColor="#888"
        value={location}
        onChangeText={setLocation}
      />
      {/* Button to trigger the search */}
      <Button theme="primary" label="Search" onPress={searchArchitectures} />

      {/* Show an activity indicator while loading */}
      {loading && <ActivityIndicator size="large" color="#ffffff" style={{ marginTop: 10 }} />}
      
      {/* Display an error message if there's an error */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Display the search results if available */}
      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          {results.map((arch, index) => (
            <View key={index} style={styles.resultItem}>
              <Text style={styles.landmark}>{arch.name}</Text>
              <Text style={styles.issueDescription}>{arch.issues}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// Define styling for the component.
const styles = StyleSheet.create({
  container: {
    flexGrow: 1, // Allow the container to grow to fill the ScrollView.
    backgroundColor: '#25292e',
    alignItems: 'center',
    padding: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  resultsContainer: {
    marginTop: 20,
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
  },
  resultItem: {
    marginBottom: 10,
  },
  landmark: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  issueDescription: {
    fontSize: 14,
    color: '#555',
  },
  errorText: {
    color: '#ffcccc',
    fontSize: 16,
    marginTop: 10,
  },
});
