"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pt-20 bg-[#06060A]">

      {/* Halftone dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 75% 70% at 50% 50%, black 40%, transparent 100%)",
        }}
      />

      {/* Amber horizon bloom */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: "70%",
          height: "420px",
          background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(251,191,36,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Rotating ring ornament */}
      <motion.div
        className="absolute top-24 left-[7%] hidden xl:block pointer-events-none"
        animate={{ rotate: -360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" stroke="rgba(251,191,36,0.15)" strokeWidth="0.75" strokeDasharray="4 6" />
          <circle cx="32" cy="32" r="20" stroke="rgba(251,191,36,0.08)" strokeWidth="0.75" />
          <circle cx="32" cy="32" r="3" fill="rgba(251,191,36,0.3)" />
        </svg>
      </motion.div>

      {/* Terminal badge */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10 flex items-center gap-2.5 px-5 py-2 rounded border border-amber-500/20 bg-amber-500/5"
        style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-amber-400 text-[11px] tracking-[0.15em] uppercase">
          E2E Encrypted · Zero Knowledge
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="text-center font-light tracking-[-0.045em] text-white max-w-3xl leading-[1.02]"
        style={{ fontSize: "clamp(3rem, 8vw, 5.5rem)" }}
      >
        Your second brain.
        <br />
        <span
          style={{
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            backgroundImage: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 40%, #d97706 100%)",
          }}
        >
          Cryptographically
        </span>
        <br />
        <span className="text-white/30">yours alone.</span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35 }}
        className="mt-8 text-center text-[17px] text-zinc-500 max-w-sm leading-relaxed font-light"
      >
        Notes, links, passwords, files — all encrypted client-side.
        We store noise.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.55 }}
        className="mt-12 flex flex-col sm:flex-row items-center gap-3"
      >
        <Link
          href="/signup"
          className="group relative flex items-center gap-2.5 px-7 py-3.5 rounded-lg text-sm font-medium text-black transition-all duration-200 active:scale-[0.982] overflow-hidden"
          style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)" }}
        >
          <span className="relative z-10">Create your vault</span>
          <ArrowRight
            size={15}
            className="relative z-10 group-hover:translate-x-0.5 transition-transform"
          />
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: "linear-gradient(135deg, #fcd34d 0%, #fbbf24 100%)" }}
          />
        </Link>

        <Link
          href="/login"
          className="px-7 py-3.5 rounded-lg border border-white/10 text-zinc-500 hover:text-white hover:border-white/20 text-sm font-medium transition-all duration-200"
        >
          Sign in
        </Link>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute bottom-14 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
      >
        <motion.div
          animate={{ scaleY: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-12 origin-top"
          style={{ background: "linear-gradient(to bottom, rgba(251,191,36,0.5), transparent)" }}
        />
      </motion.div>
    </section>
  );
}