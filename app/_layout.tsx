import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { Slot } from "expo-router";
import { useColorScheme } from "@/components/useColorScheme";
import { View, StyleSheet } from "react-native";
import { useAuth } from "./context/authContext";
import AuthContextProvider from "./context/authContext";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

const MainLayout = () => {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  useEffect(() => {
    //check if authenticated
    if (typeof isAuthenticated === "undefined") return;
    const inApp = segments[0] == "(app)";
    if (isAuthenticated && !inApp) {
      //redirect to home
      router.replace("/home");
    } else if (isAuthenticated === false) {
      //redirect to signIn
      router.replace("/signIn");
    }
  }, [isAuthenticated]);
  return <Slot />;
};

export default function RootLayout() {
  return (
    <AuthContextProvider>
      <MainLayout />
    </AuthContextProvider>
  );
}
