import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { MenuOption } from "react-native-popup-menu";
const MenuItem = ({ text, action, value, icon }: any) => {
  return (
    <MenuOption
      onSelect={() => action(value)}
      style={{ padding: 10, flexDirection: "row", alignItems: "center" }}
    ></MenuOption>
  );
};

export default MenuItem;

const styles = StyleSheet.create({});
