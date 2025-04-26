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
import { useNavigation } from "@react-navigation/native";

const ChatRoomHeader = ({ user }: any) => {
  const navigation = useNavigation();

  return (
    <Stack.Screen
      options={{
        title: "",
        headerShadowVisible: false,
        headerLeft: () => {
          return (
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={30} color="green" />
              </TouchableOpacity>
              <View style={styles.profile}>
                {user?.profileUrl ? (
                  <Image
                    style={styles.profileImage}
                    source={{ uri: user.profileUrl }}
                    placeholder={require("../assets/images/placeholder.png")}
                    contentFit="cover"
                  />
                ) : (
                  <Ionicons name="person-circle" size={wp(10)} color="gray" />
                )}
              </View>
              <Text style={styles.username}>
                {user?.username || "Unknown User"}
              </Text>
            </View>
          );
        },
        headerRight: () => {
          return (
            <View style={styles.headerRight}>
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
    alignItems: "center",
    gap: 10,
  },
  profile: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  profileImage: {
    width: wp(10),
    height: wp(10),
    borderRadius: 50,
  },
  username: {
    fontSize: hp(2.5),
    fontWeight: "500",
    color: "#1B5E20",
  },
  headerRight: {
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
  },
});
