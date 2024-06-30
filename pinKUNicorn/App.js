import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions, StatusBar } from 'react-native';
import ViewPager from '@react-native-community/viewpager';
import { Video } from 'expo-av';

const { height, width } = Dimensions.get('window');

const videos = [
  { id: 1, uri: require('./resources/v1.mp4') },
  { id: 2, uri: require('./resources/v2.mp4') },
];

const VideoItem = ({ source }) => {
  const video = useRef(null);

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
  const viewPagerRef = useRef(null);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <ViewPager
        ref={viewPagerRef}
        style={styles.viewPager}
        initialPage={0}
        orientation="vertical"
      >
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
    width: width,
    height: height,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  video: {
    flex: 1,
  },
});

export default App;