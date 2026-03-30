"use client";
import { motion, useInView } from "framer-motion";
import { memo, useRef } from "react";
import {
  FileText,
  Link2,
  BookOpen,
  KeyRound,
  Paperclip,
  GitBranch,
  ClipboardList,
  Shield,
  type LucideIcon,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Static data — defined once at module level, never recreated
// ---------------------------------------------------------------------------

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
  accent: string;
}

const FEATURES: Feature[] = [
  { icon: FileText,      title: "Encrypted Notes",  desc: "Markdown editor with full encryption. Your thoughts, your eyes only.", accent: "indigo"  },
  { icon: Link2,         title: "Private Links",     desc: "Save and annotate links with metadata you control.",                   accent: "blue"    },
  { icon: BookOpen,      title: "Resources",         desc: "Organize research, articles, and references in one place.",            accent: "violet"  },
  { icon: KeyRound,      title: "Password Vault",    desc: "Store credentials with AES-256-GCM. Never plaintext, ever.",           accent: "amber"   },
  { icon: Paperclip,     title: "File Attachments",  desc: "Attach and encrypt files to any item in your vault.",                  accent: "emerald" },
  { icon: GitBranch,     title: "Knowledge Graph",   desc: "Visualize connections between your notes and ideas.",                  accent: "pink"    },
  { icon: ClipboardList, title: "Audit Log",         desc: "Tamper-evident log of every access. You own the trail.",               accent: "rose"    },
  { icon: Shield,        title: "Zero Knowledge",    desc: "We're mathematically incapable of reading your data.",                 accent: "teal"    },
];

interface AccentTokens {
  text: string;
  gradFrom: string;
  gradTo: string;
  glowRgb: string;
  borderRgba: string;
}

const ACCENT_MAP: Record<string, AccentTokens> = {
  indigo:  { text: "text-indigo-300",  gradFrom: "from-indigo-500/20",  gradTo: "to-indigo-500/5",  glowRgb: "99,102,241",  borderRgba: "rgba(99,102,241,0.25)"  },
  blue:    { text: "text-blue-300",    gradFrom: "from-blue-500/20",    gradTo: "to-blue-500/5",    glowRgb: "59,130,246",  borderRgba: "rgba(59,130,246,0.25)"  },
  violet:  { text: "text-violet-300",  gradFrom: "from-violet-500/20",  gradTo: "to-violet-500/5",  glowRgb: "139,92,246",  borderRgba: "rgba(139,92,246,0.25)"  },
  amber:   { text: "text-amber-300",   gradFrom: "from-amber-500/20",   gradTo: "to-amber-500/5",   glowRgb: "245,158,11",  borderRgba: "rgba(245,158,11,0.25)"  },
  emerald: { text: "text-emerald-300", gradFrom: "from-emerald-500/20", gradTo: "to-emerald-500/5", glowRgb: "16,185,129",  borderRgba: "rgba(16,185,129,0.25)"  },
  pink:    { text: "text-pink-300",    gradFrom: "from-pink-500/20",    gradTo: "to-pink-500/5",    glowRgb: "236,72,153",  borderRgba: "rgba(236,72,153,0.25)"  },
  rose:    { text: "text-rose-300",    gradFrom: "from-rose-500/20",    gradTo: "to-rose-500/5",    glowRgb: "244,63,94",   borderRgba: "rgba(244,63,94,0.25)"   },
  teal:    { text: "text-teal-300",    gradFrom: "from-teal-500/20",    gradTo: "to-teal-500/5",    glowRgb: "20,184,166",  borderRgba: "rgba(20,184,166,0.25)"  },
};

// Framer variants — defined once at module level, shared by all card instances.
// Avoids creating new objects on every render.
const CARD_VARIANTS = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.065, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

const HEADER_VARIANTS = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

// Static style objects — module-level constants so React never sees new references.
const CARD_BASE_STYLE: React.CSSProperties = {
  background: "linear-gradient(135deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.01) 100%)",
  border: "1px solid rgba(255,255,255,0.07)",
  backdropFilter: "blur(12px)",
};

const SECTION_STYLE: React.CSSProperties = {
  borderTop: "1px solid rgba(255,255,255,0.06)",
};

