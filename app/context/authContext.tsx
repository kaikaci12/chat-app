import {
  createContext,
  useEffect,
  useState,
  ReactNode,
  useContext,
} from "react";

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
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: undefined,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
});
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContextProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(
    undefined
  );
  useEffect(() => {
    //on auth state change
    setTimeout(() => {
      setIsAuthenticated(false);
    }, 3000);
  });
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
    } catch (error) {}
  };
  const value = { user, isAuthenticated, login, logout, register };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return value;
};
