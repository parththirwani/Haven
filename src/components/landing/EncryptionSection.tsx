"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Key, Server, Eye, Lock } from "lucide-react";

const steps = [
  {
    icon: Key,
    label: "Your password",
    desc: "PBKDF2 with 310,000 iterations derives your master key",
    color: "text-amber-400",
    bg: "bg-amber-500/8",
  },
  {
    icon: Lock,
    label: "AES-256-GCM",
    desc: "All data is encrypted locally before leaving your device",
    color: "text-indigo-400",
    bg: "bg-indigo-500/8",
  },
  {
    icon: Server,
    label: "Ciphertext only",
    desc: "Only encrypted blobs reach our servers — we store noise",
    color: "text-emerald-400",
    bg: "bg-emerald-500/8",
  },
  {
    icon: Eye,
    label: "Zero knowledge",
    desc: "Decryption happens in your browser. We're cryptographically blind.",
    color: "text-rose-400",
    bg: "bg-rose-500/8",
  },
];

export function EncryptionSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-medium tracking-widest text-indigo-400 uppercase mb-4">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-white">
            Encryption you can trust
          </h2>
          <p className="mt-4 text-zinc-400 max-w-md mx-auto font-light">
            Your master key never leaves your device. Mathematical certainty, not promises.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="relative p-5 rounded-xl border border-white/6 bg-white/2 group hover:border-white/10 transition-colors"
            >
              <div className={`w-9 h-9 rounded-lg ${step.bg} flex items-center justify-center mb-4`}>
                <step.icon size={16} className={step.color} />
              </div>
              <h3 className="text-sm font-medium text-zinc-200 mb-1.5">{step.label}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{step.desc}</p>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-9 -right-2 w-4 h-px bg-zinc-700" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Code snippet */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-10 rounded-xl border border-white/6 bg-white/2 overflow-hidden"
        >
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/6">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
            <span className="ml-2 text-xs text-zinc-600 font-mono">crypto.ts</span>
          </div>
          <pre className="p-5 text-xs font-mono leading-relaxed overflow-x-auto">
            <code>
              <span className="text-zinc-500">{"// Key derivation — happens only in your browser\n"}</span>
              <span className="text-indigo-400">{"async function "}</span>
              <span className="text-emerald-400">{"deriveKey"}</span>
              <span className="text-zinc-300">{"(password, salt) {"}</span>
              {"\n"}
              <span className="text-zinc-400">{"  return crypto.subtle."}</span>
              <span className="text-amber-400">{"deriveKey"}</span>
              <span className="text-zinc-300">{"({ name: "}</span>
              <span className="text-emerald-300">{'"PBKDF2"'}</span>
              <span className="text-zinc-300">{", iterations: "}</span>
              <span className="text-indigo-300">{"310_000"}</span>
              <span className="text-zinc-300">{" })"}</span>
              {"\n"}
              <span className="text-zinc-300">{"}"}</span>
            </code>
          </pre>
        </motion.div>
      </div>
    </section>
  );
}
