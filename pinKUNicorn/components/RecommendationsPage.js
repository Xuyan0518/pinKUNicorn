import React from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from "react-native";

const recommendedProducts = [
  {
    id: 1,
    name: "Cool motorcycle AirPods",
    price: "S$5.96",
    originalPrice: "S$6.80",
    discount: "12%",
    rating: 4.8,
    sold: 30,
    image: require("../resources/product1.jpg"),
  },
  {
    id: 2,
    name: "2023 Wireless Lavalier Microphone",
    price: "S$4.99",
    originalPrice: "S$10.94",
    discount: "54%",
    rating: 4.7,
    sold: 95,
    image: require("../resources/product2.jpg"),
  },
  // Add more products here...
];

const RecommendationsPage = ({ navigation }) => {
  const renderProduct = ({ item }) => (
    <View style={styles.productItem}>
      <Image source={item.image} style={styles.productImage} />
      <View style={styles.productDetails}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>
        <Text style={styles.productOriginalPrice}>{item.originalPrice}</Text>
        <Text style={styles.productDiscount}>{item.discount} off</Text>
        <Text style={styles.productRating}>⭐ {item.rating} • {item.sold} sold</Text>
        <TouchableOpacity style={styles.buyButton}>
          <Text style={styles.buyButtonText}>Buy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recommended Products</Text>
      <FlatList
        data={recommendedProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  productItem: {
    flexDirection: "row",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 10,
  },
  productImage: {
    width: 100,
    height: 100,
    marginRight: 10,
  },
  productDetails: {
    flex: 1,
    justifyContent: "center",
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  productPrice: {
    color: "red",
    fontSize: 16,
  },
  productOriginalPrice: {
    textDecorationLine: "line-through",
    color: "#555",
  },
  productDiscount: {
    color: "green",
  },
  productRating: {
    marginTop: 5,
    marginBottom: 5,
  },
  buyButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
  },
  buyButtonText: {
    color: "white",
    textAlign: "center",
  },
});

export default RecommendationsPage;
