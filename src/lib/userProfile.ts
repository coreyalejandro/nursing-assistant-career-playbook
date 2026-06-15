/**
 * src/lib/userProfile.ts
 * ---------------------------------------------------------------------------
 * Accounts + cross-device persistence for the retention loop — on Supabase.
 *
 * Replaces the old Firebase Auth + Firestore implementation. A signed-in CNA's
 * plan + progress live in the owner-scoped `profiles` table
 * (supabase/migrations/0001_profiles.sql), protected by Row-Level Security, so
 * they persist across devices.
 *
 * Runtime prerequisites (one-time, in YOUR Supabase project):
 *   - Auth → Providers: enable Google, and enable "Anonymous sign-ins".
 *   - Auth → URL Configuration: add your site URL to the redirect allow-list.
 *   - Run the SQL in supabase/migrations/ (profiles table + RLS).
 * The app degrades gracefully if Supabase isn't configured: the UI shows a
 * friendly note and the progress dashboard still works via localStorage
 * (see RetentionPanel).
 * ---------------------------------------------------------------------------
 */
import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";

/** Minimal, vendor-neutral user shape the UI needs (was Firebase's User). */
export interface AppUser {
  id: string;
  email: string | null;
  displayName: string | null;
  isAnonymous: boolean;
}

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
  user: AppUser | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInGuest: () => Promise<void>;
  signOutUser: () => Promise<void>;
  saveProfile: (patch: Partial<UserProfile>) => Promise<void>;
}

const NOT_CONFIGURED = "Sign-in isn't configured yet (Supabase keys missing).";

/** Supabase auth user → our minimal AppUser. */
function toAppUser(u: any | null): AppUser | null {
  if (!u) return null;
  const meta = u.user_metadata || {};
  return {
    id: u.id,
    email: u.email ?? null,
    displayName: meta.full_name || meta.name || meta.user_name || null,
    isAnonymous: Boolean(u.is_anonymous),
  };
}

/** DB row (snake_case) → UserProfile (camelCase). */
function rowToProfile(row: any | null): UserProfile | null {
  if (!row) return null;
  return {
    savedSector: row.saved_sector ?? undefined,
    savedFocus: row.saved_focus ?? undefined,
    playbookOverrides: row.playbook_overrides ?? undefined,
    renewalDate: row.renewal_date ?? undefined,
    progressJson: row.progress_json ?? undefined,
    createdAt: row.created_at ? Date.parse(row.created_at) : undefined,
    updatedAt: row.updated_at ? Date.parse(row.updated_at) : undefined,
  };
}

/** UserProfile patch (camelCase) → DB columns (snake_case). */
function patchToRow(patch: Partial<UserProfile>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if ("savedSector" in patch) row.saved_sector = patch.savedSector;
  if ("savedFocus" in patch) row.saved_focus = patch.savedFocus;
  if ("playbookOverrides" in patch) row.playbook_overrides = patch.playbookOverrides;
  if ("renewalDate" in patch) row.renewal_date = patch.renewalDate;
  if ("progressJson" in patch) row.progress_json = patch.progressJson;
  return row;
}

export function useUserProfile(): UseUserProfile {
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track the auth session.
  useEffect(() => {
    if (!supabase) {
      setError(NOT_CONFIGURED);
      setLoading(false);
      return;
    }
    const sb = supabase; // non-null capture for closures
    let active = true;

    sb.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(toAppUser(data.session?.user ?? null));
      setLoading(false);
    });

    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(toAppUser(session?.user ?? null));
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Load the owner-scoped profile row whenever the signed-in user changes.
  useEffect(() => {
    if (!supabase || !user) {
      setProfile(null);
      return;
    }
    const sb = supabase;
    let active = true;
    (async () => {
      try {
        const { data, error: e } = await sb
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        if (!active) return;
        if (e) setError(e.message);
        else setProfile(rowToProfile(data));
      } catch (e: any) {
        if (active) setError(e?.message || "Failed to load profile");
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    if (!supabase) return setError(NOT_CONFIGURED);
    const { error: e } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (e) setError(friendlyAuthError(e));
  }, []);

  const signInGuest = useCallback(async () => {
    setError(null);
    if (!supabase) return setError(NOT_CONFIGURED);
    const { error: e } = await supabase.auth.signInAnonymously();
    if (e) setError(friendlyAuthError(e));
  }, []);

  const signOutUser = useCallback(async () => {
    if (!supabase) return;
    const { error: e } = await supabase.auth.signOut();
    if (e) setError(e.message || "Sign-out failed");
  }, []);

  const saveProfile = useCallback(
    async (patch: Partial<UserProfile>) => {
      if (!supabase || !user) {
        setError("Sign in to save your plan across devices.");
        return;
      }
      setError(null);
      // RLS guarantees a user can only upsert their own row; updated_at is
      // maintained server-side by a trigger (see 0001_profiles.sql).
      const row = { id: user.id, ...patchToRow(patch) };
      const { error: e } = await supabase.from("profiles").upsert(row, { onConflict: "id" });
      if (e) setError(e.message || "Failed to save profile");
      else setProfile((prev) => ({ ...(prev || {}), ...patch }));
    },
    [user]
  );

  return { user, profile, loading, error, signInWithGoogle, signInGuest, signOutUser, saveProfile };
}

function friendlyAuthError(e: any): string {
  const msg = (e?.message || "").toLowerCase();
  if (msg.includes("popup") || msg.includes("cancel")) return "Sign-in was cancelled.";
  if (msg.includes("anonymous") && msg.includes("disabled")) return "Guest sign-in isn't enabled yet in Supabase.";
  if (msg.includes("provider") && (msg.includes("not enabled") || msg.includes("disabled"))) return "Google sign-in isn't enabled yet in Supabase.";
  if (msg.includes("redirect") || msg.includes("allow")) return "This domain isn't allow-listed for sign-in yet.";
  if (msg.includes("network") || msg.includes("fetch")) return "Network issue — check your connection and try again.";
  return e?.message || "Sign-in failed.";
}
