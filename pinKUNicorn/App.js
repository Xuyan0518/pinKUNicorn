import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, StatusBar, TouchableOpacity, Linking, Image } from 'react-native';
import ViewPager from '@react-native-community/viewpager';
import { Video } from 'expo-av';

const { height, width } = Dimensions.get('window');

const videos = [
  { id: 1, type: 'video', uri: require('./resources/v1.mp4') },
  { id: 2, type: 'video', uri: require('./resources/v2.mp4') },
];

const products = [
  { id: 1, name: 'Product 1', url: 'https://example.com/product1', image: require('./resources/product1.jpg') },
  { id: 2, name: 'Product 2', url: 'https://example.com/product2', image: require('./resources/product2.jpg') },
  { id: 3, name: 'Product 3', url: 'https://example.com/product3', image: require('./resources/product3.jpg') },
  { id: 4, name: 'Product 4', url: 'https://example.com/product4', image: require('./resources/product4.jpg') },
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
      <Text style={styles.productPageTitle}>Trending of Today</Text>
      <View style={styles.productGrid}>
        {products.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={styles.productItem}
            onPress={() => handleProductPress(product.url)}
          >
            <Image source={product.image} style={styles.productImage} />
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.tailorTaste}>
        <Text style={styles.tailorTasteText}>Didn't see anything you like?</Text>
        <Text style={styles.tailorTasteText}>Tailor your taste!</Text>
      </View>
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
    padding: 20,
    paddingTop: 80, // Increase this value to add more padding at the top
  },
  productPageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 10, // Add some horizontal margin if needed
  },
  productItem: {
    width: '48%', // You can increase this to make the items wider
    aspectRatio: 0.7, // Keep this if you want square items
    marginBottom: 25, // Increase bottom margin for more space between rows
    borderWidth: 1,
    borderColor: 'red',
    borderRadius: 10,
    overflow: 'hidden',
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain', // or 'cover' if you want to fill the entire space
  },
  tailorTaste: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'red',
    borderRadius: 10,
    padding: 10,
  },
  tailorTasteText: {
    textAlign: 'center',
    color: 'red',
  },
});

export default App;