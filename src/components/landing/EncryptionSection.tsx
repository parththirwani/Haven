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
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-32 px-6 bg-[#06060A] border-t border-white/[0.04]">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-20 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <p
              className="text-[10px] font-semibold tracking-[0.2em] text-amber-500/70 uppercase mb-4"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Cryptography
            </p>
            <h2 className="text-[2.75rem] font-extralight tracking-[-0.04em] text-white leading-[1.05]">
              Trust the math,
              <br />
              <span className="text-white/35">not the promise.</span>
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-zinc-500 text-sm leading-relaxed max-w-xs font-light md:text-right"
          >
            A four-step pipeline where your key never leaves your hands — by design, not policy.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="space-y-0">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className="group grid grid-cols-[56px_1fr] md:grid-cols-[80px_200px_1fr_auto] items-start gap-6 md:gap-8 py-8 border-t border-white/[0.06] hover:border-white/[0.12] transition-colors duration-300"
            >
              {/* Step number */}
              <div
                className="text-[11px] font-semibold pt-0.5"
                style={{
                  color: step.color,
                  fontFamily: "'JetBrains Mono', monospace",
                  opacity: 0.7,
                }}
              >
                {step.step}
              </div>

              {/* Icon + label */}
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                  style={{
                    background: `${step.color}12`,
                    border: `1px solid ${step.color}25`,
                  }}
                >
                  <step.icon size={14} style={{ color: step.color }} />
                </div>
                <span className="text-sm font-medium text-zinc-200 tracking-tight whitespace-nowrap">
                  {step.label}
                </span>
              </div>

              {/* Description */}
              <p className="text-zinc-500 text-[13.5px] leading-relaxed font-light col-span-2 md:col-span-1">
                {step.desc}
              </p>

              {/* Hover arrow */}
              <div className="hidden md:flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <ArrowRight size={14} className="text-zinc-600" />
              </div>
            </motion.div>
          ))}
          <div className="border-t border-white/[0.06]" />
        </div>

        {/* Code block */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-16 rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* Title bar */}
          <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                  <div
                    key={c}
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: c, opacity: 0.7 }}
                  />
                ))}
              </div>
              <span
                className="text-[11px] text-zinc-600 ml-1"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                crypto.ts
              </span>
            </div>
            <span
              className="text-[10px] text-amber-600/60 tracking-widest uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              client-side only
            </span>
          </div>

          {/* Code */}
          <pre
            className="p-6 text-[12.5px] leading-[1.75] overflow-x-auto"
            style={{
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              background: "rgba(0,0,0,0.4)",
            }}
          >
            <code>
              <span style={{ color: "#6b7280" }}>// Master key derivation — runs locally, never on our servers</span>{"\n\n"}
              <span style={{ color: "#c084fc" }}>async function</span>{" "}
              <span style={{ color: "#34d399" }}>deriveKey</span>
              <span style={{ color: "#e5e7eb" }}>(password: </span>
              <span style={{ color: "#fbbf24" }}>string</span>
              <span style={{ color: "#e5e7eb" }}>, salt: </span>
              <span style={{ color: "#fbbf24" }}>string</span>
              <span style={{ color: "#e5e7eb" }}>) {"{"}</span>{"\n"}
              {"  "}<span style={{ color: "#94a3b8" }}>return</span>{" "}
              <span style={{ color: "#fbbf24" }}>crypto.subtle</span>
              <span style={{ color: "#e5e7eb" }}>.deriveKey({"{"}</span>{"\n"}
              {"    "}<span style={{ color: "#e5e7eb" }}>name: </span>
              <span style={{ color: "#86efac" }}>"PBKDF2"</span>
              <span style={{ color: "#e5e7eb" }}>,</span>{"\n"}
              {"    "}<span style={{ color: "#e5e7eb" }}>salt: </span>
              <span style={{ color: "#fbbf24" }}>new TextEncoder()</span>
              <span style={{ color: "#e5e7eb" }}>.encode(salt),</span>{"\n"}
              {"    "}<span style={{ color: "#e5e7eb" }}>iterations: </span>
              <span style={{ color: "#818cf8" }}>310_000</span>
              <span style={{ color: "#e5e7eb" }}>,</span>{"\n"}
              {"    "}<span style={{ color: "#e5e7eb" }}>hash: </span>
              <span style={{ color: "#86efac" }}>"SHA-256"</span>{"\n"}
              {"  "}<span style={{ color: "#e5e7eb" }}>{"}"}, baseKey, {"{"} name: </span>
              <span style={{ color: "#86efac" }}>"AES-GCM"</span>
              <span style={{ color: "#e5e7eb" }}>, length: </span>
              <span style={{ color: "#818cf8" }}>256</span>
              <span style={{ color: "#e5e7eb" }}> {"}"}, </span>
              <span style={{ color: "#86efac" }}>"deriveBits"</span>
              <span style={{ color: "#e5e7eb" }}>);</span>{"\n"}
              <span style={{ color: "#e5e7eb" }}>{"}"}</span>
            </code>
          </pre>
        </motion.div>
      </div>
    </section>
  );
}