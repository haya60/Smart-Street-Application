import Ionicons from '@expo/vector-icons/Ionicons'; 
import { StyleSheet, Image, Platform, View, Text, TextInput, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import * as SecureStore from 'expo-secure-store';

export default function TabTwoScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [camera, setCamera] = useState('');

  const getInitials = (fullName) => {
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length >= 2) {
      return nameParts[0][0] + nameParts[1][0]; // First letter of first and last name
    } else if (nameParts.length === 1) {
      return nameParts[0][0]; // Only one part of the name, return first letter
    }
    return '';
  };

  const loadCredentials = async () => {
    try {
      const savedName = await SecureStore.getItemAsync('name');
      const savedEmail = await SecureStore.getItemAsync('email');
      const savedPassword = await SecureStore.getItemAsync('password');
      const savedNumber = await SecureStore.getItemAsync('phoneNumber');
      const savedCamera = await SecureStore.getItemAsync('camera');
      if (savedName !== null) setName(savedName);
      if (savedEmail !== null) setEmail(savedEmail);
      if (savedPassword !== null) setPassword(savedPassword);
      if (savedNumber !== null) setPhoneNumber(savedNumber);
      if (savedCamera !== null) setCamera(savedCamera);
    } catch (error) {
      console.error('Failed to load credentials', error);
    }
  };

  // Function to save email and password to SecureStore
  const saveCredentials = async () => {
    try {
      await SecureStore.setItemAsync('name', name);
      await SecureStore.setItemAsync('email', email);
      await SecureStore.setItemAsync('password', password);
      await SecureStore.setItemAsync('phoneNumber', phoneNumber);
      await SecureStore.setItemAsync('camera', camera);
      
      // Alert.alert('Success', 'Credentials saved successfully!');
    } catch (error) {
      console.error('Failed to save credentials', error);
      Alert.alert('Error', 'Failed to save credentials');
    }
  };

  const sendCredentialsToAPI = async (email, password) => {
    try {
      const response = await fetch('http://172.20.10.3:5000/update_credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });
  
      // Log the raw response to check if it's valid JSON or an HTML error page
      const responseText = await response.text();
      console.log('Response text:', responseText);
  
      // Only try to parse JSON if the response is OK
      if (response.ok) {
        const jsonResponse = JSON.parse(responseText);
        // Alert.alert('Success', 'Credentials sent to the server!');
      } else {
        // Alert.alert('Error', 'Failed to send credentials to the server');
      }
    } catch (error) {
      console.error('Error sending credentials:', error);
      // Alert.alert('Error', 'An error occurred while sending credentials');
    }
  };
  


  useEffect(() => {
    loadCredentials();
  }, []);

  // Save credentials whenever email or password changes
  useEffect(() => {
    if (name && email && password && phoneNumber && camera ) {
      saveCredentials();
    }
  }, [name, email, password, phoneNumber, camera]);

    // Trigger this function when the credentials are saved or updated
  useEffect(() => {
    if (email && password) {
      sendCredentialsToAPI(email, password);
    }
  }, [email, password]);
  

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>
            {getInitials(name) || 'NA'} {/* If no name is entered, display 'NA' */}
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Your Name:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            value={name}
            onChangeText={text => setName(text)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>iCloud Email:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            keyboardType="email-address"
            value={email}
            onChangeText={text => setEmail(text)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>iCloud Password:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            secureTextEntry
            value={password}
            onChangeText={text => setPassword(text)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={text => setPhoneNumber(text)}
          />
        </View>

        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Camera Type:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your Camera type"
            value={camera}
            onChangeText={text => setCamera(text)}
          />
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    // backgroundColor: '#FFE6E8',
    backgroundColor: 'rgba(255, 230, 232, 0.2)'
  },
  body: {
    // backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    fontSize: 40,
    // backgroundColor: '#FFC0CB',
    // backgroundColor: 'rgba(65, 56, 57, 0.8)',
    backgroundColor: 'rgba(63, 0, 15, 0.5)',
    color: '#fff',
    padding: 20,
    borderRadius: 50,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  inputContainer: {
    marginBottom: 20,
    // backgroundColor: '#B6B6B4'
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#F5F5F5'
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#A9A9A9',
  },

  icon: {
    color: '#FFFFFF'
  }

});

