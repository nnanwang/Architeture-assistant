import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router'; // ✅ import expo-router


export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.username}>Architecture Assistant</Text>
      <Text style={styles.subtitle}>Let's design the future of architecture 🏛️</Text>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/Explore')}> 
        <Image style={styles.cardImage} source={require('../../assets/images/explore.png')} />
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>Explore Architecture</Text>
          <Text style={styles.cardDesc}>Browse iconic landmarks and global wonders.</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/Image')}> 
        <Image style={styles.cardImage} source={require('../../assets/images/issue.png')} />
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>Architectural Issues</Text>
          <Text style={styles.cardDesc}>Generate and review structural concerns via AI.</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push('/Tripo3DModel')}> 
        <Image style={styles.cardImage} source={require('../../assets/images/3dmoddel.png')} />
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>3D Model Builder</Text>
          <Text style={styles.cardDesc}>Convert building images into 3D models easily via AI.</Text>
        </View>
      </TouchableOpacity>

    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 24,
    paddingTop: 50,
  },
    username: {
    fontSize: 22,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#bbbbbb',
    marginBottom: 24,
  },
  text: {
    color: '#fff',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2aa',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
   marginBottom: 18,
  },
  cardImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginRight: 12,
  },
  cardText: {
    flex:1,
  },
  cardTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight:'bold'
  },
  cardDesc: {
    fontSize: 13,
    color: '#aaa',
    marginTop:4
  },
});

