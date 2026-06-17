import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { type FirebaseUser, registerEmail, loginEmail, logout, resetPassword, onAuthStateChanged } from "@/firebase/firebaseAuth";
import { syncUserProfile, syncDailyLog, syncSavedRecipes, syncGeneratedRecipes } from "@/firebase/firestoreClient";
import { logLogin, logSignUp } from "@/firebase/analyticsClient";
import { useApp } from "./AppContext";
import { createUser, getUserByFirebase } from "@/services/ai";
import type { UserRow } from "@/services/ai";

interface FirebaseAuthContextType {
  user: FirebaseUser | null;
  dbUser: UserRow | null;
  isLoading: boolean;
  isAnonymous: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType>({
  user: null,
  dbUser: null,
  isLoading: true,
  isAnonymous: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  forgotPassword: async () => {},
  updateDisplayName: async () => {},
  error: null,
  clearError: () => {},
});

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<UserRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile, todayLog, savedRecipes, generatedRecipes, resetProfile, loadProfileFromUser } = useApp();

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

  useEffect(() => {
    const unsub = onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        // User is logged in → fetch their DB profile
        try {
          const existing = await getUserByFirebase(u.uid);
          setDbUser(existing);
          loadProfileFromUser(existing);
        } catch {
          setDbUser(null);
          loadProfileFromUser(null);
        }
      } else {
        // User is logged out → reset to guest
        setDbUser(null);
        loadProfileFromUser(null);
      }
      setIsLoading(false);
    });
    return unsub;
  }, [loadProfileFromUser]);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    setError(null);
    try {
      const cred = await registerEmail(email, password, name);
      logSignUp("email");
      // Create DB user
      try {
        const u = await createUser(cred.user.uid, name, email);
        setDbUser(u);
        loadProfileFromUser(u);
      } catch {
        loadProfileFromUser(null);
      }
    } catch (e: any) {
      setError(e.message || "Sign up failed");
      throw e;
    }
  }, [loadProfileFromUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const cred = await loginEmail(email, password);
      logLogin("email");
      // Fetch or create DB user
      try {
        const u = await getUserByFirebase(cred.user.uid);
        setDbUser(u);
        loadProfileFromUser(u);
      } catch {
        try {
          const u = await createUser(cred.user.uid, cred.user.displayName || email.split("@")[0], email);
          setDbUser(u);
          loadProfileFromUser(u);
        } catch {
          loadProfileFromUser(null);
        }
      }
    } catch (e: any) {
      setError(e.message || "Sign in failed");
      throw e;
    }
  }, [loadProfileFromUser]);

  const signOutUser = useCallback(async () => {
    setError(null);
    try {
      await logout();
      setDbUser(null);
      resetProfile();
    } catch (e: any) {
      setError(e.message || "Sign out failed");
    }
  }, [resetProfile]);

  const updateDisplayName = useCallback(async (name: string) => {
    if (!user) return;
    try {
      const { updateProfile } = await import("firebase/auth");
      const { getAuth } = await import("firebase/auth");
      const { getApp } = await import("firebase/app");
      const auth = getAuth(getApp());
      await updateProfile(auth.currentUser!, { displayName: name });
      setUser((prev) => prev ? { ...prev, displayName: name } as FirebaseUser : prev);
      // Also update dbUser so home tab greeting reflects immediately
      setDbUser((prev) => prev ? { ...prev, username: name } : prev);
    } catch (e: any) {
      setError(e.message || "Failed to update name");
    }
  }, [user]);

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
        dbUser,
        isLoading,
        isAnonymous: !user,
        signUp,
        signIn,
        signOut: signOutUser,
        forgotPassword,
        updateDisplayName,
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
