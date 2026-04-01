"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";

export function CTASection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-32 px-6 border-t border-white/5 overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-indigo-950/30 to-transparent pointer-events-none" />

      <div className="max-w-xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Elegant icon with glow */}
          <div className="mx-auto mb-12 flex items-center justify-center">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 bg-linear-to-br from-indigo-500 via-purple-500 to-violet-500 rounded-3xl blur-xl opacity-20" />
              <div className="relative w-20 h-20 rounded-3xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl flex items-center justify-center shadow-2xl">
                <span className="text-4xl drop-shadow-sm">🔐</span>
              </div>
            </div>
          </div>

          <h2 className="text-6xl sm:text-7xl font-light tracking-tighter text-white mb-8">
            Start keeping<br />your secrets safe
          </h2>

          <p className="text-xl text-zinc-400 font-light max-w-md mx-auto mb-14 leading-relaxed">
            Beautifully private. Free forever.<br />
            No ads. No tracking. Just yours.
          </p>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.985 }}
          >
            <Link
              href="/signup"
              className="group relative inline-flex items-center gap-3 px-10 py-5 text-lg font-medium rounded-2xl
                         bg-white text-zinc-950 overflow-hidden transition-all duration-500
                         hover:shadow-2xl hover:shadow-indigo-500/20"
            >
              <span className="relative z-10 flex items-center gap-3">
                Create your vault
                <ArrowRight 
                  size={22} 
                  className="group-hover:translate-x-1 transition-transform duration-300" 
                />
              </span>
              
              {/* Subtle shine effect */}
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700" />
            </Link>
          </motion.div>
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
