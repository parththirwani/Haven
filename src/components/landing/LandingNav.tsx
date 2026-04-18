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
        className="flex items-center gap-3 group"
        aria-label="Haven homepage"
      >
        <div className="w-9 h-9 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
          <span className="text-2xl drop-shadow-sm">🔒</span>
        </div>
        <span className="text-2xl font-semibold tracking-tighter text-white">
          Haven
        </span>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-10 text-sm font-medium">
        <a
          href="#encryption"
          className="text-zinc-400 hover:text-white transition-colors duration-200 relative after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-0 after:bg-white after:transition-all hover:after:w-full"
        >
          Security
        </a>
        <a
          href="#features"
          className="text-zinc-400 hover:text-white transition-colors duration-200 relative after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-0 after:bg-white after:transition-all hover:after:w-full"
        >
          Features
        </a>
      </div>

      {/* Auth Buttons */}
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="px-5 py-2.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200"
        >
          Sign in
        </Link>

        <Link
          href="/signup"
          className="px-6 py-2.5 rounded-2xl bg-white text-sm font-semibold text-zinc-900 hover:bg-zinc-100 active:bg-zinc-200 transition-all duration-200 shadow-lg shadow-white/10"
        >
          Get started free
        </Link>
      </div>
    </motion.nav>
  );
}