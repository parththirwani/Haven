"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TopBar } from "@/src/components/layout/TopBar";
import { EmptyState, ItemSkeleton } from "@/src/components/dashboard/ItemSkeleton";
import { Link2, ExternalLink, Trash2, X, Lock, Globe, Pencil } from "lucide-react";
import { api } from "@/src/trpc/react";
import { useVault } from "@/src/stores/useVault";
import { encryptData, decryptData } from "@/src/utils/crypto";
import type { EncryptedPayload } from "@/src/types/crypto.types";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/src/server/trpc/routers";

type RouterOutput = inferRouterOutputs<AppRouter>;
type VaultItem = RouterOutput["vault"]["listItems"]["items"][number];

interface DecryptedLink {
  id: string;
  title: string;
  url: string;
  description: string;
  faviconUrl: string | null;
  siteName: string | null;
}

function parseEncrypted(str: string): EncryptedPayload {
  return JSON.parse(str) as EncryptedPayload;
}

export default function LinksPage() {
  const { masterKey, isUnlocked } = useVault();
  const [showNew, setShowNew]   = useState(false);
  const [editing, setEditing]   = useState<{ item: VaultItem; dec: DecryptedLink } | null>(null);
  const [decrypted, setDecrypted] = useState<Record<string, DecryptedLink>>({});

  const utils = api.useUtils();

  const { data, isLoading } = api.vault.listItems.useQuery(
    { type: "LINK", limit: 50 },
    { enabled: isUnlocked }
  );

  useEffect(() => {
    if (!data || !masterKey) return;
    let cancelled = false;

    async function decryptAll() {
      if (!masterKey) return;
      const map: Record<string, DecryptedLink> = {};
      await Promise.all(
        (data?.items ?? []).map(async (item: VaultItem) => {
          try {
            const title = await decryptData(masterKey, parseEncrypted(item.titleEnc));
            const url = item.link?.urlEnc
              ? await decryptData(masterKey, parseEncrypted(item.link.urlEnc))
              : "";
            const description = item.link?.descriptionEnc
              ? await decryptData(masterKey, parseEncrypted(item.link.descriptionEnc))
              : "";
            map[item.id] = {
              id: item.id, title, url, description,
              faviconUrl: item.link?.faviconUrl ?? null,
              siteName:   item.link?.siteName   ?? null,
            };
          } catch {
            map[item.id] = { id: item.id, title: "⚠ Decryption failed", url: "", description: "", faviconUrl: null, siteName: null };
          }
        })
      );
      if (!cancelled) setDecrypted(map);
    }

    decryptAll();
    return () => { cancelled = true; };
  }, [data, masterKey]);

  const softDelete = api.vault.softDeleteItem.useMutation({
    onSuccess: () => utils.vault.listItems.invalidate(),
  });

  const items = data?.items ?? [];

  if (!isUnlocked) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Links" />
        <div className="flex-1 flex items-center justify-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center px-6">
            <div className="w-12 h-12 rounded-xl bg-blue-500/8 border border-blue-500/15 flex items-center justify-center mx-auto mb-5">
              <Lock size={18} className="text-blue-400" />
            </div>
            <h3 className="text-sm font-medium text-zinc-300 mb-2">Vault locked</h3>
            <p className="text-xs text-zinc-600 max-w-xs">Unlock your vault to access encrypted links.</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Links" onNewItem={() => setShowNew(true)} newItemLabel="Save link" />
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <ItemSkeleton count={5} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Link2 size={20} />}
            title="No links saved"
            desc="Save URLs with encrypted annotations. Your reading history stays private."
            action={
              <button onClick={() => setShowNew(true)} className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-medium transition-colors">
                Save link
              </button>
            }
          />
        ) : (
          <div className="p-4 space-y-2">
            {items.map((item, i) => {
              const dec = decrypted[item.id];
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="group flex items-center gap-3 p-3.5 rounded-lg border border-white/5 hover:border-white/10 hover:bg-white/2 transition-all cursor-pointer"
                  onClick={() => dec && setEditing({ item, dec })}>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/8 flex items-center justify-center shrink-0">
                    {dec?.faviconUrl ? (
                      <img src={dec.faviconUrl} className="w-4 h-4 rounded" alt=""
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <Link2 size={13} className="text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-200 text-sm truncate">
                      {dec?.title
                        ? dec.title
                        : <span className="skeleton h-3 w-28 inline-block rounded align-middle" />}
                    </p>
                    {dec?.description && <p className="text-xs text-zinc-600 truncate mt-0.5">{dec.description}</p>}
                    {dec?.url && <p className="text-[10px] text-zinc-700 truncate mt-0.5 font-mono">{dec.url}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); dec && setEditing({ item, dec }); }}
                      className="w-6 h-6 rounded flex items-center justify-center text-zinc-600 hover:text-indigo-400 hover:bg-indigo-500/8 transition-all">
                      <Pencil size={11} />
                    </button>
                    {dec?.url && (
                      <a href={dec.url} target="_blank" rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-6 h-6 rounded flex items-center justify-center text-zinc-600 hover:text-blue-400 hover:bg-blue-500/8 transition-all">
                        <ExternalLink size={11} />
                      </a>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); softDelete.mutate({ id: item.id }); }}
                      className="w-6 h-6 rounded flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-500/8 transition-all">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showNew && (
          <LinkModal masterKey={masterKey!} onClose={() => setShowNew(false)}
            onSaved={() => { setShowNew(false); utils.vault.listItems.invalidate(); }} />
        )}
        {editing && (
          <LinkModal masterKey={masterKey!} existing={editing}
            onClose={() => setEditing(null)}
            onSaved={() => { setEditing(null); utils.vault.listItems.invalidate(); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

function LinkModal({
  masterKey, existing, onClose, onSaved,
}: {
  masterKey: CryptoKey;
  existing?: { item: VaultItem; dec: DecryptedLink };
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!existing;
  const [title, setTitle]           = useState(existing?.dec.title       ?? "");
  const [url, setUrl]               = useState(existing?.dec.url         ?? "");
  const [description, setDescription] = useState(existing?.dec.description ?? "");
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const createItem = api.vault.createItem.useMutation();
  const updateItem = api.vault.updateItem.useMutation();

  const handleSave = async () => {
    if (!title.trim() || !url.trim()) return;
    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        const [encTitle, encUrl, encDesc] = await Promise.all([
          encryptData(masterKey, title),
          encryptData(masterKey, url),
          description ? encryptData(masterKey, description) : null,
        ]);
        await updateItem.mutateAsync({
          id:          existing!.item.id,
          type:        "LINK" as const,
          title:       JSON.stringify(encTitle),
          url:         JSON.stringify(encUrl),
          ...(encDesc ? { description: JSON.stringify(encDesc) } : { description: "" }),
        });
      } else {
        const [encTitle, encUrl, encDesc] = await Promise.all([
          encryptData(masterKey, title),
          encryptData(masterKey, url),
          description ? encryptData(masterKey, description) : null,
        ]);
        await createItem.mutateAsync({
          type:  "LINK",
          title: JSON.stringify(encTitle),
          url:   JSON.stringify(encUrl),
          ...(encDesc && { description: JSON.stringify(encDesc) }),
        });
      }
      onSaved();
    } catch {
      setError("Failed to save link. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6" onClick={onClose}>
      <motion.div initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 16 }}
        className="w-full max-w-md bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-white/6 flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-200">{isEdit ? "Edit link" : "Save link"}</h2>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded text-zinc-600 hover:text-zinc-400 hover:bg-white/5 transition-all"><X size={13} /></button>
        </div>
        <div className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Title</label>
            <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Interesting article"
              className="w-full px-3 py-2 rounded-lg bg-white/3 border border-white/8 text-zinc-200 placeholder-zinc-600 text-sm outline-none focus:border-indigo-500/40 transition-all" />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1.5 flex items-center gap-1"><Globe size={10} /> URL</label>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com"
              className="w-full px-3 py-2 rounded-lg bg-white/3 border border-white/8 text-zinc-200 placeholder-zinc-600 text-sm outline-none focus:border-indigo-500/40 transition-all font-mono" />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Description <span className="text-zinc-700">optional</span></label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Notes about this link…" rows={3}
              className="w-full px-3 py-2 rounded-lg bg-white/3 border border-white/8 text-zinc-200 placeholder-zinc-600 text-sm outline-none focus:border-indigo-500/40 transition-all resize-none" />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
        <div className="px-5 py-4 border-t border-white/6 flex items-center justify-between">
          <span className="text-[10px] text-zinc-700 flex items-center gap-1"><Lock size={9} /> AES-256-GCM</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving || !title.trim() || !url.trim()}
              className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 text-white text-xs font-medium transition-colors flex items-center gap-1.5">
              {saving ? <><div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />Encrypting…</> : isEdit ? "Save changes" : "Save encrypted"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}