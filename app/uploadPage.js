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
        mediaTypes: ImagePicker.MediaTypeOptions.Videos, // Restrict to videos
        allowsEditing: true,
        quality: 1,
      });

      if (result.cancelled) {
        console.log('Media picker was cancelled');
        return;
      }

      if (result.assets[0].uri) {
        setMedia(result.assets[0].uri);
        setMediaType(result.assets[0].type || 'video/mp4'); // Default to 'video/mp4' if type is null
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
          'Accept': 'application/json', // Ensure the client accepts JSON
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorText = await response.text(); // Retrieve error response
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
      <Button title="Upload Video" onPress={pickMedia} />
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
      <Button title="Process Video" onPress={uploadVideo} disabled={!media} />
      {processedVideoUrl && (
        <Video
          source={{ uri: processedVideoUrl }} // Use the processed video URL
          style={styles.video}
          useNativeControls
          resizeMode="contain"
          isLooping
          shouldPlay
        />
      )}
      {/* <Pressable onPress={() => navigation.goBack()}>
        <Text style={{ fontSize: 18, marginBottom: 10, color: '#003F5C', padding: 25 }}>Go back</Text>
      </Pressable> */}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: 300,
    height: 200,
    marginTop: 20,
  },
});

export default UploadDetail;