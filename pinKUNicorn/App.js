// import { StatusBar } from 'expo-status-bar';
// import { StyleSheet, Text, View } from 'react-native';

// export default function App() {
//   return (
//     <View style={styles.container}>
//       <Text>use this to continue!</Text>
//       <StatusBar style="auto" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, StatusBar } from 'react-native';
import ViewPager from '@react-native-community/viewpager';
import { Video } from 'expo-av';

const { height } = Dimensions.get('window');

const videos = [
  { id: 1, uri: require('./resources/v1.mp4') },
  { id: 2, uri: require('./resources/v2.mp4') },
];

const VideoItem = ({ source }) => {
  const video = useRef(null);

  useEffect(() => {
    return () => {
      if (video.current) {
        video.current.unloadAsync();
      }
    };
  }, []);

  return (
    <View style={styles.videoContainer}>
      <Video
        ref={video}
        source={source}
        style={styles.video}
        resizeMode="cover"
        shouldPlay
        isLooping
      />
    </View>
  );
};

const App = () => {
  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <ViewPager style={styles.viewPager} initialPage={0}>
        {videos.map(video => (
          <View key={video.id} style={styles.page}>
            <VideoItem source={video.uri} />
          </View>
        ))}
      </ViewPager>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  viewPager: {
    flex: 1,
  },
  page: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    width: '100%',
    height: height,
    backgroundColor: 'black',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});

export default App;
