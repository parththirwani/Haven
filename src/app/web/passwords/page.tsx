"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TopBar } from "@/src/components/layout/TopBar";
import { EmptyState, ItemSkeleton } from "@/src/components/dashboard/ItemSkeleton";
import { KeyRound, Eye, EyeOff, Copy, Check, Trash2, X, Lock, Pencil, Globe } from "lucide-react";
import { api } from "@/src/trpc/react";
import { useVault } from "@/src/stores/useVault";
import { encryptData, decryptData } from "@/src/utils/crypto";
import type { EncryptedPayload } from "@/src/types/crypto.types";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/src/server/trpc/routers";

type RouterOutput = inferRouterOutputs<AppRouter>;
type VaultItem = RouterOutput["vault"]["listItems"]["items"][number];

interface DecryptedPassword {
  id: string;
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
  passwordStrength: number | null;
}

function parseEncrypted(str: string): EncryptedPayload {
  return JSON.parse(str) as EncryptedPayload;
}

const STRENGTH_LABELS = ["", "Very Weak", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = ["", "text-red-500", "text-red-400", "text-amber-400", "text-yellow-400", "text-emerald-400"];
const STRENGTH_BG     = ["", "bg-red-500",   "bg-red-400",   "bg-amber-400",   "bg-yellow-400",   "bg-emerald-400"];

function calcStrength(password: string): number {
  if (!password.length) return 0;
  let s = 0;
  if (password.length >= 8) s++;
  if (password.length >= 12) s++;
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) s++;
  if (/[^A-Za-z0-9]/.test(password)) s++;
  if (password.length >= 20) s++;
  return Math.min(s, 5);
}

