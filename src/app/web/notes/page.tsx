"use client";

import { motion } from "framer-motion";
import { TopBar } from "@/src/components/layout/TopBar";
import { EmptyState, ItemSkeleton } from "@/src/components/dashboard/ItemSkeleton";
import { FileText, Clock } from "lucide-react";
import { useState } from "react";

// Notes page — reads from backend when item router is implemented
// Types will come from inferRouterOutputs<AppRouter> once item router exists
export default function NotesPage() {
  const [showNew, setShowNew] = useState(false);

  // TODO: replace with api.items.list.useQuery({ type: "NOTE" }) once item router is live
  const isLoading = false;
  const items: { id: string; titleEnc: string; createdAt: string }[] = [];

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Notes"
        onNewItem={() => setShowNew(true)}
        newItemLabel="New note"
      />

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <ItemSkeleton count={6} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<FileText size={20} />}
            title="No notes yet"
            desc="Create your first encrypted note. It will be unreadable to anyone but you."
            action={
              <button
                onClick={() => setShowNew(true)}
                className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-medium transition-colors"
              >
                Create note
              </button>
            }
          />
        ) : (
          <div className="p-4 space-y-2">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3.5 rounded-lg border border-white/5 hover:border-white/10 hover:bg-white/2 transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/8 flex items-center justify-center shrink-0">
                  <FileText size={13} className="text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-300 truncate font-mono text-xs">
                    {item.titleEnc}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock size={9} className="text-zinc-700" />
                    <span className="text-[10px] text-zinc-600">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* New note modal placeholder */}
      {showNew && (
        <NewNoteModal onClose={() => setShowNew(false)} />
      )}
    </div>
  );
}

function NewNoteModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-lg bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-white/6 flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-200">New note</h2>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400 text-xs">
            ✕
          </button>
        </div>
        <div className="p-5 space-y-3">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full bg-transparent text-lg font-light text-zinc-200 placeholder-zinc-700 outline-none"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing… (will be encrypted)"
            rows={8}
            className="w-full bg-transparent text-sm text-zinc-400 placeholder-zinc-700 outline-none resize-none leading-relaxed"
          />
        </div>
        <div className="px-5 py-4 border-t border-white/6 flex items-center justify-between">
          <span className="text-[10px] text-zinc-700">🔒 Encrypted with AES-256-GCM</span>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              Cancel
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-medium transition-colors">
              Save encrypted
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
