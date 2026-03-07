"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TopBar } from "@/src/components/layout/TopBar";
import { EmptyState, ItemSkeleton } from "@/src/components/dashboard/ItemSkeleton";
import { Trash2, RotateCcw, FileText, Link2, BookOpen, KeyRound, AlertTriangle, Lock } from "lucide-react";
import { api } from "@/src/trpc/react";
import { useVault } from "@/src/stores/useVault";
import { decryptData } from "@/src/utils/crypto";
import type { EncryptedPayload } from "@/src/types/crypto.types";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/src/server/trpc/routers";

type RouterOutput = inferRouterOutputs<AppRouter>;
type VaultItem = RouterOutput["vault"]["listItems"]["items"][number];

function parseEncrypted(str: string): EncryptedPayload {
  return JSON.parse(str) as EncryptedPayload;
}

const TYPE_ICONS = {
  NOTE: { icon: FileText, color: "text-indigo-400", bg: "bg-indigo-500/8" },
  LINK: { icon: Link2, color: "text-blue-400", bg: "bg-blue-500/8" },
  RESOURCE: { icon: BookOpen, color: "text-violet-400", bg: "bg-violet-500/8" },
  PASSWORD: { icon: KeyRound, color: "text-amber-400", bg: "bg-amber-500/8" },
} as const;

export default function TrashPage() {
  const { masterKey, isUnlocked } = useVault();
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const utils = api.useUtils();

  const { data, isLoading } = api.vault.listItems.useQuery(
    { includeDeleted: true, limit: 100 },
    { enabled: isUnlocked }
  );

  useEffect(() => {
    if (!data || !masterKey) return;
    let cancelled = false;

    async function decryptTitles() {
      if (!masterKey) return;
      const deletedItems = (data?.items ?? []).filter((i: VaultItem) => i.deletedAt !== null);
      const map: Record<string, string> = {};
      await Promise.all(
        deletedItems.map(async (item: VaultItem) => {
          try {
            map[item.id] = await decryptData(masterKey, parseEncrypted(item.titleEnc));
          } catch {
            map[item.id] = "⚠ Decryption failed";
          }
        })
      );
      if (!cancelled) setTitles(map);
    }

    decryptTitles();
    return () => { cancelled = true; };
  }, [data, masterKey]);

  const restoreItem = api.vault.restoreItem.useMutation({
    onSuccess: () => utils.vault.listItems.invalidate(),
  });

  const hardDelete = api.vault.hardDeleteItem.useMutation({
    onSuccess: () => {
      setConfirmDelete(null);
      utils.vault.listItems.invalidate();
    },
  });

  const deletedItems = (data?.items ?? []).filter((i: VaultItem) => i.deletedAt !== null);

  if (!isUnlocked) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Trash" />
        <div className="flex-1 flex items-center justify-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center px-6">
            <div className="w-12 h-12 rounded-xl bg-zinc-500/8 border border-zinc-500/15 flex items-center justify-center mx-auto mb-5">
              <Lock size={18} className="text-zinc-400" />
            </div>
            <h3 className="text-sm font-medium text-zinc-300 mb-2">Vault locked</h3>
            <p className="text-xs text-zinc-600 max-w-xs">Unlock your vault to view trash.</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Trash" />
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <ItemSkeleton count={4} />
        ) : deletedItems.length === 0 ? (
          <EmptyState
            icon={<Trash2 size={20} />}
            title="Trash is empty"
            desc="Deleted items appear here. They're permanently deleted after 30 days."
          />
        ) : (
          <>
            <div className="mx-4 mt-4 px-3.5 py-2.5 rounded-lg bg-amber-500/5 border border-amber-500/15 flex items-start gap-2">
              <AlertTriangle size={12} className="text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-zinc-500 leading-relaxed">
                Items will be permanently deleted after 30 days. You can restore or delete them now.
              </p>
            </div>
            <div className="p-4 space-y-2">
              {deletedItems.map((item: VaultItem, i: number) => {
                const typeInfo = TYPE_ICONS[item.type] ?? TYPE_ICONS.NOTE;
                const Icon = typeInfo.icon;
                const deletedDaysAgo = item.deletedAt
                  ? Math.floor((Date.now() - new Date(item.deletedAt).getTime()) / (1000 * 60 * 60 * 24))
                  : 0;
                const daysLeft = Math.max(0, 30 - deletedDaysAgo);

                return (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="group flex items-center gap-3 p-3.5 rounded-lg border border-white/5 hover:border-white/8 transition-all">
                    <div className={`w-8 h-8 rounded-lg ${typeInfo.bg} flex items-center justify-center shrink-0 opacity-50`}>
                      <Icon size={13} className={typeInfo.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-400 text-sm truncate">
                        {titles[item.id]
                          ? titles[item.id]
                          : <span className="skeleton h-3 w-28 inline-block rounded align-middle" />}
                      </p>
                      <p className="text-[10px] text-zinc-700 mt-0.5">
                        {item.type.toLowerCase()} · deleted {deletedDaysAgo}d ago · {daysLeft}d left
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => restoreItem.mutate({ id: item.id })} disabled={restoreItem.isPending}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-zinc-400 border border-white/8 hover:border-white/15 hover:text-zinc-200 transition-all">
                        <RotateCcw size={10} /> Restore
                      </button>
                      <button onClick={() => setConfirmDelete(item.id)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-zinc-600 border border-white/6 hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/5 transition-all">
                        <Trash2 size={10} /> Delete
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
          <motion.div initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }}
            className="w-full max-w-sm bg-[#111] border border-white/10 rounded-xl p-6 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
              <Trash2 size={16} className="text-red-400" />
            </div>
            <h3 className="text-sm font-medium text-zinc-200 mb-2">Permanently delete?</h3>
            <p className="text-xs text-zinc-500 mb-5 leading-relaxed">This action cannot be undone. The encrypted data will be permanently removed.</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 rounded-lg border border-white/8 text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
                Cancel
              </button>
              <button onClick={() => hardDelete.mutate({ id: confirmDelete })} disabled={hardDelete.isPending}
                className="flex-1 py-2 rounded-lg bg-red-500/15 border border-red-500/30 text-xs text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1.5">
                {hardDelete.isPending
                  ? <div className="w-3 h-3 border border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                  : <><Trash2 size={11} /> Delete forever</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}