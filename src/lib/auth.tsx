import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { User } from "@/api/interface";

import { restoreUser, signIn, signOut, whenSignedOut } from "@/api/api-instance";

type Auth = {
  user: User | null;
  login: (username: string, password: string) => Promise<User>;
  logout: () => void;
};

const AuthContext = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(restoreUser);

  const login = useCallback(async (username: string, password: string) => {
    const next = await signIn(username, password);
    setUser(next);
    return next;
  }, []);

  const logout = useCallback(() => {
    signOut();
    setUser(null);
  }, []);

  useEffect(() => whenSignedOut(() => setUser(null)), []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): Auth {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("useAuth outside AuthProvider");
  return auth;
}
