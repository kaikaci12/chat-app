import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
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
interface AuthContextType {
  user: any;
  isAuthenticated: boolean | undefined;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    email: string,
    password: string,
    username: string,
    profileUrl: string
  ) => Promise<{ success: boolean; data?: any; msg?: string }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: undefined,
  login: async () => {},
  logout: async () => {},
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
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUser(user);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });
    return unsub;
  }, []);
  const login = async (email: string, password: string) => {
    try {
    } catch (error) {}
  };
  const logout = async () => {
    try {
    } catch (error) {}
  };
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
      console.log("response ", response?.user);
      const docRef = doc(db, "users", response?.user?.uid);

      await setDoc(docRef, {
        username,
        profileUrl,
        userId: response?.user?.uid,
      });
      return { success: true, data: response?.user };
    } catch (error: any) {
      let msg = error.message;
      if (msg.includes("(auth/invalid-email)")) msg = "Invalid email address";

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
