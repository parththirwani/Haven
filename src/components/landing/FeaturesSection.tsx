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
  indigo: {
    text: "text-indigo-300",
    glow: "rgba(99,102,241,0.15)",
    gradientFrom: "from-indigo-500/20",
    gradientTo: "to-indigo-500/5",
    border: "rgba(99,102,241,0.25)",
  },
  blue: {
    text: "text-blue-300",
    glow: "rgba(59,130,246,0.15)",
    gradientFrom: "from-blue-500/20",
    gradientTo: "to-blue-500/5",
    border: "rgba(59,130,246,0.25)",
  },
  violet: {
    text: "text-violet-300",
    glow: "rgba(139,92,246,0.15)",
    gradientFrom: "from-violet-500/20",
    gradientTo: "to-violet-500/5",
    border: "rgba(139,92,246,0.25)",
  },
  amber: {
    text: "text-amber-300",
    glow: "rgba(245,158,11,0.15)",
    gradientFrom: "from-amber-500/20",
    gradientTo: "to-amber-500/5",
    border: "rgba(245,158,11,0.25)",
  },
  emerald: {
    text: "text-emerald-300",
    glow: "rgba(16,185,129,0.15)",
    gradientFrom: "from-emerald-500/20",
    gradientTo: "to-emerald-500/5",
    border: "rgba(16,185,129,0.25)",
  },
  pink: {
    text: "text-pink-300",
    glow: "rgba(236,72,153,0.15)",
    gradientFrom: "from-pink-500/20",
    gradientTo: "to-pink-500/5",
    border: "rgba(236,72,153,0.25)",
  },
  rose: {
    text: "text-rose-300",
    glow: "rgba(244,63,94,0.15)",
    gradientFrom: "from-rose-500/20",
    gradientTo: "to-rose-500/5",
    border: "rgba(244,63,94,0.25)",
  },
  teal: {
    text: "text-teal-300",
    glow: "rgba(20,184,166,0.15)",
    gradientFrom: "from-teal-500/20",
    gradientTo: "to-teal-500/5",
    border: "rgba(20,184,166,0.25)",
  },
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
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.065, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2, ease: "easeOut" } }}
      className="group relative p-5 rounded-2xl cursor-default overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.01) 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Hover glow splash */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
        style={{
          background: `radial-gradient(ellipse at 30% 20%, ${ac.glow} 0%, transparent 70%)`,
        }}
      />

      {/* Hover border highlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
        style={{
          border: `1px solid ${ac.border}`,
        }}
      />

      {/* Icon */}
      <div
        className={`relative w-9 h-9 rounded-xl bg-linear-to-br ${ac.gradientFrom} ${ac.gradientTo} flex items-center justify-center mb-4 ring-1 ring-white/10`}
      >
        <Icon size={15} className={ac.text} strokeWidth={1.75} />
      </div>

      {/* Text */}
      <h3 className="relative text-[13px] font-[490] text-zinc-100 tracking-[-0.01em] mb-1.5">
        {feature.title}
      </h3>
      <p className="relative text-[12px] text-zinc-500 leading-[1.65] font-light">
        {feature.desc}
      </p>
    </motion.div>
  );
}

export function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="py-28 px-6"
      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-16"
        >
          <div className="flex items-center gap-2 mb-5">
            <span
              className="inline-block w-4 h-px"
              style={{ background: "rgba(99,102,241,0.7)" }}
            />
            <p className="text-[10px] font-semibold tracking-[0.18em] text-indigo-400 uppercase">
              Features
            </p>
          </div>
          <h2
            className="text-[2rem] font-[320] tracking-[-0.03em] text-white leading-[1.2] max-w-xs"
            style={{ fontVariationSettings: "'wght' 320" }}
          >
            Everything in one
            <br />
            <span className="text-zinc-400">encrypted vault.</span>
          </h2>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}