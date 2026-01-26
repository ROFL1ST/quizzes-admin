"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { authAPI } from "../services/auth";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = async () => {
    try {
      setLoading(true);
      // Check session via API (Cookie)
      const res = await authAPI.getProfile();
      if (res.data && res.data.data) {
        // Backend returns { user: {...}, role: "..." }
        const { user: apiUser, role } = res.data.data;

        // Merge role into user object for frontend convenience
        const userData = { ...apiUser, role };

        // Verify Role Access
        const allowedRoles = ["supervisor", "admin", "pengajar"];
        if (!allowedRoles.includes(role)) {
          // If role is missing or invalid
          console.error("Role mismatch:", role);
          throw new Error("Access Denied: You do not have admin privileges.");
        }
        setUser(userData);
      }
    } catch (error) {
      // 401 means not logged in
      setUser(null);
      if (pathname !== "/login") router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (username, password) => {
    try {
      const res = await authAPI.login({ username, password });
      if (res.data) {
        // Cookie handled by backend
        await fetchUser();
        toast.success("Login Successful");
        router.push("/dashboard");
        return true;
      }
    } catch (error) {
      const msg = error.response?.data?.error || "Login Failed";
      toast.error(msg);
      throw error;
    }
    return false;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    router.push("/login");
    toast.success("Logged out");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
