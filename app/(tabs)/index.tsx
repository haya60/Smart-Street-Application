import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaskedView from '@react-native-masked-view/masked-view';

const HomeScreen = () => {
  const navigation = useNavigation(); 

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <MaskedView
          style={{ flexDirection: 'row', height: 60 }} 
          maskElement={
            <View
              style={{
                backgroundColor: 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 40,
                  color: 'black',
                  fontWeight: 'bold',
                }}
              >
                SMART STREET
              </Text>
            </View>
          }
        >
          {/* Background Colors */}
          <View style={{ flex: 1, backgroundColor: '#2B1B17' }} />
          <View style={{ flex: 1, backgroundColor: '#2F0909' }} />
          <View style={{ flex: 1, backgroundColor: '#3D0C02' }} />
          <View style={{ flex: 1, backgroundColor: '#3F000F' }} />
        </MaskedView>
      </View>

      {/* Styled Buttons */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('uploadPage')} // Navigate to the Upload Page
      >
        <Text style={styles.buttonText}>Upload File</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('livePage')}
      >
        <Text style={styles.buttonText}>Start Live</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    // backgroundColor: 'rgba(255, 230, 232, 0.2)',
    backgroundColor: 'rgba(255, 230, 232, 0.6)',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20, // Space between title and buttons
  },
  button: {
    // backgroundColor: 'rgba(65, 56, 57, 0.8)',
    // backgroundColor: 'rgba(86, 3, 25, 0.5)',
    backgroundColor: 'rgba(63, 0, 15, 0.5)',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
    width: 230,
    height: 60,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default HomeScreen;