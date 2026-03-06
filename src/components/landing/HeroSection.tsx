"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">
      {/* Radial glow bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 40%, rgba(99,102,241,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Animated grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Encryption animation */}
      <EncryptionOrb />

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8 flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-medium tracking-wide"
      >
        <Shield size={11} />
        End-to-end encrypted
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.35 }}
        className="text-center text-5xl sm:text-7xl font-light tracking-[-0.03em] text-white max-w-3xl leading-[1.05]"
      >
        Your second brain,{" "}
        <span className="text-zinc-500">
          yours alone.
        </span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="mt-6 text-center text-lg text-zinc-400 max-w-lg leading-relaxed font-light"
      >
        Notes, links, passwords, and resources — all encrypted before they
        leave your device. We never see your data.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.65 }}
        className="mt-10 flex items-center gap-4"
      >
        <Link
          href="/signup"
          className="group flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium transition-all duration-200"
        >
          Get started free
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <Link
          href="/login"
          className="px-5 py-2.5 rounded-lg border border-white/8 text-zinc-400 hover:text-zinc-200 hover:border-white/15 text-sm font-medium transition-all duration-200"
        >
          Sign in
        </Link>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <div className="w-px h-12 bg-linear-to-b from-transparent via-zinc-600 to-transparent" />
      </motion.div>
    </section>
  );
}

function EncryptionOrb() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, delay: 0.1 }}
      className="absolute top-[12%] right-[8%] hidden lg:block"
    >
      <div className="relative w-52 h-52">
        {/* Rotating ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-indigo-500/10"
          style={{
            background:
              "conic-gradient(from 0deg, transparent, rgba(99,102,241,0.08), transparent)",
          }}
        />
        {/* Inner glow */}
        <div
          className="absolute inset-6 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
            animation: "pulse-glow 3s ease-in-out infinite",
          }}
        />
        {/* Cipher text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="font-mono text-[7px] text-indigo-500/30 leading-3 text-center overflow-hidden select-none"
            style={{ maxWidth: "120px", wordBreak: "break-all" }}
          >
            {Array.from({ length: 18 }, (_, i) =>
              Array.from({ length: 12 }, (_, j) =>
                chars[(i * 12 + j) % chars.length]
              ).join("")
            ).join(" ")}
          </div>
        </div>
        {/* Lock icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Shield size={22} className="text-indigo-400/60" />
        </div>
      </div>
    </motion.div>
  );
}
