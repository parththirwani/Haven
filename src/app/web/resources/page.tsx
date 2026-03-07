"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TopBar } from "@/src/components/layout/TopBar";
import { EmptyState, ItemSkeleton } from "@/src/components/dashboard/ItemSkeleton";
import { BookOpen, Trash2, X, Lock, ExternalLink, FileText, Video, Headphones, Newspaper, Pencil } from "lucide-react";
import { api } from "@/src/trpc/react";
import { useVault } from "@/src/stores/useVault";
import { encryptData, decryptData } from "@/src/utils/crypto";
import type { EncryptedPayload } from "@/src/types/crypto.types";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/src/server/trpc/routers";

type RouterOutput = inferRouterOutputs<AppRouter>;
type VaultItem = RouterOutput["vault"]["listItems"]["items"][number];
type ResourceType = "ARTICLE" | "PAPER" | "BOOK" | "VIDEO" | "PODCAST" | "OTHER";

interface DecryptedResource {
  id: string;
  title: string;
  content: string;
  sourceUrl: string;
  author: string;
  resourceType: ResourceType;
}

function parseEncrypted(str: string): EncryptedPayload {
  return JSON.parse(str) as EncryptedPayload;
}

const TYPE_ICONS: Record<ResourceType, React.ElementType> = {
  ARTICLE: Newspaper, PAPER: FileText, BOOK: BookOpen, VIDEO: Video, PODCAST: Headphones, OTHER: BookOpen,
};
const TYPE_COLORS: Record<ResourceType, { text: string; bg: string }> = {
  ARTICLE: { text: "text-violet-400",  bg: "bg-violet-500/8"  },
  PAPER:   { text: "text-blue-400",    bg: "bg-blue-500/8"    },
  BOOK:    { text: "text-emerald-400", bg: "bg-emerald-500/8" },
  VIDEO:   { text: "text-red-400",     bg: "bg-red-500/8"     },
  PODCAST: { text: "text-amber-400",   bg: "bg-amber-500/8"   },
  OTHER:   { text: "text-zinc-400",    bg: "bg-zinc-500/8"    },
};
const RESOURCE_TYPES: ResourceType[] = ["ARTICLE", "PAPER", "BOOK", "VIDEO", "PODCAST", "OTHER"];

