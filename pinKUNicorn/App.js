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
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
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
import { Picker } from "@react-native-picker/picker";
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
  "Delivery Before",
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
  const questions = [
    "Describe Your Recipient",
    "Describe Your Product",
    "Price Range",
    "Trendiness",
    "Style",
    "Delivery Location",
    "Delivery Before",
  ];

  const [answers, setAnswers] = useState(
    questions.map((question) => ({ question, answer: "" }))
  );
  const [initialQuestionAnswered, setInitialQuestionAnswered] = useState(false);
  const [response, setResponse] = useState("");
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [priceRange, setPriceRange] = useState("");
  const [trendiness, setTrendiness] = useState("");
  const [style, setStyle] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  const handleInputChange = (text, index) => {
    const newAnswers = [...answers];
    newAnswers[index] = { ...newAnswers[index], answer: text };
    setAnswers(newAnswers);
  };

  useEffect(() => {
    const areInitialQuestionsAnswered =
      answers[0].answer.trim() !== "" && answers[1].answer.trim() !== "";
    setInitialQuestionAnswered(areInitialQuestionsAnswered);
  }, [answers]);

  const handleSubmit = async () => {
    const allQuestionAnswered =
      answers.every((item) => item.answer.trim() !== "") &&
      priceRange !== "" &&
      trendiness !== "" &&
      style !== "";

    if (allQuestionAnswered) {
      console.log("all answered");
    } else {
      console.log("Please answer all questions");
    }

    const prompt = `
      You are helping a customer find a product. 
      Here is the description of the recipient: ${
        answers.find((a) => a.question === "Describe Your Recipient").answer ||
        "no specific recipient description provided"
      }.
      Here is the description of the product the customer desires: ${
        answers.find((a) => a.question === "Describe Your Product").answer ||
        "no specific product description provided"
      }.
      They are looking for products of style: ${
        style || "no specific style"
      }, and trendiness of: ${trendiness || "no specific trendiness"}.
      The price range of the product is: ${
        priceRange || "no specific price range"
      }.
      The delivery location is: ${
        answers.find((a) => a.question === "Delivery Location").answer ||
        "no specific location"
      }, and prefers the products to be delivered by: ${
      answers.find((a) => a.question === "Delivery Before").answer ||
      "no specific delivery time"
    }.
      Based on the above information, recommend the customer 5 products from the products here by only listing out only the ids of the products, nothing else to be listed!!!!
    `;

    try {
      const products = await fetchProducts();
      const productsList = products.map((product) => ({
        id: product.id,
        title: product.title,
        price: product.price,
        category: product.category,
        description: product.description,
        image: product.image,
      }));

      const productsString = JSON.stringify(productsList);
      const combinedPrompt = `${prompt} ${productsString}`;
      console.log(combinedPrompt);
      const chatGPTResponse = await getChatGPTResponse(combinedPrompt);
      //console.log(`GPT result: ${chatGPTResponse}`);
      const recommendedProductList = productsList.filter((item) =>
        chatGPTResponse.includes(item.id.toString())
      );
      console.log(
        `recommended products: ${recommendedProductList.map(
          (product) => product.id
        )}`
      );
      navigation.navigate("Recommendations", {
        recommendations: recommendedProductList,
      });
    } catch (error) {
      console.error("Error:", error);
      setResponse("An error occurred while fetching the response.");
    }
  };

  const toggleShowAllQuestions = () => {
    setShowAllQuestions(!showAllQuestions);
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    const formattedDate = date.toISOString().split("T")[0];
    setSelectedDate(formattedDate);
    handleInputChange(
      formattedDate,
      answers.findIndex((item) => item.question === "Delivery Before")
    );
    hideDatePicker();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingView}
      keyboardVerticalOffset={100}
    >
      <SafeAreaView style={styles.safeareaScrollContainer}>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.buttonText}>&lt;Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("Shop")}
            style={styles.shopButton}
          >
            <Text style={styles.buttonText}>Shop more&gt;</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Tailor Your Taste</Text>
          {answers.slice(0, 2).map((item, index) => (
            <View key={index} style={styles.questionContainer}>
              <Text style={styles.questionText}>{item.question}</Text>
              <TextInput
                style={styles.descriptionInput}
                placeholder="Description"
                placeholderTextColor="#878789"
                value={item.answer}
                onChangeText={(text) => handleInputChange(text, index)}
              />
            </View>
          ))}
          {!showAllQuestions ? (
            <TouchableOpacity
              onPress={toggleShowAllQuestions}
              style={styles.option}
            >
              <Text style={styles.optionText}>More options</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={toggleShowAllQuestions}
              style={styles.option}
            >
              <Text style={styles.optionText}>Fold options</Text>
            </TouchableOpacity>
          )}
          {showAllQuestions && (
            <>
              {answers.slice(2).map((item, index) => (
                <View key={index + 2} style={styles.questionContainer}>
                  <Text style={styles.questionText}>{item.question}</Text>
                  {item.question === "Price Range" && (
                    <View>
                      <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        style={styles.priceContainer}
                      >
                        <Text style={styles.priceText}>
                          {priceRange ? priceRange : "Select Price Range"}
                        </Text>
                      </TouchableOpacity>
                      <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => {
                          setModalVisible(!modalVisible);
                        }}
                      >
                        <View style={styles.modalContainer}>
                          <View style={styles.modalView}>
                            <Text style={styles.modalTitle}>
                              Select Price Range
                            </Text>
                            <Picker
                              selectedValue={priceRange}
                              onValueChange={(itemValue) =>
                                setPriceRange(itemValue)
                              }
                              style={styles.picker}
                            >
                              <Picker.Item label="$0 - $50" value="$0 - $50" />
                              <Picker.Item
                                label="$50 - $100"
                                value="$50 - $100"
                              />
                              <Picker.Item
                                label="$100 - $200"
                                value="$100 - $200"
                              />
                              <Picker.Item
                                label="$200 - $500"
                                value="$200 - $500"
                              />
                              <Picker.Item
                                label="Over $500"
                                value="Over $500"
                              />
                            </Picker>
                            <TouchableOpacity
                              style={styles.confirmButton}
                              onPress={() => {
                                setModalVisible(false);
                                handleInputChange(
                                  priceRange,
                                  answers.findIndex(
                                    (item) => item.question === "Price Range"
                                  )
                                );
                              }}
                            >
                              <Text style={styles.confirmButtonText}>
                                Confirm
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </Modal>
                    </View>
                  )}
                  {item.question === "Trendiness" && (
                    <View style={styles.radioGroup}>
                      <TouchableOpacity
                        onPress={() => {
                          setTrendiness("Unique");
                          handleInputChange(
                            "Unique",
                            answers.findIndex(
                              (item) => item.question === "Trendiness"
                            )
                          );
                        }}
                        style={styles.radioButton}
                      >
                        <View
                          style={
                            trendiness === "Unique"
                              ? styles.radioSelected
                              : styles.radioUnselected
                          }
                        />
                        <Text style={styles.radioButtonText}>Unique</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setTrendiness("Trendy");
                          handleInputChange(
                            "Trendy",
                            answers.findIndex(
                              (item) => item.question === "Trendiness"
                            )
                          );
                        }}
                        style={styles.radioButton}
                      >
                        <View
                          style={
                            trendiness === "Trendy"
                              ? styles.radioSelected
                              : styles.radioUnselected
                          }
                        />
                        <Text style={styles.radioButtonText}>Trendy</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {item.question === "Style" && (
                    <View style={styles.radioGroup}>
                      <TouchableOpacity
                        onPress={() => {
                          setStyle("Casual");
                          handleInputChange(
                            "Casual",
                            answers.findIndex(
                              (item) => item.question === "Style"
                            )
                          );
                        }}
                        style={styles.radioButton}
                      >
                        <View
                          style={
                            style === "Casual"
                              ? styles.radioSelected
                              : styles.radioUnselected
                          }
                        />
                        <Text style={styles.radioButtonText}>Casual</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setStyle("Formal");
                          handleInputChange(
                            "Formal",
                            answers.findIndex(
                              (item) => item.question === "Style"
                            )
                          );
                        }}
                        style={styles.radioButton}
                      >
                        <View
                          style={
                            style === "Formal"
                              ? styles.radioSelected
                              : styles.radioUnselected
                          }
                        />
                        <Text style={styles.radioButtonText}>Formal</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setStyle("Sporty");
                          handleInputChange(
                            "Sporty",
                            answers.findIndex(
                              (item) => item.question === "Style"
                            )
                          );
                        }}
                        style={styles.radioButton}
                      >
                        <View
                          style={
                            style === "Sporty"
                              ? styles.radioSelected
                              : styles.radioUnselected
                          }
                        />
                        <Text style={styles.radioButtonText}>Sporty</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setStyle("Elegant");
                          handleInputChange(
                            "Elegant",
                            answers.findIndex(
                              (item) => item.question === "Style"
                            )
                          );
                        }}
                        style={styles.radioButton}
                      >
                        <View
                          style={
                            style === "Elegant"
                              ? styles.radioSelected
                              : styles.radioUnselected
                          }
                        />
                        <Text style={styles.radioButtonText}>Elegant</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {item.question === "Delivery Before" ? (
                    <>
                      <TouchableOpacity
                        onPress={showDatePicker}
                        style={styles.dateButton}
                      >
                        <Text
                          style={[
                            styles.dateButtonText,
                            selectedDate ? styles.selectedDateButtonText : {},
                          ]}
                        >
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
                    item.question !== "Price Range" &&
                    item.question !== "Trendiness" &&
                    item.question !== "Style" && (
                      <TextInput
                        style={styles.input}
                        placeholder={`Enter ${item.question}`}
                        placeholderTextColor="#878789"
                        value={item.answer}
                        onChangeText={(text) =>
                          handleInputChange(text, index + 2)
                        }
                      />
                    )
                  )}
                </View>
              ))}
            </>
          )}
          {!initialQuestionAnswered && (
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Submit Anyway</Text>
            </TouchableOpacity>
          )}
          {response ? (
            <View style={styles.responseContainer}>
              <Text style={styles.responseText}>{response}</Text>
            </View>
          ) : null}
          {initialQuestionAnswered && (
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const ShopPage = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require("./resources/shop_demo.jpg")}
        style={styles.shopImage}
      />
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
        <Stack.Screen
          name="TailorTaste"
          component={TailorTastePage}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Recommendations" component={RecommendationsPage} />
        <Stack.Screen name="Shop" component={ShopPage} />
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
    backgroundColor: "black",
  },
  video: {
    flex: 1,
  },
  productPage: {
    flex: 1,
    backgroundColor: "black",
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
    textDecorationLine: "underline",
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
  safeareaScrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: "white",
  },
  scrollContainer: {
    padding: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 15,
    fontFamily: "Inter-Bold",
  },
  questionContainer: {
    width: "100%",
    marginBottom: 15,
  },
  questionText: {
    fontSize: 18,
    marginBottom: 5,
    color: "black",
    fontFamily: "Inter-Semibold",
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: "#B0B0B0",
    borderRadius: 10,
    width: 400,
    padding: 15,
    fontSize: 15,
    height: 150,
  },
  input: {
    borderWidth: 1,
    borderColor: "#B0B0B0",
    borderRadius: 10,
    width: 400,
    padding: 15,
    fontSize: 15,
  },
  submitButton: {
    marginTop: 10,
    backgroundColor: "#E94359",
    borderRadius: 5,
    padding: 10,
    width: "80%",
    alignItems: "center",
    alignSelf: "center",
  },
  submitButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
  },
  responseContainer: {
    marginTop: 20,
    width: "100%",
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
    fontSize: 14,
    textDecorationLine: "underline",
  },
  picker: {
    height: 150,
    width: "100%",
    marginBottom: 15,
  },
  priceContainer: {
    borderWidth: 1,
    borderColor: "#B0B0B0",
    borderRadius: 10,
    width: 400,
    padding: 15,
    fontSize: 15,
  },
  priceText: {
    color: "#878789",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 15,
    fontWeight: "bold",
  },
  confirmButton: {
    marginTop: 20,
    backgroundColor: "#E94359",
    borderRadius: 5,
    padding: 10,
    width: "100%",
    textAlign: "center",
  },
  confirmButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    textDecorationLine: "underline",
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    borderColor: "#B0B0B0",
  },
  dateButtonText: {
    color: "#878789",
    fontSize: 15,
    fontFamily: "Inter-Regular",
  },
  selectedDateButtonText: {
    color: "black",
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  radioSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 5,
    borderColor: "#E94359",
    marginRight: 10,
  },
  radioUnselected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E94359",
    marginRight: 10,
  },
  radioButtonText: {
    marginLeft: 5,
  },
  headerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 0,
  },
  backButton: {
    padding: 10,
    borderRadius: 5,
  },
  shopButton: {
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "black",
    fontSize: 16,
  },
  shopImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "center",
  },
});

export default App;
