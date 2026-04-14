"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";

export function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="py-32 px-6 border-t border-white/6 bg-[#080808]"
    >
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          {/* Floating Icon */}
          <div
            className="mx-auto mb-10 w-16 h-16 rounded-3xl border border-indigo-500/20 bg-indigo-500/10 flex items-center justify-center"
            style={{ animation: "float 3.5s ease-in-out infinite" }}
          >
            <span className="text-4xl">🔐</span>
          </div>

          <h2 className="text-5xl sm:text-6xl font-light tracking-[-0.03em] text-white mb-6">
            Start keeping secrets
          </h2>

          <p className="text-zinc-400 text-lg font-light max-w-md mx-auto mb-12 leading-relaxed">
            Free forever for personal use. <br className="hidden sm:block" />
            No credit card required. No data harvested.
          </p>

          <Link
            href="/signup"
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all duration-200 active:scale-[0.985] shadow-lg shadow-indigo-500/30"
          >
            Create your vault
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/6 px-6 py-16 bg-[#080808]">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
              <span className="text-sm">🔒</span>
            </div>
            <div>
              <span className="text-lg font-semibold tracking-tight text-white">
                Haven
              </span>
              <p className="text-xs text-zinc-500 mt-0.5">
                Privacy-first second brain
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-8 text-sm text-zinc-400">
            <Link
              href="/login"
              className="hover:text-zinc-200 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="hover:text-zinc-200 transition-colors"
            >
              Sign up
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors"
            >
              <Github size={15} />
              GitHub
            </a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-zinc-600">
            © {currentYear} Haven. All your data stays yours.
          </p>
        </div>

        {/* Optional subtle legal line */}
        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] text-zinc-700 tracking-wide">
            Built with zero-knowledge architecture • End-to-end encrypted
          </p>
        </div>
      </div>
    </footer>
  );
}