import { StyleSheet, View, FlatList, Text } from "react-native";
import React from "react";
import ChatItem from "./ChatItem";
import { Feather } from "@expo/vector-icons";

const ChatList = ({ users }: any) => {
  return (
    <View style={styles.container}>
      {users?.length > 0 ? (
        <FlatList
          data={users}
          keyExtractor={(item) => item.userId}
          renderItem={({ item }) => <ChatItem item={item} />}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Feather name="message-square" size={72} color="#81C784" />
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptySubtitle}>
            Start chatting with your friends!
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2E7D32", // Dark green
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#4CAF50", // Mid-green
  },
});

export default ChatList;
