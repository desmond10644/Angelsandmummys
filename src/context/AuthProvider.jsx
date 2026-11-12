import { useCallback, useState } from "react";
import { AuthContext } from "./auth-context";
import { login as loginRequest, register as registerRequest } from "../services/authService";

function readUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");

  const acceptSession = useCallback(({ user: nextUser, token: nextToken }) => {
    localStorage.setItem("token", nextToken);
    localStorage.setItem("user", JSON.stringify(nextUser));
    setUser(nextUser);
    setToken(nextToken);
    return nextUser;
  }, []);

  const signIn = useCallback(async (email, password) => {
    return acceptSession(await loginRequest(email, password));
  }, [acceptSession]);
  const signUp = useCallback(async (values) => {
    return acceptSession(await registerRequest(values));
  }, [acceptSession]);
  const signOut = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken("");
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}