export default function ResourcesPage() {
  const { masterKey, isUnlocked } = useVault();
  const [showNew, setShowNew]     = useState(false);
  const [editing, setEditing]     = useState<{ item: VaultItem; dec: DecryptedResource } | null>(null);
  const [decrypted, setDecrypted] = useState<Record<string, DecryptedResource>>({});
  const [filterType, setFilterType] = useState<ResourceType | null>(null);

  const utils = api.useUtils();

  const { data, isLoading } = api.vault.listItems.useQuery(
    { type: "RESOURCE", limit: 50 },
    { enabled: isUnlocked }
  );

  useEffect(() => {
    if (!data || !masterKey) return;
    let cancelled = false;

    async function decryptAll() {
      if (!masterKey) return;
      const map: Record<string, DecryptedResource> = {};
      await Promise.all(
        (data?.items ?? []).map(async (item: VaultItem) => {
          try {
            const res = item.resource;
            const [title, content, sourceUrl, author] = await Promise.all([
              decryptData(masterKey, parseEncrypted(item.titleEnc)),
              res?.contentEnc   ? decryptData(masterKey, parseEncrypted(res.contentEnc))   : Promise.resolve(""),
              res?.sourceUrlEnc ? decryptData(masterKey, parseEncrypted(res.sourceUrlEnc)) : Promise.resolve(""),
              res?.authorEnc    ? decryptData(masterKey, parseEncrypted(res.authorEnc))    : Promise.resolve(""),
            ]);
            map[item.id] = {
              id: item.id, title, content, sourceUrl, author,
              resourceType: (res?.resourceType ?? "ARTICLE") as ResourceType,
            };
          } catch {
            map[item.id] = { id: item.id, title: "⚠ Decryption failed", content: "", sourceUrl: "", author: "", resourceType: "ARTICLE" };
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
  const filtered = filterType
    ? items.filter(i => decrypted[i.id]?.resourceType === filterType)
    : items;

  const typeCounts = RESOURCE_TYPES.reduce((acc, t) => {
    acc[t] = items.filter(i => decrypted[i.id]?.resourceType === t).length;
    return acc;
  }, {} as Record<ResourceType, number>);

  if (!isUnlocked) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Resources" />
        <div className="flex-1 flex items-center justify-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center px-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/8 border border-emerald-500/15 flex items-center justify-center mx-auto mb-5">
              <Lock size={18} className="text-emerald-400" />
            </div>
            <h3 className="text-sm font-medium text-zinc-300 mb-2">Vault locked</h3>
            <p className="text-xs text-zinc-600 max-w-xs">Unlock your vault to access encrypted resources.</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Resources" onNewItem={() => setShowNew(true)} newItemLabel="Add resource" />

      {/* Type filter tabs */}
      {items.length > 0 && (
        <div className="px-4 py-2 flex gap-1.5 overflow-x-auto scrollbar-none border-b border-white/4">
          <button onClick={() => setFilterType(null)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 transition-colors ${!filterType ? "bg-white/8 text-zinc-200" : "text-zinc-600 hover:text-zinc-400"}`}>
            All <span className="ml-1 text-zinc-700">{items.length}</span>
          </button>
          {RESOURCE_TYPES.filter(t => typeCounts[t] > 0).map(t => {
            const Icon = TYPE_ICONS[t];
            const col  = TYPE_COLORS[t];
            return (
              <button key={t} onClick={() => setFilterType(filterType === t ? null : t)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 flex items-center gap-1 transition-colors ${filterType === t ? `${col.bg} ${col.text}` : "text-zinc-600 hover:text-zinc-400"}`}>
                <Icon size={10} />{t.charAt(0) + t.slice(1).toLowerCase()}
                <span className="text-zinc-700 ml-0.5">{typeCounts[t]}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <ItemSkeleton count={5} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={20} />}
            title="No resources saved"
            desc="Collect articles, papers, books, and more — all encrypted."
            action={
              <button onClick={() => setShowNew(true)} className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-medium transition-colors">
                Add resource
              </button>
            }
          />
        ) : (
          <div className="p-4 space-y-2">
            {filtered.map((item, i) => {
              const dec = decrypted[item.id];
              const type = dec?.resourceType ?? "ARTICLE";
              const Icon = TYPE_ICONS[type];
              const col  = TYPE_COLORS[type];
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="group flex items-start gap-3 p-3.5 rounded-lg border border-white/5 hover:border-white/10 hover:bg-white/2 transition-all cursor-pointer"
                  onClick={() => dec && setEditing({ item, dec })}>
                  <div className={`w-8 h-8 rounded-lg ${col.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon size={13} className={col.text} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-zinc-200 text-sm truncate">
                        {dec?.title
                          ? dec.title
                          : <span className="skeleton h-3 w-28 inline-block rounded align-middle" />}
                      </p>
                      <span className={`text-[10px] ${col.text} shrink-0`}>{type.charAt(0) + type.slice(1).toLowerCase()}</span>
                    </div>
                    {dec?.author    && <p className="text-xs text-zinc-600 truncate mt-0.5">by {dec.author}</p>}
                    {dec?.content   && <p className="text-xs text-zinc-700 truncate mt-0.5">{dec.content}</p>}
                    {dec?.sourceUrl && <p className="text-[10px] text-zinc-700 truncate mt-0.5 font-mono">{dec.sourceUrl}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); dec && setEditing({ item, dec }); }}
                      className="w-6 h-6 rounded flex items-center justify-center text-zinc-600 hover:text-indigo-400 hover:bg-indigo-500/8 transition-all">
                      <Pencil size={11} />
                    </button>
                    {dec?.sourceUrl && (
                      <a href={dec.sourceUrl} target="_blank" rel="noopener noreferrer"
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
          <ResourceModal masterKey={masterKey!} onClose={() => setShowNew(false)}
            onSaved={() => { setShowNew(false); utils.vault.listItems.invalidate(); }} />
        )}
        {editing && (
          <ResourceModal masterKey={masterKey!} existing={editing}
            onClose={() => setEditing(null)}
            onSaved={() => { setEditing(null); utils.vault.listItems.invalidate(); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

function ResourceModal({
  masterKey, existing, onClose, onSaved,
}: {
  masterKey: CryptoKey;
  existing?: { item: VaultItem; dec: DecryptedResource };
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!existing;
  const [title,        setTitle]        = useState(existing?.dec.title        ?? "");
  const [content,      setContent]      = useState(existing?.dec.content      ?? "");
  const [sourceUrl,    setSourceUrl]    = useState(existing?.dec.sourceUrl    ?? "");
  const [author,       setAuthor]       = useState(existing?.dec.author       ?? "");
  const [resourceType, setResourceType] = useState<ResourceType>(existing?.dec.resourceType ?? "ARTICLE");
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  const createItem = api.vault.createItem.useMutation();
  const updateItem = api.vault.updateItem.useMutation();

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const [encTitle, encContent, encSourceUrl, encAuthor] = await Promise.all([
        encryptData(masterKey, title),
        content   ? encryptData(masterKey, content)   : null,
        sourceUrl ? encryptData(masterKey, sourceUrl) : null,
        author    ? encryptData(masterKey, author)    : null,
      ]);

      if (isEdit) {
        await updateItem.mutateAsync({
          id:           existing!.item.id,
          type:         "RESOURCE" as const,
          title:        JSON.stringify(encTitle),
          resourceType,
          ...(encContent   ? { content:   JSON.stringify(encContent) }   : { content: "" }),
          ...(encSourceUrl ? { sourceUrl: JSON.stringify(encSourceUrl) } : { sourceUrl: "" }),
          ...(encAuthor    ? { author:    JSON.stringify(encAuthor) }    : { author: "" }),
        });
      } else {
        await createItem.mutateAsync({
          type:         "RESOURCE",
          title:        JSON.stringify(encTitle),
          resourceType,
          ...(encContent   && { content:   JSON.stringify(encContent) }),
          ...(encSourceUrl && { sourceUrl: JSON.stringify(encSourceUrl) }),
          ...(encAuthor    && { author:    JSON.stringify(encAuthor) }),
        });
      }
      onSaved();
    } catch {
      setError("Failed to save resource. Please try again.");
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
          <h2 className="text-sm font-medium text-zinc-200">{isEdit ? "Edit resource" : "Add resource"}</h2>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded text-zinc-600 hover:text-zinc-400 hover:bg-white/5 transition-all"><X size={13} /></button>
        </div>
        <div className="p-5 space-y-3.5 max-h-[60vh] overflow-y-auto">
          {/* Type selector */}
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Type</label>
            <div className="flex flex-wrap gap-1.5">
              {RESOURCE_TYPES.map(t => {
                const Icon = TYPE_ICONS[t];
                const col  = TYPE_COLORS[t];
                return (
                  <button key={t} onClick={() => setResourceType(t)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${resourceType === t ? `${col.bg} ${col.text} border border-current/20` : "bg-white/3 text-zinc-600 border border-white/5 hover:text-zinc-400"}`}>
                    <Icon size={10} />{t.charAt(0) + t.slice(1).toLowerCase()}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Title</label>
            <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Resource title"
              className="w-full px-3 py-2 rounded-lg bg-white/3 border border-white/8 text-zinc-200 placeholder-zinc-600 text-sm outline-none focus:border-indigo-500/40 transition-all" />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Author <span className="text-zinc-700">optional</span></label>
            <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author name"
              className="w-full px-3 py-2 rounded-lg bg-white/3 border border-white/8 text-zinc-200 placeholder-zinc-600 text-sm outline-none focus:border-indigo-500/40 transition-all" />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Source URL <span className="text-zinc-700">optional</span></label>
            <input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://example.com/article"
              className="w-full px-3 py-2 rounded-lg bg-white/3 border border-white/8 text-zinc-200 placeholder-zinc-600 text-sm outline-none focus:border-indigo-500/40 transition-all font-mono" />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Notes <span className="text-zinc-700">optional</span></label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Summary, key takeaways, thoughts…" rows={4}
              className="w-full px-3 py-2 rounded-lg bg-white/3 border border-white/8 text-zinc-200 placeholder-zinc-600 text-sm outline-none focus:border-indigo-500/40 transition-all resize-none" />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
        <div className="px-5 py-4 border-t border-white/6 flex items-center justify-between">
          <span className="text-[10px] text-zinc-700 flex items-center gap-1"><Lock size={9} /> AES-256-GCM</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving || !title.trim()}
              className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 text-white text-xs font-medium transition-colors flex items-center gap-1.5">
              {saving ? <><div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />Encrypting…</> : isEdit ? "Save changes" : "Save encrypted"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}