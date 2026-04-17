"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, isLoading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        setUser(firebaseUser);
        setIsLoading(false);
      } else {
        // No user is signed in, sign in anonymously
        try {
          await signInAnonymously(auth);
          // Note: The listener will fire again with the new user,
          // so we rely on that to set state.
        } catch (error) {
          console.error("Failed to sign in anonymously:", error);
          setIsLoading(false); // don't stay loading forever if it fails
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
