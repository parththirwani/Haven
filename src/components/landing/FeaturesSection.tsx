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

const accentMap: Record<string, { text: string; bg: string }> = {
  indigo: { text: "text-indigo-400", bg: "bg-indigo-500/8" },
  blue: { text: "text-blue-400", bg: "bg-blue-500/8" },
  violet: { text: "text-violet-400", bg: "bg-violet-500/8" },
  amber: { text: "text-amber-400", bg: "bg-amber-500/8" },
  emerald: { text: "text-emerald-400", bg: "bg-emerald-500/8" },
  pink: { text: "text-pink-400", bg: "bg-pink-500/8" },
  rose: { text: "text-rose-400", bg: "bg-rose-500/8" },
  teal: { text: "text-teal-400", bg: "bg-teal-500/8" },
};

export function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 px-6 border-t border-white/6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <p className="text-xs font-medium tracking-widest text-indigo-400 uppercase mb-4">
            Features
          </p>
          <h2 className="text-3xl font-light tracking-tight text-white max-w-sm">
            Everything in one encrypted vault
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {features.map((feature, i) => {
            const ac = accentMap[feature.accent];
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                whileHover={{ y: -2 }}
                className="p-5 rounded-xl border border-white/5 bg-white/1.5 hover:border-white/10 hover:bg-white/3 transition-all duration-200 cursor-default"
              >
                <div
                  className={`w-8 h-8 rounded-lg ${ac.bg} flex items-center justify-center mb-3`}
                >
                  <feature.icon size={14} className={ac.text} />
                </div>
                <h3 className="text-sm font-medium text-zinc-200 mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
