"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, Shield, AlertTriangle } from "lucide-react";

import { useVault } from "@/src/stores/useVault";
import { deriveKey } from "@/src/utils/crypto";
import { loadKeyFromSession } from "@/src/lib/crypto/sessionKeyStore";

type GuardState = "restoring" | "unlocked" | "locked" | "redirecting";

interface VaultGuardProps {
  children: React.ReactNode;
}

export function VaultGuard({ children }: VaultGuardProps) {
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

  // Restore vault key from sessionStorage on mount
  useEffect(() => {
    let isCancelled = false;

    async function restoreVault() {
      // Already unlocked (e.g., navigating between pages)
      if (isUnlocked) {
        setGuardState("unlocked");
        return;
      }

      const persisted = await loadKeyFromSession();

      if (isCancelled) return;

      if (persisted) {
        unlockVault(persisted.key, persisted.keySalt);
        setGuardState("unlocked");
        return;
      }

      // No persisted key → decide next step
      if (needsOnboarding && !hasCompletedOnboarding) {
        setRedirectTarget("/onboarding");
        setGuardState("redirecting");
        return;
      }

      if (keySalt) {
        // We have salt → show unlock screen
        setGuardState("locked");
        return;
      }

      // No salt, no key → go to login
      setRedirectTarget("/login");
      setGuardState("redirecting");
    }

    restoreVault();

    return () => {
      isCancelled = true;
    };
  }, [isUnlocked, keySalt, needsOnboarding, hasCompletedOnboarding, unlockVault]);

  // Handle redirection
  useEffect(() => {
    if (guardState === "redirecting" && redirectTarget) {
      router.replace(redirectTarget);
    }
  }, [guardState, redirectTarget, router]);

  // Loading / Redirecting state
  if (guardState === "restoring" || guardState === "redirecting") {
    return <VaultLoadingScreen />;
  }

  // Locked state → show unlock screen
  if (guardState === "locked" && keySalt) {
    return (
      <VaultUnlockScreen
        keySalt={keySalt}
        onUnlocked={(key) => {
          unlockVault(key, keySalt);
          setGuardState("unlocked");
        }}
      />
    );
  }

  // Unlocked → render children
  return <>{children}</>;
}

/* ====================== Vault Unlock Screen ====================== */

interface VaultUnlockScreenProps {
  keySalt: string;
  onUnlocked: (key: CryptoKey) => void;
}

function VaultUnlockScreen({ keySalt, onUnlocked }: VaultUnlockScreenProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleUnlock = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!password.trim()) return;

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
    },
    [password, keySalt, onUnlocked]
  );

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-6">
      {/* Background accent */}
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
        transition={{ duration: 0.45 }}
        className="w-full max-w-xs"
      >
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Lock size={26} className="text-indigo-400" />
          </div>
        </div>

        <h1 className="text-2xl font-light text-white text-center mb-2 tracking-tight">
          Vault is locked
        </h1>
        <p className="text-sm text-zinc-500 text-center mb-10 leading-relaxed">
          Enter your master password to continue
        </p>

        <form onSubmit={handleUnlock} className="space-y-5">
          <div>
            <label
              htmlFor="master-password"
              className="block text-xs text-zinc-400 mb-1.5 font-medium"
            >
              Master password
            </label>
            <div className="relative">
              <input
                id="master-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-zinc-200 placeholder-zinc-600 focus:border-indigo-500/60 focus:bg-white/10 transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-400 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20"
              >
                <AlertTriangle size={15} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-500/60 disabled:cursor-not-allowed text-white font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Unlocking...
              </>
            ) : (
              "Unlock Vault"
            )}
          </button>
        </form>

        {/* Security note */}
        <div className="mt-8 flex items-center justify-center gap-2 text-zinc-700">
          <Shield size={13} />
          <p className="text-xs">End-to-end encryption • Key derived in browser</p>
        </div>

        <button
          onClick={() => router.replace("/login")}
          className="mt-6 w-full text-center text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
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
        className="flex flex-col items-center gap-6"
      >
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <Lock size={20} className="text-indigo-400" />
        </div>

        <div className="flex gap-1.5">
          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>

        <p className="text-xs text-zinc-500">Restoring vault...</p>
      </motion.div>
    </div>
  );
}