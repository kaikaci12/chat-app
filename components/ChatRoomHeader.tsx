import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useRouter } from "expo-router";
const ChatRoomHeader = ({ user }: any) => {
  const router = useRouter();
  return (
    <Stack.Screen
      options={{
        title: "",
        headerShadowVisible: false,
        headerLeft: () => {
          return (
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons
                  style={{ width: "100%" }}
                  name="arrow-back"
                  size={30}
                  color="green"
                />
              </TouchableOpacity>
              <View style={styles.profile}>
                <Image
                  source={user?.profileUrl}
                  style={{ height: hp(4.5), aspectRatio: 1, borderRadius: 100 }}
                />
              </View>
              <Text
                style={{
                  fontSize: hp(2.5),
                  fontWeight: "medium",
                  color: "#1B5E20",
                }}
              >
                {user?.username}
              </Text>
            </View>
          );
        },
        headerRight: () => {
          return (
            <View style={{ flexDirection: "row", gap: 15 }}>
              <TouchableOpacity
                onPress={() => console.log("Call icon pressed")}
              >
                <Ionicons name="call" size={24} color="green" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => console.log("Video call icon pressed")}
              >
                <Ionicons name="videocam" size={24} color="green" />
              </TouchableOpacity>
            </View>
          );
        },
      }}
    />
  );
};

export default ChatRoomHeader;

const styles = StyleSheet.create({
  headerLeft: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  profile: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
});
