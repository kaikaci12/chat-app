import { Button, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useAuth } from "../context/authContext";

const Home = () => {
  const { logout } = useAuth();
  const handleLogout = async () => {
    await logout();
  };
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Home</Text>
      <Button title="Sign Out" onPress={handleLogout} />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({});
