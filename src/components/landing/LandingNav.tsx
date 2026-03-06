"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function LandingNav() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
      style={{
        background: "linear-gradient(to bottom, rgba(8,8,8,0.9) 0%, transparent 100%)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/25 transition-colors">
          <span className="text-xs">🔒</span>
        </div>
        <span className="text-sm font-medium text-zinc-200">Haven</span>
      </Link>

      {/* Nav links */}
      <div className="hidden sm:flex items-center gap-6 text-sm text-zinc-500">
        <a href="#encryption" className="hover:text-zinc-300 transition-colors">
          Security
        </a>
        <a href="#features" className="hover:text-zinc-300 transition-colors">
          Features
        </a>
      </div>

      {/* Auth links */}
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/8 text-sm text-zinc-200 hover:bg-white/10 hover:border-white/15 transition-all duration-200"
        >
          Get started
        </Link>
      </div>
    </motion.nav>
  );
}
