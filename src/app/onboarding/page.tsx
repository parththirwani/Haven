"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Lock,
  Eye,
  EyeOff,
  Shield,
  ArrowRight,
  Check,
  User,
  Github,
  Twitter,
  BookOpen,
  Rss,
  AlertTriangle,
} from "lucide-react";
import { api } from "@/src/trpc/react";
import { deriveKey } from "@/src/utils/crypto";
import { useVault } from "@/src/stores/useVault";

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: 1 | 2 }) {
  return (
    <div className="flex items-center gap-3 mb-10">
      {[1, 2].map((n) => {
        const done = n < current;
        const active = n === current;
        return (
          <div key={n} className="flex items-center gap-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                done
                  ? "bg-emerald-500 text-white"
                  : active
                  ? "bg-indigo-500 text-white"
                  : "bg-white/5 border border-white/10 text-zinc-600"
              }`}
            >
              {done ? <Check size={11} /> : n}
            </div>
            <span
              className={`text-xs transition-colors ${
                active ? "text-zinc-300" : done ? "text-zinc-500" : "text-zinc-700"
              }`}
            >
              {n === 1 ? "Secure vault" : "Your profile"}
            </span>
            {n < 2 && (
              <div className="w-8 h-px bg-white/8 mx-1" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const { needsOnboarding, unlockVault } = useVault();

  const [step, setStep] = useState<1 | 2>(1);
  const [mounted, setMounted] = useState(false);

  // Step 1 state
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step1Error, setStep1Error] = useState<string | null>(null);
  const [derivingKey, setDerivingKey] = useState(false);

  // Step 2 state
  const [avatar, setAvatar] = useState("");
  const [x, setX] = useState("");
  const [instagram, setInstagram] = useState("");
  const [github, setGithub] = useState("");
  const [medium, setMedium] = useState("");
  const [step2Saving, setStep2Saving] = useState(false);

  // Derived key held in state so Step 2 can call unlockVault at the end
  const [pendingKey, setPendingKey] = useState<CryptoKey | null>(null);
  const [pendingKeySalt, setPendingKeySalt] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  // Guard: if needsOnboarding is false and we somehow land here, bounce to login
  useEffect(() => {
    if (mounted && !needsOnboarding) {
      router.replace("/login");
    }
  }, [mounted, needsOnboarding, router]);

  // ── tRPC mutations ────────────────────────────────────────────────────────

  const onboardingMutation = api.onboarding.onboarding.useMutation();
  const updateProfile = api.profile.updateProfile.useMutation();

  // ── Step 1: generate salt + derive key ────────────────────────────────────

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep1Error(null);

    if (password !== confirm) {
      setStep1Error("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setStep1Error("Password must be at least 8 characters.");
      return;
    }

    setDerivingKey(true);

    try {
      // Generate keySalt on the server (onboarding mutation)
      const result = await onboardingMutation.mutateAsync({});

      if (!result.success) {
        setStep1Error(result.message);
        setDerivingKey(false);
        return;
      }

      const { keySalt } = result;

      // Derive the master key client-side — password never leaves the browser
      const key = await deriveKey(password, keySalt);

      // Hold onto them — we'll call unlockVault after step 2
      setPendingKey(key);
      setPendingKeySalt(keySalt);

      setStep(2);
    } catch {
      setStep1Error("Something went wrong. Please try again.");
    } finally {
      setDerivingKey(false);
    }
  };

  // ── Step 2: optional profile details ─────────────────────────────────────

  const handleStep2 = async (skip = false) => {
    if (!pendingKey || !pendingKeySalt) return;
    setStep2Saving(true);

    try {
      if (!skip) {
        const socialLinks: Record<string, string> = {};
        if (x) socialLinks.x = x;
        if (instagram) socialLinks.instagram = instagram;
        if (github) socialLinks.github = github;
        if (medium) socialLinks.medium = medium;

        await updateProfile.mutateAsync({
          avatar: avatar || undefined,
          socialLinks: Object.keys(socialLinks).length ? socialLinks : undefined,
        });
      }

      // All done — unlock the vault and enter
      unlockVault(pendingKey, pendingKeySalt);
      router.push("/web");
    } catch {
      // Non-fatal — unlock anyway and let them update profile later
      unlockVault(pendingKey, pendingKeySalt);
      router.push("/web");
    } finally {
      setStep2Saving(false);
    }
  };

  // ── Password strength ─────────────────────────────────────────────────────

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
  const strengthColors = [
    "",
    "bg-red-500",
    "bg-amber-500",
    "bg-yellow-400",
    "bg-emerald-500",
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-6 py-16">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(99,102,241,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
            <Lock size={14} className="text-indigo-400" />
          </div>
          <span className="text-sm font-medium text-zinc-300">Haven</span>
        </div>

        <StepIndicator current={step} />

        <AnimatePresence mode="wait">
          {step === 1 && (
            <Step1
              key="step1"
              password={password}
              confirm={confirm}
              showPass={showPass}
              showConfirm={showConfirm}
              strength={strength}
              strengthLabel={strengthLabel}
              strengthColors={strengthColors}
              error={step1Error}
              loading={derivingKey || onboardingMutation.isPending}
              onPasswordChange={setPassword}
              onConfirmChange={setConfirm}
              onTogglePass={() => setShowPass((v) => !v)}
              onToggleConfirm={() => setShowConfirm((v) => !v)}
              onSubmit={handleStep1}
            />
          )}

          {step === 2 && (
            <Step2
              key="step2"
              avatar={avatar}
              x={x}
              instagram={instagram}
              github={github}
              medium={medium}
              saving={step2Saving}
              onAvatarChange={setAvatar}
              onXChange={setX}
              onInstagramChange={setInstagram}
              onGithubChange={setGithub}
              onMediumChange={setMedium}
              onContinue={() => handleStep2(false)}
              onSkip={() => handleStep2(true)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Step 1 component ─────────────────────────────────────────────────────────

interface Step1Props {
  password: string;
  confirm: string;
  showPass: boolean;
  showConfirm: boolean;
  strength: number;
  strengthLabel: string;
  strengthColors: string[];
  error: string | null;
  loading: boolean;
  onPasswordChange: (v: string) => void;
  onConfirmChange: (v: string) => void;
  onTogglePass: () => void;
  onToggleConfirm: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

function Step1({
  password,
  confirm,
  showPass,
  showConfirm,
  strength,
  strengthLabel,
  strengthColors,
  error,
  loading,
  onPasswordChange,
  onConfirmChange,
  onTogglePass,
  onToggleConfirm,
  onSubmit,
}: Step1Props) {
  const mismatch = confirm.length > 0 && password !== confirm;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-2xl font-light text-white mb-1">Secure your vault</h1>
      <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
        Choose a master password. We'll use it to generate a unique encryption
        key that only you control.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Master password */}
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5" htmlFor="ob-password">
            Master password
          </label>
          <div className="relative">
            <input
              id="ob-password"
              autoFocus
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-white/[0.03] border border-white/8 text-zinc-200 placeholder-zinc-600 text-sm outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all"
            />
            <button
              type="button"
              onClick={onTogglePass}
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
                  className={`h-full rounded-full transition-all duration-300 ${strengthColors[strength]}`}
                />
              </div>
              <span
                className={`text-[10px] min-w-[28px] ${
                  strength >= 3
                    ? "text-emerald-400"
                    : strength >= 2
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                {strengthLabel}
              </span>
            </div>
          )}
        </div>

        {/* Confirm */}
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5" htmlFor="ob-confirm">
            Confirm password
          </label>
          <div className="relative">
            <input
              id="ob-confirm"
              type={showConfirm ? "text" : "password"}
              value={confirm}
              onChange={(e) => onConfirmChange(e.target.value)}
              required
              placeholder="••••••••"
              className={`w-full px-3.5 py-2.5 pr-10 rounded-lg bg-white/[0.03] border text-zinc-200 placeholder-zinc-600 text-sm outline-none transition-all ${
                mismatch
                  ? "border-red-500/40 focus:border-red-500/60"
                  : "border-white/8 focus:border-indigo-500/50 focus:bg-white/[0.05]"
              }`}
            />
            <button
              type="button"
              onClick={onToggleConfirm}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {mismatch && (
            <p className="mt-1.5 text-[11px] text-red-400">Passwords don't match</p>
          )}
        </div>

        {/* How it works */}
        <div className="px-3.5 py-3 rounded-lg bg-indigo-500/5 border border-indigo-500/12 space-y-1.5">
          <div className="flex items-center gap-2">
            <Shield size={11} className="text-indigo-400" />
            <span className="text-[11px] font-medium text-indigo-400">
              How your key is generated
            </span>
          </div>
          <p className="text-[11px] text-zinc-600 leading-relaxed">
            Your password + a random salt → PBKDF2 (310,000 iterations) → AES-256 key.
            The key lives only in memory. The server stores only the salt.
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2 px-3.5 py-2.5 rounded-lg bg-red-500/8 border border-red-500/20"
            >
              <AlertTriangle size={12} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-400">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={loading || mismatch || !password || !confirm}
          className="w-full py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
              {loading ? "Generating key…" : ""}
            </>
          ) : (
            <>
              Generate encryption key
              <ArrowRight size={13} />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-[11px] text-zinc-700 text-center leading-relaxed">
        This password cannot be recovered. Store it somewhere safe.
      </p>
    </motion.div>
  );
}

// ─── Step 2 component ─────────────────────────────────────────────────────────

interface Step2Props {
  avatar: string;
  x: string;
  instagram: string;
  github: string;
  medium: string;
  saving: boolean;
  onAvatarChange: (v: string) => void;
  onXChange: (v: string) => void;
  onInstagramChange: (v: string) => void;
  onGithubChange: (v: string) => void;
  onMediumChange: (v: string) => void;
  onContinue: () => void;
  onSkip: () => void;
}

function Step2({
  avatar,
  x,
  instagram,
  github,
  medium,
  saving,
  onAvatarChange,
  onXChange,
  onInstagramChange,
  onGithubChange,
  onMediumChange,
  onContinue,
  onSkip,
}: Step2Props) {
  const socialLinks = [
    {
      id: "x",
      label: "X (Twitter)",
      icon: Twitter,
      value: x,
      onChange: onXChange,
      placeholder: "https://x.com/yourhandle",
    },
    {
      id: "instagram",
      label: "Instagram",
      icon: User,
      value: instagram,
      onChange: onInstagramChange,
      placeholder: "https://instagram.com/yourhandle",
    },
    {
      id: "github",
      label: "GitHub",
      icon: Github,
      value: github,
      onChange: onGithubChange,
      placeholder: "https://github.com/yourhandle",
    },
    {
      id: "medium",
      label: "Medium",
      icon: Rss,
      value: medium,
      onChange: onMediumChange,
      placeholder: "https://medium.com/@yourhandle",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Vault created banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-emerald-500/8 border border-emerald-500/20 mb-6"
      >
        <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
          <Check size={12} className="text-emerald-400" />
        </div>
        <div>
          <p className="text-xs font-medium text-emerald-400">Vault secured</p>
          <p className="text-[11px] text-emerald-500/60">
            Encryption key generated and loaded into memory
          </p>
        </div>
      </motion.div>

      <h1 className="text-2xl font-light text-white mb-1">Your profile</h1>
      <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
        Add an avatar and social links. Everything here is optional — skip
        anytime and update it later in settings.
      </p>

      <div className="space-y-4">
        {/* Avatar URL */}
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5" htmlFor="ob-avatar">
            <span className="flex items-center gap-1.5">
              <User size={11} />
              Avatar URL
              <span className="text-zinc-700 ml-1">optional</span>
            </span>
          </label>
          <input
            id="ob-avatar"
            type="url"
            value={avatar}
            onChange={(e) => onAvatarChange(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/8 text-zinc-200 placeholder-zinc-600 text-sm outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all"
          />
          {/* Live avatar preview */}
          {avatar && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 flex items-center gap-2"
            >
              <img
                src={avatar}
                alt="Avatar preview"
                className="w-8 h-8 rounded-full object-cover border border-white/10"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <span className="text-[11px] text-zinc-600">Preview</span>
            </motion.div>
          )}
        </div>

        {/* Social links */}
        <div>
          <p className="text-xs text-zinc-400 mb-3 flex items-center gap-1.5">
            <BookOpen size={11} />
            Social links
            <span className="text-zinc-700 ml-1">optional</span>
          </p>
          <div className="space-y-2.5">
            {socialLinks.map(({ id, label, icon: Icon, value, onChange, placeholder }) => (
              <div key={id} className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-700">
                  <Icon size={12} />
                </div>
                <input
                  type="url"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder}
                  aria-label={label}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/8 text-zinc-200 placeholder-zinc-600 text-xs outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 space-y-2.5">
        <button
          onClick={onContinue}
          disabled={saving}
          className="w-full py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
              Saving…
            </>
          ) : (
            <>
              Save and enter vault
              <ArrowRight size={13} />
            </>
          )}
        </button>

        <button
          onClick={onSkip}
          disabled={saving}
          className="w-full py-2.5 rounded-lg border border-white/8 text-zinc-500 hover:text-zinc-300 hover:border-white/15 text-sm transition-all duration-200"
        >
          Skip for now
        </button>
      </div>

      <p className="mt-5 text-[11px] text-zinc-700 text-center">
        You can update your profile at any time in settings
      </p>
    </motion.div>
  );
}
