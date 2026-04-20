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
  indigo: { text: "text-indigo-300", glow: "rgba(99,102,241,0.15)", gradientFrom: "from-indigo-500/20", gradientTo: "to-indigo-500/5", border: "rgba(99,102,241,0.25)" },
  blue: { text: "text-blue-300", glow: "rgba(59,130,246,0.15)", gradientFrom: "from-blue-500/20", gradientTo: "to-blue-500/5", border: "rgba(59,130,246,0.25)" },
  violet: { text: "text-violet-300", glow: "rgba(139,92,246,0.15)", gradientFrom: "from-violet-500/20", gradientTo: "to-violet-500/5", border: "rgba(139,92,246,0.25)" },
  amber: { text: "text-amber-300", glow: "rgba(245,158,11,0.15)", gradientFrom: "from-amber-500/20", gradientTo: "to-amber-500/5", border: "rgba(245,158,11,0.25)" },
  emerald: { text: "text-emerald-300", glow: "rgba(16,185,129,0.15)", gradientFrom: "from-emerald-500/20", gradientTo: "to-emerald-500/5", border: "rgba(16,185,129,0.25)" },
  pink: { text: "text-pink-300", glow: "rgba(236,72,153,0.15)", gradientFrom: "from-pink-500/20", gradientTo: "to-pink-500/5", border: "rgba(236,72,153,0.25)" },
  rose: { text: "text-rose-300", glow: "rgba(244,63,94,0.15)", gradientFrom: "from-rose-500/20", gradientTo: "to-rose-500/5", border: "rgba(244,63,94,0.25)" },
  teal: { text: "text-teal-300", glow: "rgba(20,184,166,0.15)", gradientFrom: "from-teal-500/20", gradientTo: "to-teal-500/5", border: "rgba(20,184,166,0.25)" },
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
      initial={{ opacity: 0, y: 60, scale: 0.95 }}
      animate={
        inView
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 60, scale: 0.95 }
      }
      transition={{
        duration: 0.7,
        delay: index * 0.06,
        ease: [0.23, 1, 0.32, 1], // smooth "spring-like" feel
      }}
      whileHover={{
        y: -6,
        scale: 1.02,
        transition: { duration: 0.25, ease: "easeOut" },
      }}
      className="group relative p-6 rounded-3xl cursor-default overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.008) 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Hover glow splash */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"
        style={{
          background: `radial-gradient(ellipse at 35% 25%, ${ac.glow} 0%, transparent 65%)`,
        }}
      />

      {/* Hover border highlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-3xl"
        style={{
          border: `1px solid ${ac.border}`,
        }}
      />

      {/* Icon Container */}
      <div
        className={`relative w-11 h-11 rounded-2xl bg-gradient-to-br ${ac.gradientFrom} ${ac.gradientTo} flex items-center justify-center mb-5 ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-110`}
      >
        <Icon size={18} className={ac.text} strokeWidth={1.8} />
      </div>

      {/* Text Content */}
      <h3 className="relative text-[14px] font-medium text-white tracking-[-0.015em] mb-2">
        {feature.title}
      </h3>
      <p className="relative text-[13px] text-zinc-400 leading-relaxed font-light">
        {feature.desc}
      </p>
    </motion.div>
  );
}

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { 
    once: true, 
    margin: "-100px 0px -50px 0px" 
  });

  return (
    <section
      ref={ref}
      className="py-28 px-6 relative"
      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header with improved animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-20 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <span
              className="inline-block w-6 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
            />
            <p className="text-xs font-semibold tracking-[0.125em] text-indigo-400 uppercase">
              FEATURES
            </p>
            <span
              className="inline-block w-6 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
            />
          </div>

          <h2 className="text-4xl md:text-5xl font-light tracking-[-0.04em] text-white leading-[1.1]">
            Everything in one<br />
            <span className="text-zinc-400">encrypted vault.</span>
          </h2>
        </motion.div>

        {/* Features Grid with Staggered Animation */}
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