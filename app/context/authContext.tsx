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
  updateUserData: (userId: string) => Promise<void>;
  updateUserProfile: (profileUrl: string, userId: string) => Promise<void>;
}

// Initialize AuthContext with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: undefined,
  login: async () => ({ success: false, msg: "" }),
  logout: async () => ({ success: false }),
  register: async () => ({ success: false }),
  updateUserData: async () => {},
  updateUserProfile: async () => {},
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
    // Firebase auth state listener (for real-time updates)
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setIsAuthenticated(true);
        updateUserData(user.uid); // Update user profile data if needed
      } else {
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
  const updateUserProfile = async (profileUrl: string, userId: string) => {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      let data = docSnap.data();
      setUser({
        ...user,
        username: data.username,
        profileUrl: profileUrl,
        userId: data.userId,
      });
    }
  };
  // Login function with AsyncStorage persistence
  const login = async (email: string, password: string) => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);

      setUser(response.user);
      setIsAuthenticated(true);
      return { success: true, msg: "" };
    } catch (error: any) {
      let msg = error.message;
      if (msg.includes("(auth/invalid-email)")) msg = "Invalid email address";
      if (msg.includes("(auth/user-not-found)")) msg = "User not found";
      if (msg.includes("(auth/wrong-password)")) msg = "Wrong password";
      if (msg.includes("(auth/invalid-credential)"))
        msg = "Wrong Email or Password";
      return { success: false, msg: msg || "" };
    }
  };

  // Logout function with AsyncStorage cleanup
  const logout = async () => {
    try {
      await signOut(auth);

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

      setUser(response.user);
      updateUserData(response.user.uid); // Update user data in state
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

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    register,
    updateUserData,
    updateUserProfile,
  };
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
