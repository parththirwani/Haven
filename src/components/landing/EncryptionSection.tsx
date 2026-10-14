"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Key, Server, Eye, Lock, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Key,
    step: "01",
    label: "Passphrase",
    desc: "PBKDF2 · 310,000 iterations · SHA-256. Your master key is derived locally — never transmitted.",
    color: "#fbbf24",
  },
  {
    icon: Lock,
    step: "02",
    label: "AES-256-GCM",
    desc: "Every byte is encrypted before it leaves your device. Authenticated encryption — no tampering possible.",
    color: "#818cf8",
  },
  {
    icon: Server,
    step: "03",
    label: "Ciphertext",
    desc: "Our servers receive opaque blobs. No keys, no plaintext — just mathematically secure noise.",
    color: "#34d399",
  },
  {
    icon: Eye,
    step: "04",
    label: "Zero knowledge",
    desc: "Decryption lives entirely in your browser. We are cryptographically incapable of reading your data.",
    color: "#fb7185",
  },
];

export function EncryptionSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative py-32 px-6 bg-[#06060A] border-t border-white/[0.04] overflow-hidden"
    >
      {/* Subtle ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-amber-500/[0.015] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-24 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p
              className="text-[11px] font-medium tracking-[0.18em] text-amber-400/60 uppercase mb-5"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Cryptography
            </p>
            <h2 className="text-[2.75rem] sm:text-5xl font-extralight tracking-[-0.045em] text-white leading-[1.02]">
              Trust the math,
              <br />
              <span className="text-white/30">not the promise.</span>
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-zinc-500 text-[15px] leading-relaxed max-w-sm font-light md:text-right"
          >
            A four-step pipeline where your key never leaves your hands — by design, not policy.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Vertical connector line (desktop) */}
          <div className="hidden md:block absolute left-[39px] top-6 bottom-6 w-px bg-gradient-to-b from-white/[0.08] via-white/[0.04] to-transparent" />

          <div className="space-y-1">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group relative grid grid-cols-[48px_1fr] md:grid-cols-[80px_180px_1fr_auto] items-start gap-5 md:gap-8 py-7 px-1 -mx-1 rounded-lg hover:bg-white/[0.015] transition-colors duration-300"
              >
                {/* Step number */}
                <div
                  className="relative z-10 text-[11px] font-medium pt-1.5"
                  style={{
                    color: step.color,
                    fontFamily: "'JetBrains Mono', monospace",
                    opacity: 0.85,
                  }}
                >
                  {step.step}
                </div>

                {/* Icon + label */}
                <div className="flex items-center gap-3.5">
                  <div
                    className="relative w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-105"
                    style={{
                      background: `${step.color}0d`,
                      border: `1px solid ${step.color}22`,
                      boxShadow: `0 0 0 0 ${step.color}00`,
                    }}
                  >
                    <step.icon size={15} style={{ color: step.color }} strokeWidth={1.75} />
                    {/* Hover glow */}
                    <div
                      className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        boxShadow: `0 0 20px -4px ${step.color}40`,
                      }}
                    />
                  </div>
                  <span className="text-[15px] font-medium text-zinc-100 tracking-tight">
                    {step.label}
                  </span>
                </div>

                {/* Description */}
                <p className="text-zinc-500 text-[13.5px] leading-relaxed font-light col-span-2 md:col-span-1 md:pt-0.5">
                  {step.desc}
                </p>

                {/* Hover arrow */}
                <div className="hidden md:flex items-center justify-end opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
                  <ArrowRight size={15} className="text-zinc-600" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Code block */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 rounded-xl overflow-hidden border border-white/[0.06] bg-black/40 backdrop-blur-sm"
        >
          {/* Title bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05] bg-white/[0.015]">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                  <div
                    key={c}
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: c, opacity: 0.75 }}
                  />
                ))}
              </div>
              <span
                className="text-[11px] text-zinc-500 ml-1"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                crypto.ts
              </span>
            </div>
            <span
              className="text-[10px] text-amber-500/50 tracking-widest uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              client-side only
            </span>
          </div>

          {/* Code */}
          <pre
            className="p-6 text-[12.5px] leading-[1.8] overflow-x-auto"
            style={{
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            }}
          >
            <code>
              <span style={{ color: "#6b7280" }}>// Master key derivation — runs locally, never on our servers</span>
              {"\n\n"}
              <span style={{ color: "#c084fc" }}>async function</span>{" "}
              <span style={{ color: "#34d399" }}>deriveKey</span>
              <span style={{ color: "#e5e7eb" }}>(password: </span>
              <span style={{ color: "#fbbf24" }}>string</span>
              <span style={{ color: "#e5e7eb" }}>, salt: </span>
              <span style={{ color: "#fbbf24" }}>string</span>
              <span style={{ color: "#e5e7eb" }}>) {"{"}</span>
              {"\n"}
              {"  "}
              <span style={{ color: "#94a3b8" }}>return</span>{" "}
              <span style={{ color: "#fbbf24" }}>crypto.subtle</span>
              <span style={{ color: "#e5e7eb" }}>.deriveKey({"{"}</span>
              {"\n"}
              {"    "}
              <span style={{ color: "#e5e7eb" }}>name: </span>
              <span style={{ color: "#86efac" }}>"PBKDF2"</span>
              <span style={{ color: "#e5e7eb" }}>,</span>
              {"\n"}
              {"    "}
              <span style={{ color: "#e5e7eb" }}>salt: </span>
              <span style={{ color: "#fbbf24" }}>new TextEncoder()</span>
              <span style={{ color: "#e5e7eb" }}>.encode(salt),</span>
              {"\n"}
              {"    "}
              <span style={{ color: "#e5e7eb" }}>iterations: </span>
              <span style={{ color: "#818cf8" }}>310_000</span>
              <span style={{ color: "#e5e7eb" }}>,</span>
              {"\n"}
              {"    "}
              <span style={{ color: "#e5e7eb" }}>hash: </span>
              <span style={{ color: "#86efac" }}>"SHA-256"</span>
              {"\n"}
              {"  "}
              <span style={{ color: "#e5e7eb" }}>{"}"}, baseKey, {"{"} name: </span>
              <span style={{ color: "#86efac" }}>"AES-GCM"</span>
              <span style={{ color: "#e5e7eb" }}>, length: </span>
              <span style={{ color: "#818cf8" }}>256</span>
              <span style={{ color: "#e5e7eb" }}> {"}"}, </span>
              <span style={{ color: "#86efac" }}>"deriveBits"</span>
              <span style={{ color: "#e5e7eb" }}>);</span>
              {"\n"}
              <span style={{ color: "#e5e7eb" }}>{"}"}</span>
            </code>
          </pre>
        </motion.div>
      </div>
    </section>
  );
}
