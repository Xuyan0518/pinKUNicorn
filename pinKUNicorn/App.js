import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, StatusBar, TouchableOpacity, Linking } from 'react-native';
import ViewPager from '@react-native-community/viewpager';
import { Video } from 'expo-av';

const { height, width } = Dimensions.get('window');

const videos = [
  { id: 1, type: 'video', uri: require('./resources/v1.mp4') },
  { id: 2, type: 'video', uri: require('./resources/v2.mp4') },
];

const products = [
  { id: 1, name: 'Product 1', url: 'https://example.com/product1' },
  { id: 2, name: 'Product 2', url: 'https://example.com/product2' },
  { id: 3, name: 'Product 3', url: 'https://example.com/product3' },
];

const VideoItem = ({ source, isActive }) => {
  const video = useRef(null);

  useEffect(() => {
    if (video.current) {
      if (isActive) {
        video.current.playAsync();
      } else {
        video.current.pauseAsync();
      }
    }
  }, [isActive]);

  return (
    <View style={styles.videoContainer}>
      <Video
        ref={video}
        source={source}
        style={styles.video}
        resizeMode="cover"
        shouldPlay={false}
        isLooping
      />
    </View>
  );
};

const ProductPage = () => {
  const handleProductPress = (url) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.productPage}>
      <Text style={styles.productPageTitle}>Recommended Products</Text>
      {products.map((product) => (
        <TouchableOpacity
          key={product.id}
          style={styles.productItem}
          onPress={() => handleProductPress(product.url)}
        >
          <Text style={styles.productName}>{product.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const App = () => {
  const viewPagerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pages, setPages] = useState([]);

  useEffect(() => {
    const newPages = [];
    videos.forEach((video, index) => {
      newPages.push(video);
      if ((index + 1) % 2 === 0) {
        newPages.push({ id: `product-${index}`, type: 'product' });
      }
    });
    setPages(newPages);
  }, []);

  const handlePageSelected = (e) => {
    const { position } = e.nativeEvent;
    setActiveIndex(position);
  };

  const renderPage = (page, index) => {
    if (page.type === 'video') {
      return (
        <View key={page.id} style={styles.page}>
          <VideoItem source={page.uri} isActive={index === activeIndex} />
        </View>
      );
    } else if (page.type === 'product') {
      return (
        <View key={page.id} style={styles.page}>
          <ProductPage />
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <ViewPager
        ref={viewPagerRef}
        style={styles.viewPager}
        initialPage={0}
        orientation="vertical"
        onPageSelected={handlePageSelected}
      >
        {pages.map((page, index) => renderPage(page, index))}
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
  productPage: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productPageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  productItem: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    margin: 10,
    borderRadius: 5,
    width: 200,
    alignItems: 'center',
  },
  productName: {
    fontSize: 16,
  },
});

export default App;