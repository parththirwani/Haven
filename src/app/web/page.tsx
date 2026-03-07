"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, Link2, BookOpen, KeyRound, Paperclip, GitBranch, ArrowRight, Shield, Lock } from "lucide-react";
import { api } from "@/src/trpc/react";
import { useVault } from "@/src/stores/useVault";

type ItemType = "NOTE" | "LINK" | "RESOURCE" | "PASSWORD";

const sections: Array<{
  href: string;
  icon: React.ElementType;
  label: string;
  desc: string;
  color: string;
  bg: string;
  type: ItemType | null;
}> = [
  { href: "/web/notes", icon: FileText, label: "Notes", desc: "Your encrypted thoughts", color: "text-indigo-400", bg: "bg-indigo-500/8", type: "NOTE" },
  { href: "/web/links", icon: Link2, label: "Links", desc: "Saved URLs & annotations", color: "text-blue-400", bg: "bg-blue-500/8", type: "LINK" },
  { href: "/web/resources", icon: BookOpen, label: "Resources", desc: "Research & references", color: "text-violet-400", bg: "bg-violet-500/8", type: "RESOURCE" },
  { href: "/web/passwords", icon: KeyRound, label: "Passwords", desc: "Encrypted credentials", color: "text-amber-400", bg: "bg-amber-500/8", type: "PASSWORD" },
  { href: "/web/files", icon: Paperclip, label: "Files", desc: "Attached documents", color: "text-emerald-400", bg: "bg-emerald-500/8", type: null },
  { href: "/web/graph", icon: GitBranch, label: "Graph", desc: "Knowledge connections", color: "text-pink-400", bg: "bg-pink-500/8", type: null },
];

export default function AppDashboard() {
  const { isUnlocked } = useVault();

  const { data: notes } = api.vault.listItems.useQuery({ type: "NOTE", limit: 1 }, { enabled: isUnlocked });
  const { data: links } = api.vault.listItems.useQuery({ type: "LINK", limit: 1 }, { enabled: isUnlocked });
  const { data: resources } = api.vault.listItems.useQuery({ type: "RESOURCE", limit: 1 }, { enabled: isUnlocked });
  const { data: passwords } = api.vault.listItems.useQuery({ type: "PASSWORD", limit: 1 }, { enabled: isUnlocked });

  const counts: Record<ItemType, number | undefined> = {
    NOTE: notes?.total,
    LINK: links?.total,
    RESOURCE: resources?.total,
    PASSWORD: passwords?.total,
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-8 py-10 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-2 mb-1">
            {isUnlocked ? (
              <><Shield size={13} className="text-emerald-400" /><span className="text-xs text-emerald-400">Vault encrypted & unlocked</span></>
            ) : (
              <><Lock size={13} className="text-zinc-600" /><span className="text-xs text-zinc-600">Vault locked</span></>
            )}
          </div>
          <h1 className="text-2xl font-light text-white mt-3 mb-1">Your vault</h1>
          <p className="text-sm text-zinc-500 mb-8">All data is end-to-end encrypted. Only you can read it.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sections.map((section, i) => {
            const count = section.type ? counts[section.type] : undefined;
            return (
              <motion.div key={section.href} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.07 }}>
                <Link href={section.href}
                  className="group flex flex-col p-5 rounded-xl border border-white/6 bg-white/2 hover:border-white/10 hover:bg-white/4 transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-9 h-9 rounded-lg ${section.bg} flex items-center justify-center`}>
                      <section.icon size={15} className={section.color} />
                    </div>
                    {isUnlocked && count !== undefined && (
                      <span className="text-xs text-zinc-600 tabular-nums">{count}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-zinc-200">{section.label}</h3>
                      <p className="text-xs text-zinc-600 mt-0.5">{section.desc}</p>
                    </div>
                    <ArrowRight size={13} className="text-zinc-700 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}