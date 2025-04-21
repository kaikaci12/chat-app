import { ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { FlatList } from "react-native-reanimated/lib/typescript/Animated";
import MessageItem from "./MessageItem";

const MessageList = ({ messages, currentUser, scrollViewRef }: any) => {
  return (
    <ScrollView
      ref={scrollViewRef}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: 10 }}
    >
      {messages.map((message: any, index: number) => {
        return (
          <MessageItem
            message={message}
            key={index}
            currentUser={currentUser}
          />
        );
      })}
    </ScrollView>
  );
};

export default MessageList;

const styles = StyleSheet.create({});
