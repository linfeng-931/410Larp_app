import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { subscribeToAuthChanges, fetchUserData } from "./authService";
import { onSnapshot, doc } from "firebase/firestore";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [user, setUser] = useState(null);
  const [isGuest, setGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const refreshUserData = async () => {
    try {
      const data = await fetchUserData();
      setUser(data);
    } catch (error) {
      console.error("重新抓取使用者資料失敗:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (authenticatedUser) => {
      setFirebaseUser(authenticatedUser);

      if (authenticatedUser) {
        await refreshUserData();
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isGuest,
        setGuest,
        firebaseUser,
        loading,
        refreshUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser 必須在 UserProvider 內使用");
  }
  return context;
};
