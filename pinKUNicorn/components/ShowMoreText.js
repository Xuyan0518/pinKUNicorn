import React, { useState } from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";

const ShowMoreText = ({ text }) => {
  const [showMore, setShowMore] = useState(false);

  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  const wordCount = text.split(" ").length;
  const truncatedText = text.split(" ").slice(0, 25).join(" ");

  return (
    <Text>
      {showMore || wordCount <= 25 ? text : `${truncatedText}...`}
      {wordCount > 25 && (
        <TouchableOpacity onPress={toggleShowMore}>
          <Text style={styles.showMoreText}>
            {showMore ? " Show less" : " Show more"}
          </Text>
        </TouchableOpacity>
      )}
    </Text>
  );
};

const styles = StyleSheet.create({
  showMoreText: {
    color: "blue",
  },
});

export default ShowMoreText;
