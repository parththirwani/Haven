"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Lock, Github } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// CTA SECTION
// ═══════════════════════════════════════════════════════════════════════════════

export function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="relative py-36 px-6 overflow-hidden bg-[#06060A]"
      style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
    >
      {/* Amber bloom */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 60%, rgba(251,191,36,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-2xl mx-auto text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Geometric lockup */}
          <motion.div
            className="mx-auto mb-12 relative w-20 h-20"
            animate={{ rotate: [0, 0.5, -0.5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div
              className="w-20 h-20 rounded-2xl border flex items-center justify-center"
              style={{
                borderColor: "rgba(251,191,36,0.2)",
                background:
                  "linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(251,191,36,0.02) 100%)",
              }}
            >
              <Lock size={28} className="text-amber-400/70" />
            </div>
            {/* Corner ticks */}
            {[
              { pos: "-top-2 -left-2", bt: 1, bb: 0, bl: 1, br: 0 },
              { pos: "-top-2 -right-2", bt: 1, bb: 0, bl: 0, br: 1 },
              { pos: "-bottom-2 -left-2", bt: 0, bb: 1, bl: 1, br: 0 },
              { pos: "-bottom-2 -right-2", bt: 0, bb: 1, bl: 0, br: 1 },
            ].map(({ pos, bt, bb, bl, br }, i) => (
              <div
                key={i}
                className={`absolute ${pos} w-2 h-2`}
                style={{
                  borderTopWidth: bt,
                  borderBottomWidth: bb,
                  borderLeftWidth: bl,
                  borderRightWidth: br,
                  borderStyle: "solid",
                  borderColor: "rgba(251,191,36,0.4)",
                }}
              />
            ))}
          </motion.div>

          <h2
            className="font-extralight tracking-[-0.04em] text-white leading-[1.05] mb-5"
            style={{ fontSize: "clamp(2.5rem, 7vw, 4.5rem)" }}
          >
            Keep your secrets
            <br />
            <span className="text-white/25">actually secret.</span>
          </h2>

          <p className="text-zinc-500 text-base font-light max-w-sm mx-auto mb-12 leading-relaxed">
            Free for personal use — always. No card, no surveillance, no asterisks.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="group relative flex items-center gap-2.5 px-8 py-4 rounded-lg text-sm font-medium text-black overflow-hidden transition-all duration-200 active:scale-[0.982]"
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
              className="px-8 py-4 rounded-lg border border-white/[0.08] text-zinc-500 hover:text-white hover:border-white/[0.16] text-sm font-medium transition-all duration-200"
            >
              Already have a vault
            </Link>
          </div>

          {/* Trust micro-copy */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
            className="mt-10 text-[11px] text-zinc-700 tracking-widest uppercase"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            AES-256 · PBKDF2 · open source
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════════════════════

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="px-6 py-14 bg-[#04040A]"
      style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Main row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div
                className="w-6 h-6 rounded flex items-center justify-center"
                style={{
                  border: "1px solid rgba(251,191,36,0.2)",
                  background: "rgba(251,191,36,0.06)",
                }}
              >
                <Lock size={11} className="text-amber-500/70" />
              </div>
              <span className="text-sm font-medium text-zinc-200 tracking-tight">Haven</span>
            </div>
            <p className="text-[11px] text-zinc-600 font-light">Privacy-first second brain</p>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-6">
            {[
              { href: "/login", label: "Sign in" },
              { href: "/signup", label: "Sign up" },
              { href: "/security", label: "Security" },
              { href: "/open-source", label: "Open source" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[12.5px] text-zinc-600 hover:text-zinc-300 transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://github.com/haven"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-600 hover:text-zinc-300 transition-colors duration-150"
            >
              <Github size={14} />
            </a>
          </nav>

          {/* Copyright */}
          <p className="text-[11px] text-zinc-700">© {year} Haven</p>
        </div>

        {/* Bottom strip */}
        <div
          className="mt-10 pt-6 flex items-center justify-between"
          style={{ borderTop: "1px solid rgba(255,255,255,0.03)" }}
        >
          <p
            className="text-[10px] text-zinc-800 tracking-[0.15em] uppercase"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            E2E encrypted · zero knowledge architecture
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-amber-500/40" />
            <span
              className="text-[10px] text-zinc-800 tracking-widest"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              AES-256-GCM
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}