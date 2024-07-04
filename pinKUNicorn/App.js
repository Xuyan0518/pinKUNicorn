import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Linking,
  Image,
  TextInput,
  ScrollView,
} from "react-native";
import ViewPager from "@react-native-community/viewpager";
import { Video } from "expo-av";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faHome,
  faUserFriends,
  faPlus,
  faEnvelope,
  faUser,
  faShoppingBag,
} from "@fortawesome/free-solid-svg-icons";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import RecommendationsPage from "./components/RecommendationsPage"; // Import RecommendationsPage
import getChatGPTResponse from "./ChatGPTService"; // Import ChatGPTService
import fetchProducts from "./FakeShop";


const { height, width } = Dimensions.get("window");

const videos = [
  { id: 1, type: "video", uri: require("./resources/v1.mp4") },
  { id: 2, type: "video", uri: require("./resources/v2.mp4") },
];

const products = [
  {
    id: 1,
    name: "Product 1",
    url: "https://example.com/product1",
    image: require("./resources/product1.jpg"),
  },
  {
    id: 2,
    name: "Product 2",
    url: "https://example.com/product2",
    image: require("./resources/product2.jpg"),
  },
  {
    id: 3,
    name: "Product 3",
    url: "https://example.com/product3",
    image: require("./resources/product3.jpg"),
  },
  {
    id: 4,
    name: "Product 4",
    url: "https://example.com/product4",
    image: require("./resources/product4.jpg"),
  },
];

