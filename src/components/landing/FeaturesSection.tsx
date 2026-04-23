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
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Encrypted Notes",
    desc: "Markdown editor with zero-knowledge encryption. Your thoughts stay yours.",
    tag: "Editor",
  },
  {
    icon: Link2,
    title: "Private Links",
    desc: "Save and annotate links with metadata you control.",
    tag: "Bookmarks",
  },
  {
    icon: BookOpen,
    title: "Resources",
    desc: "Organize research, articles, and references in one encrypted place.",
    tag: "Library",
  },
  {
    icon: KeyRound,
    title: "Password Vault",
    desc: "AES-256-GCM credential storage. Never plaintext, ever.",
    tag: "Security",
  },
  {
    icon: Paperclip,
    title: "File Attachments",
    desc: "Attach and encrypt files to any item in your vault.",
    tag: "Storage",
  },
  {
    icon: GitBranch,
    title: "Knowledge Graph",
    desc: "Visualize connections between your notes and ideas.",
    tag: "Graph",
  },
  {
    icon: ClipboardList,
    title: "Audit Log",
    desc: "Tamper-evident log of every access. You own the trail.",
    tag: "Logs",
  },
  {
    icon: Shield,
    title: "Zero Knowledge",
    desc: "We're mathematically incapable of reading your data.",
    tag: "Privacy",
  },
];

const tagColors = [
  "#fbbf24",
  "#818cf8",
  "#34d399",
  "#f472b6",
  "#38bdf8",
  "#a78bfa",
  "#fb7185",
  "#6ee7b7",
];

export function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      ref={ref}
      className="py-32 px-6 bg-[#06060A]"
      style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
    >
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p
            className="text-[10px] font-semibold tracking-[0.2em] text-amber-500/60 uppercase mb-4"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Everything you need
          </p>
          <h2 className="text-[2.5rem] font-extralight tracking-[-0.04em] text-white leading-[1.1] max-w-sm">
            One vault.
            <br />
            <span className="text-white/30">All encrypted.</span>
          </h2>
        </motion.div>

        {/* Feature list */}
        <div className="space-y-0">
          {features.map((f, i) => {
            const Icon = f.icon;
            const accent = tagColors[i];
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -10 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.45, delay: i * 0.055 }}
                className="group flex items-center gap-6 py-5 border-b border-white/[0.05] hover:border-white/[0.1] transition-colors duration-200 cursor-default"
              >
                {/* Icon */}
                <div
                  className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                  style={{
                    background: `${accent}10`,
                    border: `1px solid ${accent}20`,
                  }}
                >
                  <Icon size={14} style={{ color: accent }} strokeWidth={1.5} />
                </div>

                {/* Tag */}
                <div
                  className="hidden sm:block text-[10px] font-semibold tracking-[0.12em] uppercase w-20 flex-shrink-0"
                  style={{
                    color: accent,
                    opacity: 0.55,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {f.tag}
                </div>

                {/* Title */}
                <div className="flex-shrink-0 w-36 hidden md:block">
                  <span className="text-[13.5px] font-medium text-zinc-200 tracking-tight">
                    {f.title}
                  </span>
                </div>

                {/* Description */}
                <p className="text-zinc-500 text-[13px] leading-relaxed font-light flex-1">
                  {f.desc}
                </p>

                {/* Arrow */}
                <ArrowRight
                  size={13}
                  className="flex-shrink-0 text-zinc-700 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5"
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}