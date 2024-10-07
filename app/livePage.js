import React, { useState } from 'react';
import { View, Pressable, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

const LivePage = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [liveStreamUri, setLiveStreamUri] = useState(null);

  const startStream = async () => {
    setLoading(true);
    try {
      setIsStreaming(true);
      setLiveStreamUri('http://172.20.10.3:8501');  // Replace with your Streamlit server URL
    } catch (error) {
      console.error("Error starting stream", error);
    } finally {
      setLoading(false);
    }
  };

  const stopStream = async () => {
    setLoading(true);
    try {
      setIsStreaming(false);
      setLiveStreamUri(null);
    } catch (error) {
      console.error("Error stopping stream", error);
    } finally {
      setLoading(false);
    }
  };

  // const startStream = async () => {
  //   setLoading(true);
  //   try {
  //     // Send a request to the Flask API to start the stream
  //     await fetch('http://172.20.10.3:5000/start-stream', {
  //       method: 'POST',
  //     });
  //     setIsStreaming(true);
  //     setLiveStreamUri('http://172.20.10.3:8501');  // Replace with your Streamlit server URL
  //   } catch (error) {
  //     console.error("Error starting stream", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  
  // const stopStream = async () => {
  //   setLoading(true);
  //   try {
  //     // Send a request to the Flask API to stop the stream
  //     await fetch('http://172.20.10.3:5000/stop-stream', {
  //       method: 'POST',
  //     });
  //     setIsStreaming(false);
  //     setLiveStreamUri(null);
  //   } catch (error) {
  //     console.error("Error stopping stream", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Start live streaming to predict violating vehicles:</Text>
      <Pressable style={styles.button} onPress={startStream} disabled={isStreaming}>
        <Text style={styles.buttonText}>Start Stream</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={stopStream} disabled={!isStreaming}>
        <Text style={styles.buttonText}>Stop Stream</Text>
      </Pressable>

      {loading && <ActivityIndicator size="large" color="#0000ff" />}

      {isStreaming && liveStreamUri && (
        <WebView
          source={{ uri: liveStreamUri }}
          style={[styles.webview, { backgroundColor: 'transparent' }]}
          javaScriptEnabled={true}
          domStorageEnabled={true}
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
    webview: {
      width: 300,
      height: 200,
      marginTop: 20,
    },
  });
  
  export default LivePage;