const questions = [
  "What is your area of interest?",
  "What is price range you are willing to pay?",
  "Do you prefer some more trendy or more unique?",
  "What style are you looking for?",
  "Who are you purchasing for?",
  "Which city is the recipient living in?",
  "How long can you wait for delivery?",
  "You can key in anything here (for example: I am buying it for my mother on Mother's Day)",
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

const TailorTastePage = ({ navigation }) => {
  const [answers, setAnswers] = useState(
    questions.map((question) => ({ question, answer: "" }))
  );
  const [response, setResponse] = useState("");

  const handleInputChange = (text, index) => {
    const newAnswers = [...answers];
    newAnswers[index] = { ...newAnswers[index], answer: text };
    setAnswers(newAnswers);
  };
  const handleSubmit = async () => {
    const {
      interest,
      priceRange,
      trendiness,
      style,
      recipient,
      recipientAddress,
      deliveryTime,
      anyInput,
    } = answers.reduce(
      (acc, { question, answer }) => {
        switch (question) {
          case "What is your area of interest?":
            acc.interest = answer;
            break;
          case "What is price range you are willing to pay?":
            acc.priceRange = answer;
            break;
          case "Do you prefer some more trendy or more unique?":
            acc.trendiness = answer;
            break;
          case "What style are you looking for?":
            acc.style = answer;
            break;
          case "Who are you purchasing for?":
            acc.recipient = answer;
            break;
          case "Which city is the recipient living in?":
            acc.recipientAddress = answer;
            break;
          case "How long can you wait for delivery?":
            acc.deliveryTime = answer;
            break;
          case "You can key in anything here (for example: I am buying it for my mother on Mother's Day)":
            acc.anyInput = answer;
            break;
          default:
            break;
        }
        return acc;
      },
      {}
    );
  
    const prompt = `You are helping a customer find a product. The customer's interests are in ${interest}. They are willing to pay ${priceRange}. They prefer something ${trendiness}. They are looking for a style that is ${style}. They are purchasing for ${recipient}, who lives in ${recipientAddress}. They can wait ${deliveryTime} for delivery. Additional notes: ${anyInput}.`;
  
    try {
      const products = await fetchProducts();
      const productsList = products.map(product => ({
        title: product.title,
        price: product.price,
        category: product.category,
        description: product.description,
        stock: product.count,
        rating: product.rating
      }));
  
      const productsString = JSON.stringify(productsList);
      const combinedPrompt = `${prompt} ${productsString}`;
  
      const chatGPTResponse = await getChatGPTResponse(combinedPrompt);
  
      const recommendedProducts = products.filter(product =>
        chatGPTResponse.includes(product.title)
      );
  
      navigation.navigate("Recommendations", { recommendations: recommendedProducts });
    } catch (error) {
      console.error("Error:", error);
      setResponse("An error occurred while fetching the response.");
    }
  };
  
  

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Tailor Your Taste Page</Text>
      {answers.map((item, index) => (
        <View key={index} style={styles.questionContainer}>
          <Text style={styles.questionText}>{item.question}</Text>
          <TextInput
            style={styles.input}
            placeholder={`Answer ${index + 1}`}
            value={item.answer}
            onChangeText={(text) => handleInputChange(text, index)}
          />
        </View>
      ))}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
      {response ? (
        <View style={styles.responseContainer}>
          <Text style={styles.responseText}>{response}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
};


const ProductPage = ({ navigation }) => {
  const handleProductPress = (url) => {
    Linking.openURL(url);
  };

  const handleTailorTaste = () => {
    navigation.navigate("TailorTaste");
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
      <TouchableOpacity style={styles.tailorTaste} onPress={handleTailorTaste}>
        <Text style={styles.tailorTasteText}>
          Didn't see anything you like?
        </Text>
        <Text style={styles.tailorTasteText}>Tailor your taste!</Text>
      </TouchableOpacity>
    </View>
  );
};

const MainScreen = ({ navigation }) => {
  const viewPagerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pages, setPages] = useState([]);

  useEffect(() => {
    const newPages = [];
    videos.forEach((video, index) => {
      newPages.push(video);
      if ((index + 1) % 2 === 0) {
        newPages.push({ id: `product-${index}`, type: "product" });
      }
    });
    setPages(newPages);
  }, []);

  const handlePageSelected = (e) => {
    const { position } = e.nativeEvent;
    setActiveIndex(position);
  };

  const renderPage = (page, index) => {
    if (page.type === "video") {
      return (
        <View key={page.id} style={styles.page}>
          <VideoItem source={page.uri} isActive={index === activeIndex} />
        </View>
      );
    } else if (page.type === "product") {
      return (
        <View key={page.id} style={styles.page}>
          <ProductPage navigation={navigation} />
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <View style={styles.header}>
        <Text style={styles.headerText}>Friends</Text>
        <Text style={styles.headerText}>Following</Text>
        <Text style={styles.headerTextActive}>For You</Text>
      </View>
      <ViewPager
        ref={viewPagerRef}
        style={styles.viewPager}
        initialPage={0}
        orientation="vertical"
        onPageSelected={handlePageSelected}
      >
        {pages.map((page, index) => renderPage(page, index))}
      </ViewPager>
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomBarButton}>
          <FontAwesomeIcon icon={faHome} size={20} color="white" />
          <Text style={styles.bottomBarText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBarButton}>
          <FontAwesomeIcon icon={faShoppingBag} size={20} color="white" />
          <Text style={styles.bottomBarText}>Shop</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBarButtonActive}>
          <FontAwesomeIcon icon={faPlus} size={20} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBarButton}>
          <FontAwesomeIcon icon={faEnvelope} size={20} color="white" />
          <Text style={styles.bottomBarText}>Inbox</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomBarButton}>
          <FontAwesomeIcon icon={faUser} size={20} color="white" />
          <Text style={styles.bottomBarText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Main">
        <Stack.Screen
          name="Main"
          component={MainScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="TailorTaste" component={TailorTastePage} />
        <Stack.Screen name="Recommendations" component={RecommendationsPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white" 
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
    backgroundColor: "black",
  },
  video: {
    flex: 1,
  },
  productPage: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    paddingTop: 80, // Increase this value to add more padding at the top
  },
  productPageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: 10, // Add some horizontal margin if needed
  },
  productItem: {
    width: "48%", // You can increase this to make the items wider
    aspectRatio: 0.7, // Keep this if you want square items
    marginBottom: 25, // Increase bottom margin for more space between rows
    borderWidth: 1,
    borderColor: "red",
    borderRadius: 10,
    overflow: "hidden",
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain", // or 'cover' if you want to fill the entire space
  },
  tailorTaste: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "red",
    borderRadius: 10,
    padding: 10,
  },
  tailorTasteText: {
    textAlign: "center",
    color: "red",
  },
  header: {
    position: "absolute",
    top: 50,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    opacity: 1,
    zIndex: 1,
  },
  headerText: {
    color: "white",
    fontSize: 18,
  },
  headerTextActive: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "black",
    paddingVertical: 10,
  },
  bottomBarButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  bottomBarButtonActive: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    width: 50,
    height: 30,
    borderRadius: 5,
  },
  bottomBarText: {
    color: "white",
    fontSize: 10,
  },
  tailorTastePage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  scrollContainer: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  questionContainer: {
    width: "100%",
    marginBottom: 15,
  },
  questionText: {
    fontSize: 18,
    marginBottom: 5,
    color: "black",
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    padding: 10,
    width: "100%",
    backgroundColor: "white",
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: "red",
    borderRadius: 5,
    padding: 10,
  },
  submitButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
  },
  responseContainer: {
    marginTop: 20,
  },
  responseText: {
    fontSize: 16,
    textAlign: "center",
  },
});

export default App;
