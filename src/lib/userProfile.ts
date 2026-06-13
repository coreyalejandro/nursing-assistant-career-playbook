/**
 * src/lib/userProfile.ts
 * ---------------------------------------------------------------------------
 * Accounts + persistence SCAFFOLD.
 *
 * The repo already ships Firebase (firebase.ts), a UserProfile blueprint
 * (firebase-blueprint.json), and owner-scoped Firestore security rules
 * (firestore.rules). This hook wires those together so a signed-in user's
 * career plan (target sector, focus, playbook overrides) persists across
 * devices and sessions — the foundation for the "progress dashboard + return
 * weekly" retention loop the audit asked for.
 *
 * STATUS: ready-to-wire scaffold. It compiles and uses the real Firebase SDK.
 * To go live you still need to (1) add a sign-in entry point in the UI
 * (Google or anonymous), and (2) confirm the create-vs-update timestamp split
 * in firestore.rules (see TODO below). It is intentionally NOT mounted into
 * the app yet, so the default experience is unchanged.
 * ---------------------------------------------------------------------------
 */
import { useCallback, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInAnonymously,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export interface UserProfile {
  savedSector?: string;
  savedFocus?: string;
  playbookOverrides?: string;
  updatedAt?: number;
  createdAt?: number;
}

export interface UseUserProfile {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signInGuest: () => Promise<void>;
  signOutUser: () => Promise<void>;
  saveProfile: (patch: Partial<UserProfile>) => Promise<void>;
}

export function useUserProfile(): UseUserProfile {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track auth state and load the profile document for the signed-in user.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
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
    return () => unsub();
  }, []);

  const signInGuest = useCallback(async () => {
    setError(null);
    try {
      await signInAnonymously(auth);
    } catch (e: any) {
      setError(e?.message || "Sign-in failed");
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
        setError("Sign in to save your plan.");
        return;
      }
      setError(null);
      const ref = doc(db, "users", user.uid);
      // NOTE: firestore.rules enforce createdAt == request.time on create and
      // updatedAt == request.time on update. serverTimestamp() satisfies both;
      // if you split create/update strictly, branch on snap.exists() first.
      const isNew = !(await getDoc(ref)).exists();
      const payload: Record<string, unknown> = {
        ...patch,
        updatedAt: serverTimestamp(),
      };
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

  return { user, profile, loading, error, signInGuest, signOutUser, saveProfile };
}
