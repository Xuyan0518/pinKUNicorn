import React from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from "react-native";
import ShowMoreText from "./ShowMoreText";

const RecommendationsPage = ({ route }) => {
  const { recommendations } = route.params;

  const renderProduct = ({ item }) => (
    <View style={styles.productItem}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productDetails}>
        <Text style={styles.productName}>{item.title}</Text>
        <Text style={styles.productPrice}>${item.price}</Text>
        <Text style={styles.productCategory}>{item.category}</Text>
        <ShowMoreText text={item.description} />
        <Text style={styles.productRating}>Rating: {item.rating.rate} ({item.rating.count} reviews)</Text>
        <TouchableOpacity style={styles.buyButton}>
          <Text style={styles.buyButtonText}>Add to cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recommended Products</Text>
      <FlatList
        data={recommendations}
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
  productCategory: {
    color: "green",
  },
  productStock: {
    marginTop: 5,
    color: "blue",
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
