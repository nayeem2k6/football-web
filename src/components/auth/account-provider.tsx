"use client";

import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  type User,
} from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { firebaseAuth, isFirebaseWebConfigured } from "@/lib/firebase";

interface AccountContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  createAccount: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AccountContext = createContext<AccountContextValue | null>(null);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseAuth) {
      setLoading(false);
      return;
    }

    return onAuthStateChanged(firebaseAuth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
  }, []);

  const value = useMemo<AccountContextValue>(
    () => ({
      user,
      loading,
      configured: isFirebaseWebConfigured,
      signInWithEmail: async (email, password) => {
        if (!firebaseAuth) throw new Error("Firebase sign-in is not configured.");
        await signInWithEmailAndPassword(firebaseAuth, email, password);
      },
      createAccount: async (email, password) => {
        if (!firebaseAuth) throw new Error("Firebase sign-in is not configured.");
        await createUserWithEmailAndPassword(firebaseAuth, email, password);
      },
      signInWithGoogle: async () => {
        if (!firebaseAuth) throw new Error("Firebase sign-in is not configured.");
        await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
      },
      signOutUser: async () => {
        if (!firebaseAuth) throw new Error("Firebase sign-in is not configured.");
        await signOut(firebaseAuth);
      },
    }),
    [user, loading],
  );

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
}

export function useAccount(): AccountContextValue {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccount must be used within AccountProvider.");
  }
  return context;
}
