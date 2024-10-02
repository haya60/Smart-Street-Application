import React, { useEffect, useState } from 'react';
import { Button, View, Image, Platform, StyleSheet, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';
import { Pressable } from 'react-native';

const UploadDetail = ({ navigation }) => {
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [processedVideoUrl, setProcessedVideoUrl] = useState(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const libraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (libraryStatus.status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  const pickMedia = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      });

      if (result.cancelled) {
        console.log('Media picker was cancelled');
        return;
      }

      if (result.assets[0].uri) {
        setMedia(result.assets[0].uri);
        setMediaType(result.assets[0].type || 'video/mp4');
        console.log('Media URI:', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking media: ', error);
    }
  };

  const uploadVideo = async () => {
    if (!media) return;

    const formData = new FormData();
    formData.append('video', {
      uri: Platform.OS === 'android' ? media : media.replace('file://', ''),
      name: 'video.mp4',
      type: mediaType || 'video/mp4',
    });

    try {
      const response = await fetch('http://172.20.10.3:5000/predict', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${errorText}`);
      }

      const result = await response.json();
      setProcessedVideoUrl(result.video_url);
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a video to predict violating vehicles:</Text>
      <Pressable style={styles.button} onPress={pickMedia}>
        <Text style={styles.buttonText}>Select Video</Text>
      </Pressable>
      {media && mediaType && mediaType.includes('video') && (
        <Video
          source={{ uri: media }}
          style={styles.video}
          useNativeControls
          resizeMode="contain"
          isLooping
          shouldPlay
        />
      )}
      <Pressable
        style={[styles.button, { marginTop: 20 }]}
        onPress={uploadVideo}
        disabled={!media}
      >
        <Text style={styles.buttonText}>Process Video</Text>
      </Pressable>
      {processedVideoUrl && (
        <Video
          source={{ uri: processedVideoUrl }}
          style={styles.video}
          useNativeControls
          resizeMode="contain"
          isLooping
          shouldPlay
        />
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 230, 232, 0.6)',
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  button: {
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
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  video: {
    width: 300,
    height: 200,
    marginTop: 20,
  },
  backButton: {
    marginTop: 20,
  },
  backButtonText: {
    fontSize: 18,
    marginBottom: 10,
    color: '#003F5C',
    padding: 25,
  },
});

export default UploadDetail;