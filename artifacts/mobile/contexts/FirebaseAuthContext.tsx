import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { type FirebaseUser, registerEmail, loginEmail, logout, resetPassword, onAuthStateChanged } from "@/firebase/firebaseAuth";
import { syncUserProfile, fetchUserProfile, syncDailyLog, syncSavedRecipes, syncGeneratedRecipes } from "@/firebase/firestoreClient";
import { logLogin, logSignUp } from "@/firebase/analyticsClient";
import { useApp } from "./AppContext";

interface FirebaseAuthContextType {
  user: FirebaseUser | null;
  isLoading: boolean;
  isAnonymous: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType>({
  user: null,
  isLoading: true,
  isAnonymous: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  forgotPassword: async () => {},
  error: null,
  clearError: () => {},
});

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile, todayLog, savedRecipes, generatedRecipes } = useApp();

  useEffect(() => {
    const unsub = onAuthStateChanged((u) => {
      setUser(u);
      setIsLoading(false);
    });
    return unsub;
  }, []);

  const syncData = useCallback(async (uid: string) => {
    try {
      await syncUserProfile(uid, profile);
      await syncDailyLog(uid, todayLog);
      await syncSavedRecipes(uid, savedRecipes);
      await syncGeneratedRecipes(uid, generatedRecipes);
    } catch {}
  }, [profile, todayLog, savedRecipes, generatedRecipes]);

  useEffect(() => {
    if (user && !isLoading) {
      syncData(user.uid);
    }
  }, [user, isLoading, syncData]);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    setError(null);
    try {
      await registerEmail(email, password, name);
      logSignUp("email");
    } catch (e: any) {
      setError(e.message || "Sign up failed");
      throw e;
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      await loginEmail(email, password);
      logLogin("email");
    } catch (e: any) {
      setError(e.message || "Sign in failed");
      throw e;
    }
  }, []);

  const signOutUser = useCallback(async () => {
    setError(null);
    try {
      await logout();
    } catch (e: any) {
      setError(e.message || "Sign out failed");
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    setError(null);
    try {
      await resetPassword(email);
    } catch (e: any) {
      setError(e.message || "Password reset failed");
      throw e;
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <FirebaseAuthContext.Provider
      value={{
        user,
        isLoading,
        isAnonymous: !user,
        signUp,
        signIn,
        signOut: signOutUser,
        forgotPassword,
        error,
        clearError,
      }}
    >
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  return useContext(FirebaseAuthContext);
}
