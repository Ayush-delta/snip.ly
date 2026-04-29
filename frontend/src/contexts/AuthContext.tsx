"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

//Types
interface User {
  id: number;
  email: string;
  name: string | null;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

//Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  //Silent token refresh
  const refresh = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch(`${API}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        setUser(null);
        setAccessToken(null);
        return null;
      }
      const data = await res.json();
      setUser(data.user);
      setAccessToken(data.accessToken);
      scheduleRefresh(data.accessToken);
      return data.accessToken;
    } catch {
      return null;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  //Schedule auto-refresh 1 min before expiry (JWT = 15 min)
  function scheduleRefresh(token: string) {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiresIn = payload.exp * 1000 - Date.now() - 60_000; // 1 min early
    if (expiresIn > 0) {
      refreshTimer.current = setTimeout(refresh, expiresIn);
    }
  }

  //On mount: try to restore session via httpOnly refresh cookie
  useEffect(() => {
    refresh().finally(() => setLoading(false));
    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, [refresh]);

  //Login
  const login = async (email: string, password: string) => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    setUser(data.user);
    setAccessToken(data.accessToken);
    scheduleRefresh(data.accessToken);
  };

  //Register
  const register = async (name: string, email: string, password: string) => {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    setUser(data.user);
    setAccessToken(data.accessToken);
    scheduleRefresh(data.accessToken);
  };

  //Logout
  const logout = async () => {
    await fetch(`${API}/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
    setUser(null);
    setAccessToken(null);
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
  };

  // getToken: returns valid token, auto-refreshes if needed
  const getToken = useCallback(async (): Promise<string | null> => {
    if (!accessToken) return null;
    const payload = JSON.parse(atob(accessToken.split(".")[1]));
    if (payload.exp * 1000 - Date.now() < 30_000) {
      return refresh();
    }
    return accessToken;
  }, [accessToken, refresh]);

  async function forgotPassword(email: string) {
    const res = await fetch(`${API}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to send reset email");
    }
  }

  async function resetPassword(token: string, password: string) {
    const res = await fetch(`${API}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to reset password");
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, accessToken, loading, login, register, logout, getToken, forgotPassword, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

//Hook
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
