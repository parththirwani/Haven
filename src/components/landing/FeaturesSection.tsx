"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  FileText,
  Link2,
  BookOpen,
  KeyRound,
  Paperclip,
  GitBranch,
  ClipboardList,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Encrypted Notes",
    desc: "Markdown editor with full encryption. Your thoughts, your eyes only.",
    accent: "indigo",
  },
  {
    icon: Link2,
    title: "Private Links",
    desc: "Save and annotate links with metadata you control.",
    accent: "blue",
  },
  {
    icon: BookOpen,
    title: "Resources",
    desc: "Organize research, articles, and references in one place.",
    accent: "violet",
  },
  {
    icon: KeyRound,
    title: "Password Vault",
    desc: "Store credentials with AES-256-GCM. Never plaintext, ever.",
    accent: "amber",
  },
  {
    icon: Paperclip,
    title: "File Attachments",
    desc: "Attach and encrypt files to any item in your vault.",
    accent: "emerald",
  },
  {
    icon: GitBranch,
    title: "Knowledge Graph",
    desc: "Visualize connections between your notes and ideas.",
    accent: "pink",
  },
  {
    icon: ClipboardList,
    title: "Audit Log",
    desc: "Tamper-evident log of every access. You own the trail.",
    accent: "rose",
  },
  {
    icon: Shield,
    title: "Zero Knowledge",
    desc: "We're mathematically incapable of reading your data.",
    accent: "teal",
  },
];

const accentMap: Record<
  string,
  { text: string; glow: string; gradientFrom: string; gradientTo: string; border: string }
> = {
  indigo: { text: "text-indigo-400", glow: "rgba(99, 102, 241, 0.25)", gradientFrom: "from-indigo-500/30", gradientTo: "to-indigo-500/10", border: "rgba(99,102,241,0.4)" },
  blue: { text: "text-blue-400", glow: "rgba(59, 130, 246, 0.25)", gradientFrom: "from-blue-500/30", gradientTo: "to-blue-500/10", border: "rgba(59,130,246,0.4)" },
  violet: { text: "text-violet-400", glow: "rgba(139, 92, 246, 0.25)", gradientFrom: "from-violet-500/30", gradientTo: "to-violet-500/10", border: "rgba(139,92,246,0.4)" },
  amber: { text: "text-amber-400", glow: "rgba(245, 158, 11, 0.25)", gradientFrom: "from-amber-500/30", gradientTo: "to-amber-500/10", border: "rgba(245,158,11,0.4)" },
  emerald: { text: "text-emerald-400", glow: "rgba(16, 185, 129, 0.25)", gradientFrom: "from-emerald-500/30", gradientTo: "to-emerald-500/10", border: "rgba(16,185,129,0.4)" },
  pink: { text: "text-pink-400", glow: "rgba(236, 72, 153, 0.25)", gradientFrom: "from-pink-500/30", gradientTo: "to-pink-500/10", border: "rgba(236,72,153,0.4)" },
  rose: { text: "text-rose-400", glow: "rgba(244, 63, 94, 0.25)", gradientFrom: "from-rose-500/30", gradientTo: "to-rose-500/10", border: "rgba(244,63,94,0.4)" },
  teal: { text: "text-teal-400", glow: "rgba(20, 184, 166, 0.25)", gradientFrom: "from-teal-500/30", gradientTo: "to-teal-500/10", border: "rgba(20,184,166,0.4)" },
};

function FeatureCard({
  feature,
  index,
  inView,
}: {
  feature: (typeof features)[number];
  index: number;
  inView: boolean;
}) {
  const ac = accentMap[feature.accent];
  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.05, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.25, ease: "easeOut" }
      }}
      className="group relative p-7 rounded-3xl cursor-default overflow-hidden h-full"
      style={{
        background: "linear-gradient(145deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.008) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Stronger interactive glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-3xl"
        style={{
          background: `radial-gradient(ellipse at 40% 30%, ${ac.glow} 0%, transparent 65%)`,
        }}
      />

      {/* Border highlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-3xl"
        style={{
          border: `1px solid ${ac.border}`,
        }}
      />

      {/* Icon Container */}
      <motion.div
        whileHover={{ rotate: 8, scale: 1.15 }}
        transition={{ duration: 0.4 }}
        className={`relative w-11 h-11 rounded-2xl bg-gradient-to-br ${ac.gradientFrom} ${ac.gradientTo} flex items-center justify-center mb-6 ring-1 ring-white/10 group-hover:ring-white/20 transition-all`}
      >
        <Icon size={22} className={ac.text} strokeWidth={1.8} />
      </motion.div>

      {/* Text */}
      <h3 className="relative text-lg font-medium text-white tracking-[-0.01em] mb-2">
        {feature.title}
      </h3>
      <p className="relative text-[13px] text-zinc-400 leading-relaxed font-light">
        {feature.desc}
      </p>
    </motion.div>
  );
}

export function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="py-32 px-6 relative overflow-hidden"
      style={{
        background: "radial-gradient(circle at 50% 20%, rgba(99,102,241,0.08) 0%, transparent 60%)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Subtle background grid/pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-5 h-px bg-indigo-500/70" />
            <p className="text-xs font-semibold tracking-[0.2em] text-indigo-400 uppercase">Features</p>
            <div className="w-5 h-px bg-indigo-500/70" />
          </div>

          <h2 className="text-5xl sm:text-6xl font-light tracking-[-0.04em] text-white leading-[1.1]">
            Everything in one<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-300 to-zinc-500">
              encrypted vault
            </span>
          </h2>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <FeatureCard 
              key={feature.title} 
              feature={feature} 
              index={i} 
              inView={inView} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}