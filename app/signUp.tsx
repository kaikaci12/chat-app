import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import React, { useRef, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "./context/authContext";
import Loading from "@/components/Loading";

const SignUp = () => {
  const usernameRef = useRef("");
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const confirmPasswordRef = useRef("");
  const profileUrl = useRef("");
  const router = useRouter();
  const { register } = useAuth(); // Assuming you have a register function in your auth context
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (
      !usernameRef.current ||
      !emailRef.current ||
      !passwordRef.current ||
      !confirmPasswordRef.current ||
      !profileUrl.current
    ) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (passwordRef.current !== confirmPasswordRef.current) {
      Alert.alert("Error", "Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      let response = await register(
        emailRef.current,
        passwordRef.current,
        usernameRef.current,
        profileUrl.current
      );
      setLoading(false);
      console.log("got resluts", response);
      if (!response.success) {
        Alert.alert("Sign Up", response.msg);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/guest.png")}
          style={styles.logo}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          onChangeText={(text) => (usernameRef.current = text)}
          placeholder="Username"
          placeholderTextColor="#999"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          onChangeText={(text) => (emailRef.current = text)}
          placeholder="Email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          onChangeText={(text) => (passwordRef.current = text)}
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry={true}
        />

        <TextInput
          onChangeText={(text) => (confirmPasswordRef.current = text)}
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#999"
          secureTextEntry={true}
        />
        <TextInput
          onChangeText={(text) => (profileUrl.current = text)}
          style={styles.input}
          placeholder="Image URL"
          placeholderTextColor="#999"
          autoCapitalize="none"
        />
      </View>

      <View>
        {loading ? (
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <Loading size={hp(8)} />
          </View>
        ) : (
          <TouchableOpacity onPress={handleRegister} style={styles.button}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => router.push("/signIn")}>
          <Text style={styles.footerLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignUp;

// Reuse the same styles from SignIn
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#075E54",
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: "#075E54",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#075E54",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    color: "#666",
    marginRight: 5,
  },
  footerLink: {
    color: "#075E54",
    fontWeight: "bold",
  },
});
