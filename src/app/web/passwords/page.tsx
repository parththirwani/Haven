"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TopBar } from "@/src/components/layout/TopBar";
import { EmptyState, ItemSkeleton } from "@/src/components/dashboard/ItemSkeleton";
import { KeyRound, Shield, Eye, EyeOff } from "lucide-react";
import { useVault } from "@/src/stores/useVault";

export default function PasswordsPage() {
  const { isUnlocked } = useVault();
  const isLoading = false;
  const items: unknown[] = [];

  if (!isUnlocked) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Passwords" />
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center px-6"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/8 border border-amber-500/15 flex items-center justify-center mx-auto mb-5">
              <Shield size={18} className="text-amber-400" />
            </div>
            <h3 className="text-sm font-medium text-zinc-300 mb-2">Vault locked</h3>
            <p className="text-xs text-zinc-600 max-w-xs">
              Unlock your vault to access encrypted passwords. Your master key stays in memory only.
            </p>
            <button className="mt-6 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-medium transition-colors">
              Unlock vault
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Passwords" onNewItem={() => {}} newItemLabel="Add credential" />
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <ItemSkeleton count={5} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<KeyRound size={20} />}
            title="No passwords stored"
            desc="Store credentials encrypted with AES-256-GCM. Your master key never leaves your device."
            action={
              <button className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-medium transition-colors">
                Add credential
              </button>
            }
          />
        ) : null}
      </div>
    </div>
  );
}
