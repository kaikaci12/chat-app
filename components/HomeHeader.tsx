import { Platform, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { blurhash } from "@/utils/common";
import { Image } from "expo-image";
import { useAuth } from "@/app/context/authContext";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";

const ios = Platform.OS === "ios";

const HomeHeader = () => {
  const { top } = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={[styles.container, { paddingTop: ios ? top : top + 10 }]}>
      <View style={styles.content}>
        <Text style={styles.title}>Chats</Text>

        <View style={styles.rightContainer}>
          <Menu>
            <MenuTrigger customStyles={triggerStyles}>
              <Image
                style={styles.avatar}
                source={{ uri: user?.profileUrl }}
                placeholder={{ blurhash }}
                contentFit="cover"
                transition={500}
              />
            </MenuTrigger>
            <MenuOptions customStyles={optionsStyles}>
              {/* Profile Menu Item */}
              <MenuOption onSelect={() => alert("View Profile")}>
                <View style={styles.menuItem}>
                  <View style={styles.menuIconContainer}>
                    <Feather name="user" size={20} color="#25D366" />
                  </View>
                  <View>
                    <Text style={styles.menuTitle}>Profile</Text>
                    <Text style={styles.menuSubtitle}>View your profile</Text>
                  </View>
                </View>
              </MenuOption>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Sign Out Menu Item */}
              <MenuOption onSelect={handleLogout}>
                <View style={styles.menuItem}>
                  <View style={styles.menuIconContainer}>
                    <MaterialIcons name="logout" size={20} color="#FF3B30" />
                  </View>
                  <View>
                    <Text style={[styles.menuTitle, { color: "#FF3B30" }]}>
                      Sign Out
                    </Text>
                    <Text style={styles.menuSubtitle}>
                      Exit the application
                    </Text>
                  </View>
                </View>
              </MenuOption>
            </MenuOptions>
          </Menu>
        </View>
      </View>
    </View>
  );
};

// Custom menu trigger styles
const triggerStyles = {
  triggerWrapper: {
    padding: 5,
    borderRadius: 100,
    activeOpacity: 0.7,
  },
};

// Custom menu options styles
const optionsStyles = {
  optionsContainer: {
    width: wp(60),
    borderRadius: 12,
    padding: 8,
    marginTop: hp(7),
    marginRight: wp(2),
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  optionsWrapper: {
    padding: 5,
  },
};

const styles = StyleSheet.create({
  container: {
    width: wp("100%"),
    height: hp(13),
    backgroundColor: "#25D366",
    justifyContent: "flex-end",
    paddingHorizontal: wp("5%"),
    paddingBottom: hp("2%"),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: hp(3.2),
    color: "white",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp("5%"),
  },
  icon: {
    opacity: 0.9,
  },
  avatar: {
    height: hp(4.5),
    width: hp(4.5),
    borderRadius: hp(2.25),
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.3)",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 12,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(37, 211, 102, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuTitle: {
    fontSize: hp(1.9),
    fontWeight: "500",
    color: "#333",
  },
  menuSubtitle: {
    fontSize: hp(1.5),
    color: "#888",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 4,
  },
});

export default HomeHeader;
