import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import HomeHeader from "@/components/HomeHeader";
import { StatusBar } from "expo-status-bar";
const _layout = () => {
  return (
    <Stack>
      <Stack.Screen name="home" options={{ header: () => <HomeHeader /> }} />
    </Stack>
  );
};

export default _layout;

const styles = StyleSheet.create({});
