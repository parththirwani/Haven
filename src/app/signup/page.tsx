"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/src/trpc/react";
import { useVault } from "@/src/stores/useVault";
import { Eye, EyeOff, Lock, Shield } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { setNeedsOnboarding } = useVault();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signup = api.auth.signup.useMutation({
    onSuccess: (data) => {
      if (!data.success) {
        setError(data.message);
        return;
      }
      // Session cookie is set. Mark that onboarding is required then navigate.
      // The onboarding page will generate keySalt and derive the master key.
      setNeedsOnboarding(true);
      router.push("/onboarding");
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    signup.mutate({ email, password, username });
  };

  const strength = (() => {
    if (password.length === 0) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = [
    "",
    "bg-red-500",
    "bg-amber-500",
    "bg-yellow-400",
    "bg-emerald-500",
  ][strength];

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

        <h1 className="text-2xl font-light text-white mb-1">Create your vault</h1>
        <p className="text-sm text-zinc-500 mb-8">Encrypted from the first keystroke</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={20}
              placeholder="yourname"
              className="w-full px-3.5 py-2.5 rounded-lg bg-white/3 border border-white/8 text-zinc-200 placeholder-zinc-600 text-sm outline-none focus:border-indigo-500/50 focus:bg-white/5 transition-all"
            />
          </div>

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
              Master password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
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
            {password.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(strength / 4) * 100}%` }}
                    className={`h-full rounded-full transition-all ${strengthColor}`}
                  />
                </div>
                <span className="text-[10px] text-zinc-500">{strengthLabel}</span>
              </div>
            )}
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
            disabled={signup.isPending}
            className="w-full py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-all duration-200 mt-2"
          >
            {signup.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
                Creating account…
              </span>
            ) : (
              "Continue"
            )}
          </button>
        </form>

        <p className="mt-6 text-xs text-zinc-600 text-center">
          Already have a vault?{" "}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Sign in
          </Link>
        </p>

        <div className="mt-8 flex items-start gap-2.5 px-3.5 py-3 rounded-lg bg-amber-500/5 border border-amber-500/15">
          <Shield size={12} className="text-amber-400 mt-0.5 shrink-0" />
          <p className="text-[11px] text-zinc-600 leading-relaxed">
            Your master password is never sent to our servers. It's used locally
            to encrypt all your data. If lost, it cannot be recovered.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
