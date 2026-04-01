"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Key, Lock, Server, Eye } from "lucide-react";

const steps = [
  {
    icon: Key,
    label: "Your Password",
    desc: "PBKDF2 with 310,000 iterations derives your master key",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: Lock,
    label: "AES-256-GCM",
    desc: "All data is encrypted locally before leaving your device",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
  },
  {
    icon: Server,
    label: "Ciphertext Only",
    desc: "Only encrypted blobs reach our servers — we store noise",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Eye,
    label: "Zero Knowledge",
    desc: "Decryption happens in your browser. We're cryptographically blind.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
  },
];

export function EncryptionSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-32 px-6 relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/50 to-transparent" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-6">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-xs font-medium tracking-[3px] text-zinc-400 uppercase">
              Security Architecture
            </p>
          </div>

          <h2 className="text-5xl sm:text-6xl font-light tracking-tighter text-white mb-6">
            Encryption you can trust
          </h2>

          <p className="text-xl text-zinc-400 max-w-lg mx-auto font-light leading-relaxed">
            Your master key never leaves your device.<br />
            Mathematical certainty — not just promises.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="group relative p-8 rounded-3xl border border-white/10 bg-zinc-950/60 backdrop-blur-xl hover:border-white/20 transition-all duration-500 hover:-translate-y-1"
            >
              <div className={`w-14 h-14 rounded-2xl ${step.bg} flex items-center justify-center mb-6 transition-all group-hover:scale-110`}>
                <step.icon size={28} className={step.color} strokeWidth={2.25} />
              </div>

              <h3 className="text-2xl font-light text-white mb-3 tracking-tight">
                {step.label}
              </h3>

              <p className="text-zinc-400 leading-relaxed text-[15px]">
                {step.desc}
              </p>

              {/* Decorative line for desktop */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 -right-3 w-6 h-px bg-gradient-to-r from-white/10 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Modern Code Snippet */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="mt-20 max-w-3xl mx-auto"
        >
          <div className="rounded-3xl border border-white/10 bg-zinc-950/80 backdrop-blur-2xl overflow-hidden shadow-2xl">
            {/* Window Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <span className="text-xs text-zinc-500 font-mono tracking-wide">crypto.ts</span>
              </div>
              <div className="text-[10px] text-zinc-600 font-mono">PBKDF2 + AES-256-GCM</div>
            </div>

            {/* Code Content */}
            <pre className="p-8 text-sm font-mono text-zinc-300 overflow-x-auto">
              <code>
                <span className="text-zinc-500">// Key derivation — client-side only</span>{"\n"}
                {"\n"}
                <span className="text-violet-400">async function</span>{" "}
                <span className="text-sky-400">deriveMasterKey</span>
                <span className="text-zinc-400">(password: string, salt: Uint8Array)</span>{" "}
                <span className="text-zinc-500">{"{"}</span>{"\n"}
                {"  "}<span className="text-zinc-500">return</span>{" "}
                <span className="text-amber-400">crypto.subtle.deriveKey</span>
                <span className="text-zinc-400">({"{"}</span>{"\n"}
                {"    "}name: <span className="text-emerald-300">"PBKDF2"</span>,{"\n"}
                {"    "}salt,{"\n"}
                {"    "}iterations: <span className="text-orange-400">310_000</span>,{"\n"}
                {"    "}hash: <span className="text-emerald-300">"SHA-256"</span>,{"\n"}
                {"  "}<span className="text-zinc-400">{"}"}</span>,{"\n"}
                {"  "}<span className="text-zinc-400">{"password"}</span>,{"\n"}
                {"  "}<span className="text-violet-400">{"{ name: 'AES-GCM', length: 256 }"}</span>,{"\n"}
                {"  "}<span className="text-zinc-400">true</span>,{"\n"}
                {"  "}[<span className="text-emerald-300">"encrypt"</span>, <span className="text-emerald-300">"decrypt"</span>]{")"}{"\n"}
                <span className="text-zinc-500">{"}"}</span>
              </code>
            </pre>
          </div>

          <p className="text-center text-xs text-zinc-600 mt-6 font-light">
            Everything runs in your browser. We never see your password or your data.
          </p>
        </motion.div>
      </div>
    </section>
  );
}