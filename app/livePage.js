import React, { useState } from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import { Video } from 'expo-av';

const LivePage = () => {
  const [videoUri, setVideoUri] = useState(null);

  const startStream = async () => {
    try {
      // Start live stream
      const response = await fetch('http://172.20.10.3:6000/stream', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Error starting stream');
      }
    } catch (error) {
      console.error("Error starting stream", error);
    }
  };

  const stopStream = async () => {
    try {
      const response = await fetch('http://172.20.10.3:6000/stop', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Error stopping stream');
      }

      const result = await response.json();
      console.log("Video path received:", result.video_path); // Log the path
      setVideoUri(result.video_path);
    } catch (error) {
      console.error("Error stopping stream", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Start live streaming to predict violating vehicles:</Text>
      <Pressable style={styles.button} onPress={startStream}>
        <Text style={styles.buttonText}>Start Stream</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={stopStream}>
        <Text style={styles.buttonText}>Stop Stream</Text>
      </Pressable>

      {videoUri && (
        <Video
          source={{ uri: videoUri }}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode="cover"
          shouldPlay
          style={styles.video}
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
    backgroundColor: 'rgba(255, 230, 232, 0.2)',
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
    height: 300,
    marginTop: 20,
  },
});

export default LivePage;
