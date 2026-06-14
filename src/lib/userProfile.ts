/**
 * src/lib/userProfile.ts
 * ---------------------------------------------------------------------------
 * Accounts + cross-device persistence for the retention loop.
 *
 * Uses the repo's existing Firebase (firebase.ts), the UserProfile blueprint
 * (firebase-blueprint.json), and owner-scoped Firestore rules (firestore.rules)
 * so a signed-in CNA's plan + progress persist across devices.
 *
 * Runtime prerequisites (one-time, in YOUR Firebase console):
 *   - Enable the "Google" and/or "Anonymous" sign-in providers (Auth → Sign-in method).
 *   - Add your domain under Auth → Settings → Authorized domains.
 *   - Deploy the updated firestore.rules (they now allow renewalDate + progressJson).
 * The app degrades gracefully if these aren't set: the UI shows a friendly
 * error and the progress dashboard still works via localStorage (see RetentionPanel).
 * ---------------------------------------------------------------------------
 */
import { useCallback, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export interface UserProfile {
  savedSector?: string;
  savedFocus?: string;
  playbookOverrides?: string;
  /** ISO date (yyyy-mm-dd) of the next CNA certification renewal. */
  renewalDate?: string;
  /** JSON string of the progress checklist state. */
  progressJson?: string;
  updatedAt?: number;
  createdAt?: number;
}

export interface UseUserProfile {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInGuest: () => Promise<void>;
  signOutUser: () => Promise<void>;
  saveProfile: (patch: Partial<UserProfile>) => Promise<void>;
}

export function useUserProfile(): UseUserProfile {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsub = () => {};
    try {
      unsub = onAuthStateChanged(auth, async (u) => {
        setUser(u);
        if (!u) {
          setProfile(null);
          setLoading(false);
          return;
        }
        try {
          const snap = await getDoc(doc(db, "users", u.uid));
          setProfile(snap.exists() ? (snap.data() as UserProfile) : null);
        } catch (e: any) {
          setError(e?.message || "Failed to load profile");
        } finally {
          setLoading(false);
        }
      });
    } catch (e: any) {
      // Firebase not configured at runtime — don't crash the app.
      setError(e?.message || "Auth unavailable");
      setLoading(false);
    }
    return () => unsub();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e: any) {
      setError(friendlyAuthError(e));
    }
  }, []);

  const signInGuest = useCallback(async () => {
    setError(null);
    try {
      await signInAnonymously(auth);
    } catch (e: any) {
      setError(friendlyAuthError(e));
    }
  }, []);

  const signOutUser = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (e: any) {
      setError(e?.message || "Sign-out failed");
    }
  }, []);

  const saveProfile = useCallback(
    async (patch: Partial<UserProfile>) => {
      if (!user) {
        setError("Sign in to save your plan across devices.");
        return;
      }
      setError(null);
      const ref = doc(db, "users", user.uid);
      // firestore.rules require createdAt == request.time on create and
      // updatedAt == request.time on update; serverTimestamp() satisfies both.
      let isNew = true;
      try { isNew = !(await getDoc(ref)).exists(); } catch { /* default create */ }
      const payload: Record<string, unknown> = { ...patch, updatedAt: serverTimestamp() };
      if (isNew) payload.createdAt = serverTimestamp();
      try {
        await setDoc(ref, payload, { merge: true });
        setProfile((prev) => ({ ...(prev || {}), ...patch }));
      } catch (e: any) {
        setError(e?.message || "Failed to save profile");
      }
    },
    [user]
  );

  return { user, profile, loading, error, signInWithGoogle, signInGuest, signOutUser, saveProfile };
}

function friendlyAuthError(e: any): string {
  const code = e?.code || "";
  if (code.includes("popup-closed") || code.includes("cancelled-popup")) return "Sign-in was cancelled.";
  if (code.includes("operation-not-allowed")) return "This sign-in method isn't enabled yet in Firebase.";
  if (code.includes("unauthorized-domain")) return "This domain isn't authorized for sign-in yet.";
  if (code.includes("network")) return "Network issue — check your connection and try again.";
  return e?.message || "Sign-in failed.";
}
