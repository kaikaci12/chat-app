import { StyleSheet, Text, View } from "react-native";
import React from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
const MessageItem = ({ message, currentUser }: any) => {
  if (currentUser.userId === message.userId) {
    //my message
    return (
      <View style={styles.myMessage}>
        <View style={{ width: wp(80) }}>
          <View style={styles.myMessageContainer}>
            <Text style={{ fontSize: hp(1.9) }}>{message.text}</Text>
          </View>
        </View>
      </View>
    );
  } else {
    return (
      <View style={styles.otherMessage}>
        <View style={styles.otherMessageContainer}>
          <Text style={{ fontSize: hp(1.9) }}>{message.text}</Text>
        </View>
      </View>
    );
  }
};
export default MessageItem;

const styles = StyleSheet.create({
  myMessage: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 10,
    marginRight: 10,
  },
  myMessageContainer: {
    flexDirection: "row",
    alignSelf: "flex-end",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#66BB6A",
    borderRadius: 20,
  },
  otherMessage: {
    width: wp(80),

    marginBottom: 10,
    marginLeft: 10,
  },
  otherMessageContainer: {
    flexDirection: "row",
    alignSelf: "flex-start",
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    paddingHorizontal: 15,
  },
});
