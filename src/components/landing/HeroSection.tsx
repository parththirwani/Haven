"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, ArrowRight } from "lucide-react";
import { useMemo } from "react";

// Static cipher text (computed once)
const cipherText = Array.from({ length: 16 }, (_, i) =>
  Array.from({ length: 11 }, (_, j) =>
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="[
      (i * 11 + j) % 64
    ]
  ).join("")
).join(" ");

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Radial Glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 65% 45% at 50% 40%, rgba(99, 102, 241, 0.09) 0%, transparent 70%)",
          }}
        />

        {/* Subtle Grid */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* Encryption Orb */}
      <EncryptionOrb />

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-sm font-medium tracking-wide"
      >
        <Shield size={14} />
        End-to-end encrypted
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="text-center text-5xl sm:text-6xl md:text-7xl font-light tracking-[-0.04em] text-white max-w-4xl leading-[1.05]"
      >
        Your second brain,{" "}
        <span className="text-zinc-500">yours alone.</span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="mt-6 text-center text-lg md:text-xl text-zinc-400 max-w-xl leading-relaxed font-light"
      >
        Notes, links, passwords, and resources — all encrypted before they
        leave your device. We never see your data.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-10 flex flex-col sm:flex-row items-center gap-4"
      >
        <Link
          href="/signup"
          className="group flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white text-base font-medium transition-all duration-200 active:scale-[0.985]"
        >
          Get started free
          <ArrowRight
            size={18}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>

        <Link
          href="/login"
          className="px-8 py-3.5 rounded-2xl border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 text-base font-medium transition-all duration-200"
        >
          Sign in
        </Link>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
      >
        <div className="w-px h-14 bg-gradient-to-b from-transparent via-zinc-600 to-transparent" />
        <span className="text-[10px] text-zinc-500 tracking-widest">SCROLL</span>
      </motion.div>
    </section>
  );
}

/* Optimized Encryption Orb */
function EncryptionOrb() {
  // Memoize the rotating ring style to prevent recreation
  const ringStyle = useMemo(
    () => ({
      background:
        "conic-gradient(from 0deg, transparent, rgba(99,102,241,0.12), transparent 70%)",
    }),
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.4, delay: 0.2 }}
      className="absolute top-[15%] right-[6%] hidden xl:block pointer-events-none"
    >
      <div className="relative w-56 h-56">
        {/* Outer rotating ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-indigo-500/10"
          style={ringStyle}
        />

        {/* Inner glow orb */}
        <div
          className="absolute inset-8 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 40% 30%, rgba(129, 140, 248, 0.18) 0%, transparent 65%)",
          }}
        />

        {/* Cipher text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="font-mono text-[7.5px] text-indigo-500/25 leading-none text-center tracking-widest select-none"
            style={{ maxWidth: "138px", lineHeight: "1.35" }}
          >
            {cipherText}
          </div>
        </div>

        {/* Central Shield */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Shield size={26} className="text-indigo-400/70" />
        </div>
      </div>
    </motion.div>
  );
}