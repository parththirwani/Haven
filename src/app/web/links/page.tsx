"use client";

import { motion } from "framer-motion";
import { TopBar } from "@/src/components/layout/TopBar";
import { EmptyState, ItemSkeleton } from "@/src/components/dashboard/ItemSkeleton";
import { Link2, ExternalLink } from "lucide-react";

export default function LinksPage() {
  const isLoading = false;
  const items: { id: string; titleEnc: string; createdAt: string }[] = [];

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Links" onNewItem={() => {}} newItemLabel="Save link" />
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <ItemSkeleton count={5} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Link2 size={20} />}
            title="No links saved"
            desc="Save URLs with encrypted annotations. Your reading history stays private."
            action={
              <button className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-medium transition-colors">
                Save link
              </button>
            }
          />
        ) : (
          <div className="p-4 space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3.5 rounded-lg border border-white/5 hover:border-white/10 hover:bg-white/2 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/8 flex items-center justify-center shrink-0">
                  <Link2 size={13} className="text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-300 truncate font-mono text-xs">
                    {item.titleEnc}
                  </p>
                </div>
                <ExternalLink size={12} className="text-zinc-700 group-hover:text-zinc-500 transition-colors" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
