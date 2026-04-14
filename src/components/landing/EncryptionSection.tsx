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
    bg: "bg-amber-500/10",
  },
  {
    icon: Lock,
    label: "AES-256-GCM",
    desc: "All data is encrypted locally before it ever leaves your device",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
  },
  {
    icon: Server,
    label: "Ciphertext only",
    desc: "Only encrypted blobs reach our servers — we store noise",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Eye,
    label: "Zero knowledge",
    desc: "Decryption happens entirely in your browser. We're cryptographically blind.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
  },
];

export function EncryptionSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-28 px-6 bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-medium tracking-[0.125em] mb-4 hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-colors">
            CRYPTOGRAPHY
          </div>
          <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-white mb-4">
            Encryption you can trust
          </h2>
          <p className="text-zinc-400 max-w-md mx-auto text-lg font-light leading-relaxed">
            Your master key never leaves your device.<br />
            Mathematical certainty, not promises.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, index) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative p-8 rounded-3xl border border-white/5 bg-white/3 
                         hover:border-white/20 hover:bg-white/5 hover:-translate-y-2 
                         transition-all duration-500 overflow-hidden"
            >
              {/* Icon Container */}
              <div
                className={`w-14 h-14 rounded-2xl ${step.bg} flex items-center justify-center mb-6 
                           transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}
              >
                <step.icon 
                  size={26} 
                  className={`${step.color} transition-all duration-500 group-hover:scale-110`} 
                />
              </div>

              {/* Content */}
              <h3 className="text-xl font-medium text-white mb-3 tracking-tight transition-colors group-hover:text-white">
                {step.label}
              </h3>
              <p className="text-zinc-400 text-[15px] leading-relaxed transition-colors group-hover:text-zinc-300">
                {step.desc}
              </p>

              {/* Number Indicator */}
              <div className="absolute top-8 right-8 text-6xl font-light text-white/5 
                             group-hover:text-white/10 transition-all duration-500">
                {String(index + 1).padStart(2, "0")}
              </div>

              {/* Subtle glow on hover */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </motion.div>
          ))}

          {/* Decorative connecting lines */}
          <div className="hidden lg:block absolute top-12 left-1/2 w-[calc(100%-6rem)] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Code Snippet - Enhanced Hover */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 rounded-3xl border border-white/6 bg-zinc-950/70 overflow-hidden shadow-xl shadow-black/50 
                     group hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10 
                     transition-all duration-500"
        >
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 bg-black/40 group-hover:bg-black/60 transition-colors">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <span className="ml-2 text-xs font-mono text-zinc-500 group-hover:text-zinc-400 transition-colors">
              crypto.ts — Key Derivation
            </span>
          </div>

          <pre className="p-8 text-sm font-mono leading-relaxed overflow-x-auto text-zinc-300 
                         group-hover:text-zinc-200 transition-colors">
            <code>
              <span className="text-zinc-500">// Master key derivation — client-side only</span>{"\n"}
              {"\n"}
              <span className="text-violet-400">async function</span>{" "}
              <span className="text-emerald-400">deriveKey</span>
              <span className="text-white">(password: string, salt: string)</span>{" "}
              <span className="text-white">{"{"}</span>{"\n"}
              {"  "}<span className="text-zinc-400">return</span>{" "}
              <span className="text-amber-400">crypto.subtle.deriveKey</span>
              {"(\n"}
              {"    "}{"{"} name: <span className="text-emerald-300">"PBKDF2"</span>,{"\n"}
              {"     "}salt: <span className="text-amber-300">new TextEncoder().encode(salt)</span>,{"\n"}
              {"     "}iterations: <span className="text-indigo-300">310_000</span>,{"\n"}
              {"     "}hash: <span className="text-emerald-300">"SHA-256"</span>{"\n"}
              {"    "}{"}"},{"\n"}
              {"    "}<span className="text-amber-300">new TextEncoder().encode(password)</span>,{"\n"}
              {"    "}{"{"} name: <span className="text-emerald-300">"AES-GCM"</span>, length: 256 {"}"},{"\n"}
              {"    "}"deriveBits"{"\n"}
              {"  )"};{"\n"}
              {"}"}
            </code>
          </pre>
        </motion.div>
      </div>
    </section>
  );
}