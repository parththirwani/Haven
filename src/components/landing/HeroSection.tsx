"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pt-20">
      {/* Background Effects */}
      <BackgroundEffects />

      {/* Encryption Orb */}
      <EncryptionOrb />

      {/* Trust Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8 flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-medium tracking-widest"
      >
        <Shield size={12} />
        END-TO-END ENCRYPTED
      </motion.div>

      {/* Main Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.35 }}
        className="text-center text-5xl sm:text-6xl md:text-7xl font-light tracking-[-0.04em] text-white max-w-4xl leading-[1.05]"
      >
        Your second brain,{" "}
        <span className="text-transparent bg-clip-text bg-linear-to-r from-zinc-400 to-zinc-500">
          yours alone.
        </span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.55 }}
        className="mt-6 text-center text-lg md:text-xl text-zinc-400 max-w-lg leading-relaxed font-light"
      >
        Notes, links, passwords, and resources — all encrypted before they
        leave your device. We never see your data.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.75 }}
        className="mt-12 flex flex-col sm:flex-row items-center gap-4"
      >
        <Link
          href="/signup"
          className="group flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all active:scale-[0.985]"
        >
          Get started free
          <ArrowRight 
            size={16} 
            className="group-hover:translate-x-1 transition-transform" 
          />
        </Link>

        <Link
          href="/login"
          className="px-8 py-3.5 rounded-2xl border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white text-sm font-medium transition-all active:scale-[0.985]"
        >
          Sign in
        </Link>
      </motion.div>

      {/* Scroll Indicator */}
      <ScrollHint />
    </section>
  );
}

/* ====================== Background Effects ====================== */

function BackgroundEffects() {
  return (
    <>
      {/* Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 35%, rgba(99,102,241,0.09) 0%, transparent 65%)",
        }}
      />

      {/* Subtle Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />
    </>
  );
}

/* ====================== Encryption Orb ====================== */

function EncryptionOrb() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.4, delay: 0.2 }}
      className="absolute top-[18%] right-[6%] hidden xl:block"
    >
      <div className="relative w-56 h-56">
        {/* Outer rotating ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-indigo-500/15"
          style={{
            background:
              "conic-gradient(from 0deg at 50% 50%, transparent, rgba(99,102,241,0.12), transparent)",
          }}
        />

        {/* Inner pulsing glow */}
        <div
          className="absolute inset-8 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(99,102,241,0.18) 10%, transparent 70%)",
            animation: "pulse-glow 4s ease-in-out infinite",
          }}
        />

        {/* Cipher text overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="font-mono text-[7.5px] text-indigo-400/30 leading-none tracking-[0.5px] text-center select-none overflow-hidden"
            style={{ maxWidth: "130px", wordBreak: "break-all" }}
          >
            {Array.from({ length: 16 }, (_, i) =>
              Array.from({ length: 11 }, (_, j) =>
                chars[(i * 11 + j) % chars.length]
              ).join("")
            ).join("\n")}
          </div>
        </div>

        {/* Central Lock Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Shield size={28} className="text-indigo-400/70" />
        </div>
      </div>
    </motion.div>
  );
}

/* ====================== Scroll Hint ====================== */

function ScrollHint() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.8, duration: 1 }}
      className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
    >
      <div className="w-px h-14 bg-linear-to-b from-transparent via-zinc-600 to-transparent" />
      <p className="text-[10px] text-zinc-500 tracking-widest font-mono">SCROLL</p>
    </motion.div>
  );
}