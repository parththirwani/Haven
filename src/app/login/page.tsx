"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/src/trpc/react";
import { deriveKey } from "@/src/utils/crypto";
import { useVault } from "@/src/stores/useVault";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { unlockVault, setKeySalt, setNeedsOnboarding } = useVault();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusLabel, setStatusLabel] = useState<string | null>(null);

  // Lazy — only fires when refetch() is called after session is established
  const getStatus = api.onboarding.getStatus.useQuery(undefined, {
    enabled: false,
  });

  const signin = api.auth.signin.useMutation({
    onSuccess: async (data) => {
      if (!data.success) {
        setError(data.message);
        return;
      }

      setError(null);
      setStatusLabel("Checking vault status…");

      const { data: status } = await getStatus.refetch();

      if (!status) {
        setError("Could not verify vault status. Please try again.");
        setStatusLabel(null);
        return;
      }

      if (!status.hasOnboarded || !status.keySalt) {
        // Account exists but vault was never initialized
        setNeedsOnboarding(true);
        router.push("/onboarding");
        return;
      }

      // Vault initialized — derive master key while password is still in memory
      setStatusLabel("Deriving encryption key…");
      try {
        const key = await deriveKey(password, status.keySalt);
        unlockVault(key, status.keySalt);
        router.push("/web");
      } catch {
        // Derivation failed but salt exists — guard's unlock screen handles retry
        setKeySalt(status.keySalt);
        router.push("/web");
      } finally {
        setStatusLabel(null);
      }
    },
    onError: (err) => {
      setError(err.message);
      setStatusLabel(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    signin.mutate({ email, password });
  };

  const isPending = signin.isPending || !!statusLabel;

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-6">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(99,102,241,0.05) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm"
      >
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
            <Lock size={14} className="text-indigo-400" />
          </div>
          <span className="text-sm font-medium text-zinc-300">Haven</span>
        </div>

        <h1 className="text-2xl font-light text-white mb-1">Welcome back</h1>
        <p className="text-sm text-zinc-500 mb-8">
          Sign in to access your encrypted vault
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 rounded-lg bg-white/3 border border-white/8 text-zinc-200 placeholder-zinc-600 text-sm outline-none focus:border-indigo-500/50 focus:bg-white/5 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-white/3 border border-white/8 text-zinc-200 placeholder-zinc-600 text-sm outline-none focus:border-indigo-500/50 focus:bg-white/5 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-3.5 py-2.5 rounded-lg bg-red-500/8 border border-red-500/20 text-xs text-red-400"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-all duration-200 mt-2"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
                {statusLabel ?? "Signing in…"}
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="mt-6 text-xs text-zinc-600 text-center">
          No account?{" "}
          <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Create your vault
          </Link>
        </p>

        <p className="mt-8 text-[11px] text-zinc-700 text-center leading-relaxed">
          Your password never leaves your device. It's used only to derive your
          encryption key locally.
        </p>
      </motion.div>
    </div>
  );
}
