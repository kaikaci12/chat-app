import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import React from "react";

const StartPage = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color={"gray"} />
    </View>
  );
};

export default StartPage;

const styles = StyleSheet.create({});
