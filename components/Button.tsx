// Import required React Native components and FontAwesome icons
import { StyleSheet, View, Pressable, Text } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// Define props type for the Button component
type Props = {
  label: string;             // The button text
  theme?: 'primary';         // Optional theme prop for styling
  onPress?: () => void;      // Function to call when button is pressed
};

// Button component definition
export default function Button({ label, theme, onPress }: Props) {
  // If the theme is 'primary', return the specially styled button
  if (theme === 'primary') {
    return (
      <View
        style={[
          styles.buttonContainer,                        // Basic layout
          { borderWidth: 1, borderColor: '#ffd33d', borderRadius: 18, margin: 3 }, // Custom styling
        ]}>
        <Pressable
          style={[styles.button, { backgroundColor: '#fff' }]} // Button background color for primary
          onPress={onPress}                                     // Use the provided onPress function
        >
          <FontAwesome
            name="picture-o"                                   // Picture icon
            size={18}                                           // Icon size
            color="#25292e"                                     // Icon color
            style={styles.buttonIcon}                           // Icon spacing
          />
          <Text style={[styles.buttonLabel, { color: '#25292e' }]}>
            {label}                                             
          </Text>
        </Pressable>
      </View>
    );
  }

  // Default button if no theme is provided
  return (
    <View style={styles.buttonContainer}>
      <Pressable
        style={styles.button}      
        onPress={onPress}          
      >
        <Text style={styles.buttonLabel}>{label}</Text>  
      </Pressable>
    </View>
  );
}

// Style definitions
const styles = StyleSheet.create({
  buttonContainer: {
    width: 320,                   // Button width
    height: 50,                   // Button height
    marginHorizontal: 20,         // Side margin
    alignItems: 'center',         // Center content horizontally
    justifyContent: 'center',     // Center content vertically
    padding: 3,                   // Inner padding
  },
  button: {
    borderRadius: 10,             // Rounded corners
    width: '100%',                // Full width of container
    height: '100%',               // Full height of container
    alignItems: 'center',         // Center text/icon horizontally
    justifyContent: 'center',     // Center text/icon vertically
    flexDirection: 'row',         // Row layout for icon + label
    backgroundColor: '#444',      // Default dark background for non-primary buttons
  },
  buttonIcon: {
    paddingRight: 8,              // Space between icon and label
  },
  buttonLabel: {
    color: '#fff',                
    fontSize: 16,                 
  },
});