export default function PasswordsPage() {
  const { masterKey, isUnlocked } = useVault();
  const [showNew, setShowNew]   = useState(false);
  const [editing, setEditing]   = useState<{ item: VaultItem; dec: DecryptedPassword } | null>(null);
  const [decrypted, setDecrypted] = useState<Record<string, DecryptedPassword>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [copied, setCopied]     = useState<string | null>(null);

  const utils = api.useUtils();

  const { data, isLoading } = api.vault.listItems.useQuery(
    { type: "PASSWORD", limit: 50 },
    { enabled: isUnlocked }
  );

  useEffect(() => {
    if (!data || !masterKey) return;
    let cancelled = false;

    async function decryptAll() {
      if (!masterKey) return;
      const map: Record<string, DecryptedPassword> = {};
      await Promise.all(
        (data?.items ?? []).map(async (item: VaultItem) => {
          try {
            const pw = item.password;
            const [title, username, password, url, notes] = await Promise.all([
              decryptData(masterKey, parseEncrypted(item.titleEnc)),
              pw?.usernameEnc ? decryptData(masterKey, parseEncrypted(pw.usernameEnc)) : Promise.resolve(""),
              pw?.passwordEnc ? decryptData(masterKey, parseEncrypted(pw.passwordEnc)) : Promise.resolve(""),
              pw?.urlEnc      ? decryptData(masterKey, parseEncrypted(pw.urlEnc))      : Promise.resolve(""),
              pw?.notesEnc    ? decryptData(masterKey, parseEncrypted(pw.notesEnc))    : Promise.resolve(""),
            ]);
            map[item.id] = { id: item.id, title, username, password, url, notes, passwordStrength: pw?.passwordStrength ?? null };
          } catch {
            map[item.id] = { id: item.id, title: "⚠ Decryption failed", username: "", password: "", url: "", notes: "", passwordStrength: null };
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

  const copyPassword = async (id: string, password: string) => {
    await navigator.clipboard.writeText(password);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const items = data?.items ?? [];

  if (!isUnlocked) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Passwords" />
        <div className="flex-1 flex items-center justify-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center px-6">
            <div className="w-12 h-12 rounded-xl bg-amber-500/8 border border-amber-500/15 flex items-center justify-center mx-auto mb-5">
              <Lock size={18} className="text-amber-400" />
            </div>
            <h3 className="text-sm font-medium text-zinc-300 mb-2">Vault locked</h3>
            <p className="text-xs text-zinc-600 max-w-xs">Unlock your vault to access encrypted passwords.</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Passwords" onNewItem={() => setShowNew(true)} newItemLabel="Add password" />
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <ItemSkeleton count={5} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<KeyRound size={20} />}
            title="No passwords saved"
            desc="Store credentials with AES-256-GCM encryption. Zero-knowledge by design."
            action={
              <button onClick={() => setShowNew(true)} className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-medium transition-colors">
                Add password
              </button>
            }
          />
        ) : (
          <div className="p-4 space-y-2">
            {items.map((item, i) => {
              const dec = decrypted[item.id];
              const strength = dec?.passwordStrength ? Math.round(dec.passwordStrength / 20) : 0;
              const isRevealed = revealed[item.id] ?? false;
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="group p-3.5 rounded-lg border border-white/5 hover:border-white/10 hover:bg-white/2 transition-all cursor-pointer"
                  onClick={() => dec && setEditing({ item, dec })}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/8 flex items-center justify-center shrink-0">
                      <KeyRound size={13} className="text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-200 text-sm truncate">
                        {dec?.title
                          ? dec.title
                          : <span className="skeleton h-3 w-24 inline-block rounded align-middle" />}
                      </p>
                      {dec?.username && <p className="text-xs text-zinc-600 truncate mt-0.5">{dec.username}</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); dec && setEditing({ item, dec }); }}
                        className="w-6 h-6 rounded flex items-center justify-center text-zinc-600 hover:text-indigo-400 hover:bg-indigo-500/8 transition-all">
                        <Pencil size={11} />
                      </button>
                      {dec?.password && (
                        <button onClick={(e) => { e.stopPropagation(); copyPassword(item.id, dec.password); }}
                          className="w-6 h-6 rounded flex items-center justify-center text-zinc-600 hover:text-emerald-400 hover:bg-emerald-500/8 transition-all">
                          {copied === item.id ? <Check size={11} /> : <Copy size={11} />}
                        </button>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); setRevealed(r => ({ ...r, [item.id]: !r[item.id] })); }}
                        className="w-6 h-6 rounded flex items-center justify-center text-zinc-600 hover:text-zinc-400 hover:bg-white/5 transition-all">
                        {isRevealed ? <EyeOff size={11} /> : <Eye size={11} />}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); softDelete.mutate({ id: item.id }); }}
                        className="w-6 h-6 rounded flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-500/8 transition-all">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                  {dec?.password && (
                    <div className="mt-2 ml-11">
                      <p className="text-xs font-mono text-zinc-500 tracking-widest">
                        {isRevealed ? dec.password : "•".repeat(Math.min(dec.password.length, 20))}
                      </p>
                      {strength > 0 && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(n => (
                              <div key={n} className={`h-0.5 w-4 rounded-full transition-colors ${n <= strength ? STRENGTH_BG[strength] : "bg-white/8"}`} />
                            ))}
                          </div>
                          <span className={`text-[10px] ${STRENGTH_COLORS[strength]}`}>{STRENGTH_LABELS[strength]}</span>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showNew && (
          <PasswordModal masterKey={masterKey!} onClose={() => setShowNew(false)}
            onSaved={() => { setShowNew(false); utils.vault.listItems.invalidate(); }} />
        )}
        {editing && (
          <PasswordModal masterKey={masterKey!} existing={editing}
            onClose={() => setEditing(null)}
            onSaved={() => { setEditing(null); utils.vault.listItems.invalidate(); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

function PasswordModal({
  masterKey, existing, onClose, onSaved,
}: {
  masterKey: CryptoKey;
  existing?: { item: VaultItem; dec: DecryptedPassword };
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!existing;
  const [title,    setTitle]    = useState(existing?.dec.title    ?? "");
  const [username, setUsername] = useState(existing?.dec.username ?? "");
  const [password, setPassword] = useState(existing?.dec.password ?? "");
  const [url,      setUrl]      = useState(existing?.dec.url      ?? "");
  const [notes,    setNotes]    = useState(existing?.dec.notes    ?? "");
  const [showPw,   setShowPw]   = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const strength = calcStrength(password);

  const createItem = api.vault.createItem.useMutation();
  const updateItem = api.vault.updateItem.useMutation();

  const handleSave = async () => {
    if (!title.trim() || !username.trim() || !password.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const [encTitle, encUsername, encPassword, encUrl, encNotes] = await Promise.all([
        encryptData(masterKey, title),
        encryptData(masterKey, username),
        encryptData(masterKey, password),
        url   ? encryptData(masterKey, url)   : null,
        notes ? encryptData(masterKey, notes) : null,
      ]);

      if (isEdit) {
        await updateItem.mutateAsync({
          id:               existing!.item.id,
          type:             "PASSWORD" as const,
          title:            JSON.stringify(encTitle),
          username:         JSON.stringify(encUsername),
          password:         JSON.stringify(encPassword),
          passwordStrength: strength * 20,
          ...(encUrl   ? { url:   JSON.stringify(encUrl) }   : { url: "" }),
          ...(encNotes ? { notes: JSON.stringify(encNotes) } : { notes: "" }),
        });
      } else {
        await createItem.mutateAsync({
          type:             "PASSWORD",
          title:            JSON.stringify(encTitle),
          username:         JSON.stringify(encUsername),
          password:         JSON.stringify(encPassword),
          passwordStrength: strength * 20,
          ...(encUrl   && { url:   JSON.stringify(encUrl) }),
          ...(encNotes && { notes: JSON.stringify(encNotes) }),
        });
      }
      onSaved();
    } catch {
      setError("Failed to save password. Please try again.");
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
          <h2 className="text-sm font-medium text-zinc-200">{isEdit ? "Edit password" : "Add password"}</h2>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded text-zinc-600 hover:text-zinc-400 hover:bg-white/5 transition-all"><X size={13} /></button>
        </div>
        <div className="p-5 space-y-3.5 max-h-[60vh] overflow-y-auto">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Title / Site name</label>
            <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. GitHub"
              className="w-full px-3 py-2 rounded-lg bg-white/3 border border-white/8 text-zinc-200 placeholder-zinc-600 text-sm outline-none focus:border-indigo-500/40 transition-all" />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Username / Email</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="user@example.com"
              className="w-full px-3 py-2 rounded-lg bg-white/3 border border-white/8 text-zinc-200 placeholder-zinc-600 text-sm outline-none focus:border-indigo-500/40 transition-all" />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Password</label>
            <div className="relative">
              <input value={password} onChange={(e) => setPassword(e.target.value)}
                type={showPw ? "text" : "password"} placeholder="••••••••"
                className="w-full px-3 py-2 pr-8 rounded-lg bg-white/3 border border-white/8 text-zinc-200 placeholder-zinc-600 text-sm outline-none focus:border-indigo-500/40 transition-all font-mono" />
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors">
                {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
            {password && (
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(n => (
                    <div key={n} className={`h-0.5 w-4 rounded-full transition-colors ${n <= strength ? STRENGTH_BG[strength] : "bg-white/8"}`} />
                  ))}
                </div>
                <span className={`text-[10px] ${STRENGTH_COLORS[strength]}`}>{STRENGTH_LABELS[strength]}</span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5 items-center gap-1"><Globe size={10} /> URL <span className="text-zinc-700">optional</span></label>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://github.com"
              className="w-full px-3 py-2 rounded-lg bg-white/3 border border-white/8 text-zinc-200 placeholder-zinc-600 text-sm outline-none focus:border-indigo-500/40 transition-all font-mono" />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Notes <span className="text-zinc-700">optional</span></label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Recovery codes, hints…" rows={2}
              className="w-full px-3 py-2 rounded-lg bg-white/3 border border-white/8 text-zinc-200 placeholder-zinc-600 text-sm outline-none focus:border-indigo-500/40 transition-all resize-none" />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
        <div className="px-5 py-4 border-t border-white/6 flex items-center justify-between">
          <span className="text-[10px] text-zinc-700 flex items-center gap-1"><Lock size={9} /> AES-256-GCM</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving || !title.trim() || !username.trim() || !password.trim()}
              className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 text-white text-xs font-medium transition-colors flex items-center gap-1.5">
              {saving ? <><div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />Encrypting…</> : isEdit ? "Save changes" : "Save encrypted"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}