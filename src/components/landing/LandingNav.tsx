"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function LandingNav() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5"
      style={{
        background: "linear-gradient(to bottom, rgba(8, 8, 8, 0.95) 0%, transparent 100%)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Logo */}
      <Link 
        href="/" 
        className="flex items-center gap-2.5 group"
        aria-label="Haven homepage"
      >
        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:border-indigo-500/40 transition-all duration-200">
          <span className="text-base">🔒</span>
        </div>
        <span className="text-lg font-semibold tracking-tight text-white">
          Haven
        </span>
      </Link>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex items-center gap-8 text-sm">
        <a 
          href="#encryption" 
          className="text-zinc-400 hover:text-zinc-100 transition-colors duration-200"
        >
          Security
        </a>
        <a 
          href="#features" 
          className="text-zinc-400 hover:text-zinc-100 transition-colors duration-200"
        >
          Features
        </a>
      </div>

      {/* Auth Buttons */}
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-sm text-zinc-400 hover:text-zinc-100 px-4 py-2 transition-colors duration-200"
        >
          Sign in
        </Link>

        <Link
          href="/signup"
          className="px-5 py-2.5 rounded-xl bg-white text-sm font-medium text-zinc-900 hover:bg-zinc-100 active:bg-zinc-200 transition-all duration-200 shadow-sm"
        >
          Get started
        </Link>
      </div>
    </motion.nav>
  );
}