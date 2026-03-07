"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TopBar } from "@/src/components/layout/TopBar";
import { EmptyState, ItemSkeleton } from "@/src/components/dashboard/ItemSkeleton";
import { FileText, Clock, Pin, PinOff, Trash2, X, Lock } from "lucide-react";
import { api } from "@/src/trpc/react";
import { useVault } from "@/src/stores/useVault";
import { encryptData, decryptData } from "@/src/utils/crypto";
import type { EncryptedPayload } from "@/src/types/crypto.types";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/src/server/trpc/routers";

type RouterOutput = inferRouterOutputs<AppRouter>;
type VaultItem = RouterOutput["vault"]["listItems"]["items"][number];

interface DecryptedNote {
  id: string;
  title: string;
  preview: string;
  isPinned: boolean;
  wordCount: number | null;
  updatedAt: Date;
}

function parseEncrypted(str: string): EncryptedPayload {
  return JSON.parse(str) as EncryptedPayload;
}

export default function NotesPage() {
  const { masterKey, isUnlocked } = useVault();
  const [showNew, setShowNew] = useState(false);
  const [decrypted, setDecrypted] = useState<Record<string, DecryptedNote>>({});

  const utils = api.useUtils();

  const { data, isLoading } = api.vault.listItems.useQuery(
    { type: "NOTE", limit: 50 },
    { enabled: isUnlocked }
  );

  useEffect(() => {
    if (!data || !masterKey) return;
    let cancelled = false;

    async function decryptAll() {
      if (!masterKey) return;
      const map: Record<string, DecryptedNote> = {};
      await Promise.all(
        (data?.items ?? []).map(async (item: VaultItem) => {
          try {
            const title = await decryptData(masterKey, parseEncrypted(item.titleEnc));
            const preview = item.note?.previewEnc
              ? await decryptData(masterKey, parseEncrypted(item.note.previewEnc))
              : item.note?.contentEnc
              ? (await decryptData(masterKey, parseEncrypted(item.note.contentEnc))).slice(0, 120)
              : "";
            map[item.id] = {
              id: item.id,
              title,
              preview,
              isPinned: item.note?.isPinned ?? false,
              wordCount: item.note?.wordCount ?? null,
              updatedAt: new Date(item.updatedAt),
            };
          } catch {
            map[item.id] = {
              id: item.id,
              title: "⚠ Decryption failed",
              preview: "",
              isPinned: false,
              wordCount: null,
              updatedAt: new Date(item.updatedAt),
            };
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
  const pinned = items.filter((i) => decrypted[i.id]?.isPinned);
  const unpinned = items.filter((i) => !decrypted[i.id]?.isPinned);

  if (!isUnlocked) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Notes" />
        <LockedState />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Notes" onNewItem={() => setShowNew(true)} newItemLabel="New note" />
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <ItemSkeleton count={6} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<FileText size={20} />}
            title="No notes yet"
            desc="Create your first encrypted note. It will be unreadable to anyone but you."
            action={
              <button onClick={() => setShowNew(true)} className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-medium transition-colors">
                Create note
              </button>
            }
          />
        ) : (
          <div className="p-4 space-y-4">
            {pinned.length > 0 && (
              <section>
                <p className="px-1 mb-2 text-[10px] font-medium tracking-widest text-zinc-600 uppercase flex items-center gap-1.5">
                  <Pin size={9} /> Pinned
                </p>
                <div className="space-y-2">
                  {pinned.map((item, i) => (
                    <NoteRow key={item.id} item={item} dec={decrypted[item.id]} index={i}
                      onDelete={() => softDelete.mutate({ id: item.id })}
                      onRefresh={() => utils.vault.listItems.invalidate()} />
                  ))}
                </div>
              </section>
            )}
            {unpinned.length > 0 && (
              <section>
                {pinned.length > 0 && <p className="px-1 mb-2 text-[10px] font-medium tracking-widest text-zinc-600 uppercase">All notes</p>}
                <div className="space-y-2">
                  {unpinned.map((item, i) => (
                    <NoteRow key={item.id} item={item} dec={decrypted[item.id]} index={i}
                      onDelete={() => softDelete.mutate({ id: item.id })}
                      onRefresh={() => utils.vault.listItems.invalidate()} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
      <AnimatePresence>
        {showNew && (
          <NewNoteModal masterKey={masterKey!} onClose={() => setShowNew(false)}
            onCreated={() => { setShowNew(false); utils.vault.listItems.invalidate(); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

function NoteRow({ item, dec, index, onDelete, onRefresh }: {
  item: VaultItem; dec: DecryptedNote | undefined; index: number;
  onDelete: () => void; onRefresh: () => void;
}) {
  const { masterKey } = useVault();
  const [showEditor, setShowEditor] = useState(false);
  const updateItem = api.vault.updateItem.useMutation({ onSuccess: onRefresh });

  const togglePin = useCallback(async () => {
    if (!dec) return;
    await updateItem.mutateAsync({ id: item.id, type: "NOTE" as const, isPinned: !dec.isPinned });
  }, [dec, item.id, updateItem]);

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
        className="group flex items-start gap-3 p-3.5 rounded-lg border border-white/5 hover:border-white/10 hover:bg-white/2 transition-all cursor-pointer"
        onClick={() => setShowEditor(true)}
      >
        <div className="w-8 h-8 rounded-lg bg-indigo-500/8 flex items-center justify-center shrink-0 mt-0.5">
          <FileText size={13} className="text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-zinc-200 text-sm truncate font-medium">
            {dec?.title
              ? dec.title
              : <span className="skeleton h-3 w-32 inline-block rounded align-middle" />}
          </p>
          {dec?.preview && <p className="text-xs text-zinc-600 truncate mt-0.5">{dec.preview}</p>}
          <div className="flex items-center gap-2 mt-1.5">
            <Clock size={9} className="text-zinc-700" />
            <span className="text-[10px] text-zinc-600">
              {dec ? dec.updatedAt.toLocaleDateString() : ""}
            </span>
            {dec?.wordCount != null && <span className="text-[10px] text-zinc-700">{dec.wordCount} words</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={(e) => { e.stopPropagation(); togglePin(); }}
            className="w-6 h-6 rounded flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:bg-white/5 transition-all">
            {dec?.isPinned ? <PinOff size={11} /> : <Pin size={11} />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="w-6 h-6 rounded flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-500/8 transition-all">
            <Trash2 size={11} />
          </button>
        </div>
      </motion.div>
      <AnimatePresence>
        {showEditor && dec && masterKey && (
          <EditNoteModal id={item.id} initialTitle={dec.title} masterKey={masterKey}
            onClose={() => setShowEditor(false)}
            onSaved={() => { setShowEditor(false); onRefresh(); }} />
        )}
      </AnimatePresence>
    </>
  );
}

function NewNoteModal({ masterKey, onClose, onCreated }: { masterKey: CryptoKey; onClose: () => void; onCreated: () => void; }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const createItem = api.vault.createItem.useMutation();

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      const [encTitle, encContent, encPreview] = await Promise.all([
        encryptData(masterKey, title),
        encryptData(masterKey, content),
        encryptData(masterKey, content.slice(0, 120)),
      ]);
      await createItem.mutateAsync({
        type: "NOTE",
        title: JSON.stringify(encTitle),
        content: JSON.stringify(encContent),
        preview: JSON.stringify(encPreview),
        isPinned: false,
      });
      onCreated();
    } catch (err) {
      console.error("Failed to create note:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell onClose={onClose} title="New note">
      <div className="p-5 space-y-3">
        <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title"
          className="w-full bg-transparent text-lg font-light text-zinc-200 placeholder-zinc-700 outline-none" />
        <textarea value={content} onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing… (will be encrypted)" rows={8}
          className="w-full bg-transparent text-sm text-zinc-400 placeholder-zinc-700 outline-none resize-none leading-relaxed" />
      </div>
      <ModalFooter onCancel={onClose} onSave={handleSave} saving={saving} disabled={!title.trim() || !content.trim()} />
    </ModalShell>
  );
}

function EditNoteModal({ id, initialTitle, masterKey, onClose, onSaved }: {
  id: string; initialTitle: string; masterKey: CryptoKey; onClose: () => void; onSaved: () => void;
}) {
  const { data, isLoading } = api.vault.getItem.useQuery({ id });
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState("");
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const updateItem = api.vault.updateItem.useMutation();

  useEffect(() => {
    if (!data?.note?.contentEnc || ready) return;
    decryptData(masterKey, parseEncrypted(data.note.contentEnc))
      .then((c) => { setContent(c); setReady(true); })
      .catch(() => { setContent(""); setReady(true); });
  }, [data, masterKey, ready]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const [encTitle, encContent, encPreview] = await Promise.all([
        encryptData(masterKey, title),
        encryptData(masterKey, content),
        encryptData(masterKey, content.slice(0, 120)),
      ]);
      await updateItem.mutateAsync({
        id,
        type: "NOTE" as const,
        title: JSON.stringify(encTitle),
        content: JSON.stringify(encContent),
        preview: JSON.stringify(encPreview),
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell onClose={onClose} title="Edit note">
      {isLoading || !ready ? (
        <div className="p-5 space-y-3">
          <div className="skeleton h-6 w-1/2 rounded" />
          <div className="skeleton h-32 w-full rounded" />
        </div>
      ) : (
        <div className="p-5 space-y-3">
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title"
            className="w-full bg-transparent text-lg font-light text-zinc-200 placeholder-zinc-700 outline-none" />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Start writing…" rows={8}
            className="w-full bg-transparent text-sm text-zinc-400 placeholder-zinc-700 outline-none resize-none leading-relaxed" />
        </div>
      )}
      <ModalFooter onCancel={onClose} onSave={handleSave} saving={saving} disabled={!title.trim()} />
    </ModalShell>
  );
}

function LockedState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center px-6">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/8 border border-indigo-500/15 flex items-center justify-center mx-auto mb-5">
          <Lock size={18} className="text-indigo-400" />
        </div>
        <h3 className="text-sm font-medium text-zinc-300 mb-2">Vault locked</h3>
        <p className="text-xs text-zinc-600 max-w-xs">Unlock your vault to read and create encrypted notes.</p>
      </motion.div>
    </div>
  );
}

function ModalShell({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string; }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 16 }}
        className="w-full max-w-lg bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-white/6 flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-200">{title}</h2>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded text-zinc-600 hover:text-zinc-400 hover:bg-white/5 transition-all">
            <X size={13} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function ModalFooter({ onCancel, onSave, saving, disabled }: {
  onCancel: () => void; onSave: () => void; saving: boolean; disabled?: boolean;
}) {
  return (
    <div className="px-5 py-4 border-t border-white/6 flex items-center justify-between">
      <span className="text-[10px] text-zinc-700 flex items-center gap-1"><Lock size={9} /> AES-256-GCM encrypted</span>
      <div className="flex items-center gap-2">
        <button onClick={onCancel} className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Cancel</button>
        <button onClick={onSave} disabled={saving || disabled}
          className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors flex items-center gap-1.5">
          {saving ? <><div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />Encrypting…</> : "Save encrypted"}
        </button>
      </div>
    </div>
  );
}