const EYEBROW_LINE_STYLE: React.CSSProperties = {
  background: "rgba(99,102,241,0.7)",
};

// ---------------------------------------------------------------------------
// FeatureCard — memoized so it never re-renders after mount
// ---------------------------------------------------------------------------

interface FeatureCardProps {
  feature: Feature;
  index: number;
}

const FeatureCard = memo(function FeatureCard({ feature, index }: FeatureCardProps) {
  const ac = ACCENT_MAP[feature.accent];
  const Icon = feature.icon;

  // Overlay style is stable per-card (accent never changes), so safe to inline here.
  // Could be lifted to a per-accent constant map for even stricter purity.
  const overlayStyle: React.CSSProperties = {
    background: `radial-gradient(ellipse at 30% 20%, rgba(${ac.glowRgb},0.15) 0%, transparent 70%)`,
    // boxShadow replaces the second overlay div — one DOM node instead of two.
    // inset box-shadow renders on the GPU composite layer, same cost as border.
    boxShadow: `inset 0 0 0 1px ${ac.borderRgba}`,
  };

  return (
    // whileHover removed — hover lift handled via CSS (.feature-card:hover).
    // Eliminates a JS pointer-event listener per card (8 total saved).
    <motion.div
      custom={index}
      variants={CARD_VARIANTS}
      className="feature-card group relative p-5 rounded-2xl cursor-default overflow-hidden"
      style={CARD_BASE_STYLE}
    >
      {/* Single overlay: handles glow radial + accent border via opacity transition.
          Only `opacity` animates — compositor-only, zero layout/paint. */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400"
        style={overlayStyle}
      />

      <div
        className={`relative w-9 h-9 rounded-xl bg-linear-to-br ${ac.gradFrom} ${ac.gradTo} flex items-center justify-center mb-4 ring-1 ring-white/10`}
      >
        <Icon size={15} className={ac.text} strokeWidth={1.75} />
      </div>

      <h3 className="relative text-[13px] font-[490] text-zinc-100 tracking-[-0.01em] mb-1.5">
        {feature.title}
      </h3>
      <p className="relative text-[12px] text-zinc-500 leading-[1.65] font-light">
        {feature.desc}
      </p>
    </motion.div>
  );
});

// ---------------------------------------------------------------------------
// SectionHeader — memoized, no props, renders once
// ---------------------------------------------------------------------------

const SectionHeader = memo(function SectionHeader() {
  return (
    <motion.div variants={HEADER_VARIANTS} className="mb-16">
      <div className="flex items-center gap-2 mb-5">
        <span className="inline-block w-4 h-px" style={EYEBROW_LINE_STYLE} />
        <p className="text-[10px] font-semibold tracking-[0.18em] text-indigo-400 uppercase">
          Features
        </p>
      </div>
      <h2 className="text-[2rem] font-[320] tracking-[-0.03em] text-white leading-[1.2] max-w-xs">
        Everything in one
        <br />
        <span className="text-zinc-400">encrypted vault.</span>
      </h2>
    </motion.div>
  );
});

// ---------------------------------------------------------------------------
// FeaturesSection
// ---------------------------------------------------------------------------

export function FeaturesSection() {
  const ref = useRef<HTMLElement>(null);
  // once: true → IntersectionObserver disconnects after first trigger, no ongoing observations
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const animate = inView ? "visible" : "hidden";

  return (
    <>
      {/*
        CSS for card hover lift lives in a single <style> tag rather than
        Framer whileHover — one rule covers all 8 cards with zero JS overhead.
        will-change is applied only on hover to avoid permanently promoting
        every card to its own GPU layer.
      */}
      <style>{`
        .feature-card { transition: transform 0.2s ease-out; }
        .feature-card:hover { transform: translateY(-3px); will-change: transform; }
      `}</style>

      <section ref={ref} className="py-28 px-6" style={SECTION_STYLE}>
        <div className="max-w-5xl mx-auto">
          {/*
            Single motion.div with `animate` prop propagates state to all
            children via Framer's variant context — no prop drilling,
            no per-card useInView, no extra observers.
          */}
          <motion.div animate={animate} initial="hidden">
            <SectionHeader />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {FEATURES.map((feature, i) => (
                <FeatureCard key={feature.title} feature={feature} index={i} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}