"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, Shield, AlertTriangle } from "lucide-react";
import { useVault } from "@/src/stores/useVault";
import { deriveKey } from "@/src/utils/crypto";
import { loadKeyFromSession } from "@/src/lib/crypto/sessionKeyStore";

/**
 * VaultGuard — wraps every /web route.
 *
 * On mount it attempts to restore the master key from sessionStorage
 * (survives page refresh, cleared on tab close). If that succeeds the user
 * goes straight to their page. If it fails they see the unlock screen.
 * All router.replace() calls are inside useEffect — never during render.
 *
 * State flow after mount:
 *
 *   "restoring"  → checking sessionStorage for a persisted key
 *   "unlocked"   → key is in Zustand, render children
 *   "locked"     → key missing but keySalt known, show unlock screen
 *   "redirect"   → no session at all, redirect to /login or /onboarding
 */

type GuardState = "restoring" | "unlocked" | "locked" | "redirect";

export function VaultGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const {
    isUnlocked,
    keySalt,
    hasCompletedOnboarding,
    needsOnboarding,
    unlockVault,
  } = useVault();

  const [guardState, setGuardState] = useState<GuardState>("restoring");
  const [redirectTarget, setRedirectTarget] = useState<string | null>(null);

  // ── On mount: attempt to restore key from sessionStorage ──────────────────
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      // If Zustand already has the key (e.g. navigating between /web pages),
      // skip restoration entirely.
      if (isUnlocked) {
        setGuardState("unlocked");
        return;
      }

      // Try sessionStorage first
      const persisted = await loadKeyFromSession();
      if (cancelled) return;

      if (persisted) {
        unlockVault(persisted.key, persisted.keySalt);
        setGuardState("unlocked");
        return;
      }

      // Nothing in sessionStorage — decide what to show based on Zustand state
      if (needsOnboarding && !hasCompletedOnboarding) {
        setRedirectTarget("/onboarding");
        setGuardState("redirect");
        return;
      }

      if (keySalt) {
        // We have the salt but no key — show unlock screen for re-derivation
        setGuardState("locked");
        return;
      }

      // No salt, no key, no onboarding — must log in
      setRedirectTarget("/login");
      setGuardState("redirect");
    }

    restore();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally runs once on mount only

  useEffect(() => {
    if (guardState === "redirect" && redirectTarget) {
      router.replace(redirectTarget);
    }
  }, [guardState, redirectTarget, router]);

  if (guardState === "restoring" || guardState === "redirect") {
    return <VaultLoadingScreen />;
  }

  if (guardState === "locked") {
    return (
      <VaultUnlockScreen
        keySalt={keySalt!}
        onUnlocked={(key) => {
          unlockVault(key, keySalt!);
          setGuardState("unlocked");
        }}
      />
    );
  }

  return <>{children}</>;
}


function VaultUnlockScreen({
  keySalt,
  onUnlocked,
}: {
  keySalt: string;
  onUnlocked: (key: CryptoKey) => void;
}) {
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError(null);

    try {
      const key = await deriveKey(password, keySalt);
      onUnlocked(key);
    } catch {
      setError("Incorrect password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-6">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(99,102,241,0.06) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xs"
      >
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Lock size={22} className="text-indigo-400" />
          </div>
        </div>

        <h1 className="text-xl font-light text-white text-center mb-1">
          Vault is locked
        </h1>
        <p className="text-sm text-zinc-500 text-center mb-8 leading-relaxed">
          Enter your master password to unlock your vault
        </p>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <label
              className="block text-xs text-zinc-400 mb-1.5"
              htmlFor="unlock-password"
            >
              Master password
            </label>
            <div className="relative">
              <input
                id="unlock-password"
                autoFocus
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-white/3 border border-white/8 text-zinc-200 placeholder-zinc-600 text-sm outline-none focus:border-indigo-500/50 focus:bg-white/5 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                key="err"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2 px-3.5 py-2.5 rounded-lg bg-red-500/8 border border-red-500/20"
              >
                <AlertTriangle size={12} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-xs text-red-400">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-all duration-200"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
                Unlocking…
              </span>
            ) : (
              "Unlock vault"
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-1.5">
          <Shield size={11} className="text-zinc-700" />
          <p className="text-[11px] text-zinc-700">
            Key derivation happens entirely in your browser
          </p>
        </div>

        <button
          onClick={() => router.replace("/login")}
          className="mt-4 w-full text-center text-xs text-zinc-700 hover:text-zinc-500 transition-colors"
        >
          Sign in with a different account
        </button>
      </motion.div>
    </div>
  );
}


function VaultLoadingScreen() {
  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center">
          <Lock size={16} className="text-indigo-400" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/60 animate-bounce [animation-delay:0ms]" />
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/60 animate-bounce [animation-delay:150ms]" />
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/60 animate-bounce [animation-delay:300ms]" />
        </div>
      </motion.div>
    </div>
  );
}