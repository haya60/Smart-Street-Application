import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation(); // use navigation hook to navigate between screens

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SMART STREET</Text>
      
      {/* Styled Buttons */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('uploadPage')} // Navigate to the Upload Page
      >
        <Text style={styles.buttonText}>Go to Upload Page</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('livePage')}
      >
        <Text style={styles.buttonText}>Go to Live Page</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', // Center content horizontally
    padding: 20,
    backgroundColor: 'rgba(255, 230, 232, 0.2)'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#FFF', // Darker color for better readability
    textAlign: 'center', // Center title text
  },
  button: {
    backgroundColor: 'rgba(65, 56, 57, 0.8)', // Blue button
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 10, // Space between buttons
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5, 
    width: 230,
    height: 60,
  },
  buttonText: {
    color: '#FFF', // White text
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

