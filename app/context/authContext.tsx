import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  createContext,
  useEffect,
  useState,
  ReactNode,
  useContext,
} from "react";
import { auth, db } from "@/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define context types
interface AuthContextType {
  user: any;
  isAuthenticated: boolean | undefined;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; msg: string }>;
  logout: () => Promise<{ success: boolean; msg?: string; error?: any }>;
  register: (
    email: string,
    password: string,
    username: string,
    profileUrl: string
  ) => Promise<{ success: boolean; data?: any; msg?: string }>;
}

// Initialize AuthContext with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: undefined,
  login: async () => ({ success: false, msg: "" }),
  logout: async () => ({ success: false }),
  register: async () => ({ success: false }),
});

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContextProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(
    undefined
  );

  useEffect(() => {
    // Check AsyncStorage for persisted user data on app startup
    const loadUser = async () => {
      const savedUser = await AsyncStorage.getItem("@user");
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);

        // Manually set the Firebase Auth state
        const currentUser = await signInWithEmailAndPassword(
          auth,
          parsedUser.email,
          parsedUser.password
        );
        setUser(currentUser.user);
      } else {
        setIsAuthenticated(false);
      }
    };

    loadUser(); // Load user data from AsyncStorage

    // Firebase auth state listener (for real-time updates)
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await AsyncStorage.setItem("@user", JSON.stringify(user)); // Save user to AsyncStorage
        setUser(user);
        setIsAuthenticated(true);
        updateUserData(user.uid); // Update user profile data if needed
      } else {
        await AsyncStorage.removeItem("@user"); // Remove user from AsyncStorage on sign out
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return unsub; // Clean up listener
  }, []);

  // Function to update user profile data from Firestore
  const updateUserData = async (userId: string) => {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      let data = docSnap.data();
      setUser({
        ...user,
        username: data.username,
        profileUrl: data.profileUrl,
        userId: data.userId,
      });
    }
  };

  // Login function with AsyncStorage persistence
  const login = async (email: string, password: string) => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      await AsyncStorage.setItem("@user", JSON.stringify(response.user)); // Save user to AsyncStorage
      setUser(response.user);
      setIsAuthenticated(true);
      return { success: true, msg: "" };
    } catch (error: any) {
      let msg = error.message;
      if (msg.includes("(auth/invalid-email)")) msg = "Invalid email address";
      if (msg.includes("(auth/user-not-found)")) msg = "User not found";
      if (msg.includes("(auth/wrong-password)")) msg = "Wrong password";
      return { success: false, msg: msg || "" };
    }
  };

  // Logout function with AsyncStorage cleanup
  const logout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem("@user"); // Remove user data from AsyncStorage
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error: any) {
      return { success: false, msg: error.message, error: error };
    }
  };

  // Register function with saving user to AsyncStorage
  const register = async (
    email: string,
    password: string,
    username: string,
    profileUrl: string
  ) => {
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const docRef = doc(db, "users", response.user.uid);
      await setDoc(docRef, {
        username,
        profileUrl,
        userId: response.user.uid,
      });

      await AsyncStorage.setItem("@user", JSON.stringify(response.user)); // Save user to AsyncStorage
      setUser(response.user);
      setIsAuthenticated(true);
      return { success: true, data: response.user };
    } catch (error: any) {
      let msg = error.message;
      if (msg.includes("(auth/invalid-email)")) msg = "Invalid email address";
      if (msg.includes("(auth/email-already-in-use)"))
        msg = "This email is already in use";
      return { success: false, msg };
    }
  };

  const value = { user, isAuthenticated, login, logout, register };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContextProvider;

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return value;
};
