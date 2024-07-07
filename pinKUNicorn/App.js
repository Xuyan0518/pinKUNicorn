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
import { SafeAreaView } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";



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
  "Describe Your Recipient",
  "Describe Your Product",
  "Price Range",
  "Trendiness",
  "Style",
  "Delivery Location",
  "Delivery Before"
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
  const [initialQuestionAnswered, setInitialQuestionAnswered] = useState(false);
  const [response, setResponse] = useState("")
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState("")

  const handleInputChange = (text, index) => {
    const newAnswers = [...answers];
    newAnswers[index] = { ...newAnswers[index], answer: text };
    setAnswers(newAnswers);
  };

  useEffect(() => {
    const areInitialQuestionsAnswered = answers[0].answer.trim() !== "" && answers[1].answer.trim() !== "";
    setInitialQuestionAnswered(areInitialQuestionsAnswered);
  }, [answers]);

  const handleSubmit = async () => {
    const allQuestionAnswered = answers.every(item => item.answer.trim() !== "");

    if (allQuestionAnswered) {
      console.log("all answered")
    } else {
      console.log("Please answer all questions")
    }

    const {
      priceRange,
      trendiness,
      style,
      recipient,
      recipientAddress,
      deliveryTime,
      product,
    } = answers.reduce(
      (acc, { question, answer }) => {
        switch (question) {
          case "Price Range":
            acc.priceRange = answer;
            break;
          case "Trendiness":
            acc.trendiness = answer;
            break;
          case "Describe Your Recipient":
            acc.recipient = answer;
            break;
          case "Delivery Location":
            acc.recipientAddress = answer;
            break;
          case "Style":
            acc.style = answer;
            break;
          case "Delivery Before":
            acc.deliveryTime = answer;
            break;
          case "Describe Your Product":
            acc.product = answer;
            break;
          default:
            break;
        }
        return acc;
      },
      {}
    );
  
    const prompt = `You are helping a customer find a product. The customer is willing to pay ${priceRange}. They prefer something ${trendiness}. They are looking for a style that is ${style}. They are purchasing for ${recipient}, who lives in ${recipientAddress}. They can wait ${deliveryTime} for delivery. Additional notes: ${product}. Recommend the customer 5 products from the products here by only listing out only the ids of the products, nothing else to be listed!!!!: \n`;
  
    try {
      // await addProduct();
      const products = await fetchProducts();
      const productsList = products.map(product => ({
        id: product.id,
        title: product.title,
        price: product.price,
        category: product.category,
        description: product.description,
        // stock: product.count,
        // rating: product.rating,
        image: product.image
      }));
      // console.log(`ProductsList: ${productsList.map(item => item.id)}`);

      const productsString = JSON.stringify(productsList);
      const combinedPrompt = `${prompt} ${productsString}`;
      const chatGPTResponse = await getChatGPTResponse(combinedPrompt);
      console.log(`GPT result: ${chatGPTResponse}`);
      const recommendedProductList = productsList.filter(item => 
        chatGPTResponse.includes(item.id.toString())
      );
      console.log(`recommended products: ${recommendedProductList.map(product => product.id)}`);
      //const recommendedProducts = productsList.filter(product => product.title == recommendedProductList.title);
      navigation.navigate("Recommendations", { recommendations: recommendedProductList });
    } catch (error) {
      console.error("Error:", error);
      setResponse("An error occurred while fetching the response.");
    }
  };

  const toggleShowAllQuestions = () => {
    setShowAllQuestions(!showAllQuestions);
  }

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  }

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  }

  const handleConfirm = (date) => {
    const formattedDate = date.toISOString().split("T")[0];
    setSelectedDate(formattedDate);
    handleInputChange(formattedDate, answers.findIndex(item => item.question === "Delivery Before"));
    hideDatePicker();
  };
  
  

  return (
    <SafeAreaView style={styles.scrollContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Tailor Your Taste Page</Text>
        {answers.slice(0, 2).map((item, index) => (
          <View key={index} style={styles.questionContainer}>
            <Text style={styles.questionText}>{item.question}</Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder={`Description`}
              value={item.answer}
              onChangeText={(text) => handleInputChange(text, index)}
            />
          </View>
        ))}
        {!showAllQuestions ? (
          <TouchableOpacity onPress={toggleShowAllQuestions} style={styles.option}>
            <Text style={styles.optionText}>More options</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={toggleShowAllQuestions} style={styles.option}>
            <Text style={styles.optionText}>Fold options</Text>
          </TouchableOpacity>
        )}
        {showAllQuestions && (
          <>
            {answers.slice(2).map((item, index) => (
              <View key={index + 2} style={styles.questionContainer}>
                <Text style={styles.questionText}>{item.question}</Text>
                {item.question === "Delivery Before" ? (
                  <>
                    <TouchableOpacity
                      onPress={showDatePicker}
                      style={styles.dateButton}
                    >
                      <Text style={styles.dateButtonText}>
                        {selectedDate || "Select Delivery Date"}
                      </Text>
                    </TouchableOpacity>
                    <DateTimePickerModal
                      isVisible={isDatePickerVisible}
                      mode="date"
                      onConfirm={handleConfirm}
                      onCancel={hideDatePicker}
                    />
                  </>
                ) : (
                  <TextInput
                    style={styles.input}
                    placeholder={`Enter ${item.question}`}
                    value={item.answer}
                    onChangeText={(text) =>
                      handleInputChange(text, index + 2)
                    }
                  />
                )}
              </View>
            ))}
          </>
        )}
        {!initialQuestionAnswered && (
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Anyway</Text>
          </TouchableOpacity>
        )}
        {response ? (
          <View style={styles.responseContainer}>
            <Text style={styles.responseText}>{response}</Text>
          </View>
        ) : null}

        {initialQuestionAnswered && (
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        )}
        {response ? (
          <View style={styles.responseContainer}>
            <Text style={styles.responseText}>{response}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
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
    <SafeAreaView style={styles.productPage}>
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
    </SafeAreaView>
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
    <NavigationContainer style={styles.app}>
      <Stack.Navigator initialRouteName="Main">
        <Stack.Screen
          name="Main"
          component={MainScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="TailorTaste" component={TailorTastePage} options={{ headerShown: false }}/>
        <Stack.Screen name="Recommendations" component={RecommendationsPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: "black"
  },
  video: {
    flex: 1,
  },
  productPage: {
    flex: 1,
    backgroundColor: "black"
  },
  productPageTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 20,
    color: "#FFFFFF",
    padding: 20,
  },
  productGrid: {
    padding: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productItem: {
    width: "49%",
    aspectRatio: 0.7,
    borderRadius: 10,
    marginBottom: 10,
    overflow: "hidden",
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  productImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    resizeMode: "cover",
  },
  tailorTaste: {
    borderRadius: 10,
    padding: 10,
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: "#FE2D55",
  },
  tailorTasteText: {
    textAlign: "center",
    color: "#FFFFFF",
    fontFamily: "Inter-Extrabold",
    lineHeight: 22,
    fontSize: 17,
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
    textDecorationLine: "underline"
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
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  scrollContainer: {
    alignItems: "center",
    backgroundColor: "white",
    flex: 1,
    
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 10,
    fontFamily: "Inter-Bold"
  },
  questionContainer: {
    width: "100%",
    marginTop: 30,
    marginBottom: 5,
  },
  questionText: {
    fontSize: 20,
    marginBottom: 10,
    color: "black",
    fontFamily: "Inter-Semibold"
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 10,
    padding: 10,
    width: 400,
    height: 200,
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 10,
    padding: 10,
    width: 400,
  },
  submitButton: {
    marginTop: 10,
    backgroundColor: "#E94359",
    borderRadius: 10,
    padding: 15,
  },
  submitButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 17,
    fontFamily: "Inter-Bold"
  },
  responseContainer: {
    marginTop: 20,
  },
  responseText: {
    fontSize: 16,
    textAlign: "center",
  },
  option: {
    padding: 8,
    alignSelf: "center",
    borderRadius: 10,
  },
  optionText: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    textDecorationLine: "underline"
  }
});

export default App;