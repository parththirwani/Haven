"use client";

import { motion } from "framer-motion";
import { TopBar } from "@/src/components/layout/TopBar";
import { ItemSkeleton, EmptyState } from "@/src/components/dashboard/ItemSkeleton";
import { ClipboardList, Eye, Plus, Pencil, Trash2, Download, Paperclip, Lock } from "lucide-react";

// Placeholder — will use api.audit.list.useQuery() once audit router is implemented
// type AuditLog = inferRouterOutputs<AppRouter>["audit"]["list"][number]

const ACTION_ICONS = {
  CREATE: Plus,
  VIEW: Eye,
  UPDATE: Pencil,
  DELETE: Trash2,
  ATTACH_FILE: Paperclip,
  DOWNLOAD_FILE: Download,
} as const;

const ACTION_COLORS = {
  CREATE: "text-emerald-400 bg-emerald-500/8",
  VIEW: "text-blue-400 bg-blue-500/8",
  UPDATE: "text-amber-400 bg-amber-500/8",
  DELETE: "text-red-400 bg-red-500/8",
  ATTACH_FILE: "text-violet-400 bg-violet-500/8",
  DOWNLOAD_FILE: "text-indigo-400 bg-indigo-500/8",
} as const;

type AuditAction = keyof typeof ACTION_ICONS;

const DEMO_LOGS: Array<{
  id: string;
  action: AuditAction;
  timestamp: string;
  hash: string;
}> = [];

export default function AuditPage() {
  const isLoading = false;

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Audit Log" />
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <ItemSkeleton count={8} />
        ) : DEMO_LOGS.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={20} />}
            title="No audit entries"
            desc="Every action on your vault is logged here with a tamper-evident hash chain."
          />
        ) : (
          <div className="p-4 space-y-2">
            {DEMO_LOGS.map((log, i) => {
              const Icon = ACTION_ICONS[log.action];
              const colors = ACTION_COLORS[log.action];
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 p-3.5 rounded-lg border border-white/5"
                >
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${colors}`}>
                    <Icon size={12} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-300">{log.action}</p>
                    <p className="text-[10px] text-zinc-600 font-mono mt-0.5 truncate">
                      {log.hash}
                    </p>
                  </div>
                  <span className="text-[10px] text-zinc-600 shrink-0">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Hash chain explanation */}
        <div className="mx-4 mt-4 p-4 rounded-xl border border-white/5 bg-white/1">
          <div className="flex items-center gap-2 mb-2">
            <Lock size={11} className="text-indigo-400" />
            <span className="text-xs font-medium text-zinc-400">Tamper-evident log</span>
          </div>
          <p className="text-[11px] text-zinc-600 leading-relaxed">
            Each audit entry includes a hash that chains to the previous entry.
            Any modification to historical records would break the hash chain,
            making tampering cryptographically detectable.
          </p>
        </div>
      </div>
    </div>
  );
}
