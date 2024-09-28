import React, { useEffect, useState } from 'react';
import { View, Button } from 'react-native';
import { Video } from 'expo-av';

const LivePage = () => {
  const [videoUri, setVideoUri] = useState(null);

  const startStream = async () => {
    try {
      // Start live stream
      const response = await fetch('http://172.20.10.3:5000/stream', {
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
      const response = await fetch('http://172.20.10.3:5000/stop', {
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
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Start Stream" onPress={startStream} />
      <Button title="Stop Stream" onPress={stopStream} />

      {videoUri && (
        <Video
          source={{ uri: videoUri }}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode="cover"
          shouldPlay
          style={{ width: 300, height: 300 }}
        />
      )}
    </View>
  );
};

export default LivePage;


























// import React, { useEffect, useState } from 'react';
// import { View, Button, FlatList, Text, TouchableOpacity } from 'react-native';
// import { Video } from 'expo-av';
// import axios from 'axios';

// const LivePage = () => {
//   const [videoUri, setVideoUri] = useState(null);
//   const [videos, setVideos] = useState([]);

//   const startStream = async () => {
//     try {
//       await axios.post('http://172.20.10.3:5000/stream');
//     } catch (error) {
//       console.error("Error starting stream", error);
//     }
//   };

//   const stopStream = async () => {
//     try {
//       const response = await axios.post('http://172.20.10.3:5000/stop');
//       console.log(response.data);
//       const videoFileName = response.data.video_path.split('/').pop();
//       setVideoUri(`http://172.20.10.3:5000${response.data.video_path}`);
//       fetchVideos();  // Refresh the list of videos
//     } catch (error) {
//       console.error("Error stopping stream", error);
//     }
//   };

//   const fetchVideos = async () => {
//     try {
//       const response = await axios.get('http://172.20.10.3:5000/videos');
//       setVideos(response.data);
//     } catch (error) {
//       console.error("Error fetching videos", error);
//     }
//   };

//   useEffect(() => {
//     fetchVideos();  // Fetch video list when component mounts
//   }, []);

//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Button title="Start Stream" onPress={startStream} />
//       <Button title="Stop Stream" onPress={stopStream} />

//       {videoUri && (
//         <Video
//           source={{ uri: videoUri }}
//           rate={1.0}
//           volume={1.0}
//           isMuted={false}
//           resizeMode="cover"
//           shouldPlay
//           style={{ width: 300, height: 300 }}
//         />
//       )}

//       <FlatList
//         data={videos}
//         keyExtractor={(item) => item}
//         renderItem={({ item }) => (
//           <TouchableOpacity
//             onPress={() => setVideoUri(`http://172.20.10.3:5000/videos/${item}`)}
//             style={{ padding: 10 }}
//           >
//             <Text>{item}</Text>
//           </TouchableOpacity>
//         )}
//       />
//     </View>
//   );
// };

// export default LivePage;
