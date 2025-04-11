import { Button, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useAuth } from "../context/authContext";
import { StatusBar } from "expo-status-bar";
const Home = () => {
  const { logout } = useAuth();
  const handleLogout = async () => {
    await logout();
  };
  return (
    <View style={styles.container}>
      <StatusBar hidden />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
