"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";

export function CTASection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-32 px-6 border-t border-white/6">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div
            className="inline-block mb-8 w-14 h-14 rounded-2xl border border-indigo-500/20 bg-indigo-500/8 items-center justify-center"
            style={{ animation: "float 4s ease-in-out infinite" }}
          >
            <span className="text-2xl">🔐</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-white mb-6">
            Start keeping secrets
          </h2>
          <p className="text-zinc-400 font-light max-w-md mx-auto mb-10">
            Free forever for personal use. No credit card required. No data harvested.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium transition-all duration-200 glow-accent"
            >
              Create your vault
              <ArrowRight
                size={14}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/6 px-6 py-12">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-indigo-500/20 flex items-center justify-center">
            <span className="text-xs">🔒</span>
          </div>
          <span className="text-sm font-medium text-zinc-300">Haven</span>
          <span className="text-xs text-zinc-600">·</span>
          <span className="text-xs text-zinc-600">Privacy-first second brain</span>
        </div>

        <div className="flex items-center gap-6 text-xs text-zinc-500">
          <Link href="/login" className="hover:text-zinc-300 transition-colors">
            Sign in
          </Link>
          <Link href="/signup" className="hover:text-zinc-300 transition-colors">
            Sign up
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-300 transition-colors flex items-center gap-1.5"
          >
            <Github size={12} />
            GitHub
          </a>
        </div>

        <p className="text-xs text-zinc-700">
          © {new Date().getFullYear()} Haven. All data stays yours.
        </p>
      </div>
    </footer>
  );
}
