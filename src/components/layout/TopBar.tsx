"use client";

import { useState } from "react";
import { Search, Plus, Shield, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useVault } from "@/src/stores/useVault";

interface TopBarProps {
  title: string;
  onNewItem?: () => void;
  newItemLabel?: string;
}

export function TopBar({
  title,
  onNewItem,
  newItemLabel = "New",
}: TopBarProps) {
  const [query, setQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const { isUnlocked } = useVault();

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/6 bg-[#090909]/90 backdrop-blur-lg sticky top-0 z-30">
      {/* Page Title */}
      <h1 className="text-lg font-semibold tracking-tight text-white">
        {title}
      </h1>

      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative group">
          <Search
            size={15}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Search vault..."
            aria-label="Search in vault"
            className={`pl-11 pr-5 py-2.5 text-sm rounded-2xl border bg-white/5 text-zinc-200 placeholder-zinc-500 outline-none transition-all duration-300
              ${isSearchFocused
                ? "w-80 border-indigo-500/60 bg-white/10 shadow-lg shadow-indigo-500/10"
                : "w-60 border-white/10 hover:border-white/20"
              }`}
          />
        </div>

        {/* Vault Status */}
        <VaultStatus isUnlocked={isUnlocked} />

        {/* New Item Button */}
        {onNewItem && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNewItem}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-sm font-medium transition-all duration-200 shadow-sm shadow-indigo-500/30"
            aria-label={`Create new ${newItemLabel.toLowerCase()}`}
          >
            <Plus size={16} strokeWidth={3} />
            {newItemLabel}
          </motion.button>
        )}
      </div>
    </header>
  );
}

/* ====================== Vault Status Component ====================== */

interface VaultStatusProps {
  isUnlocked: boolean;
}

function VaultStatus({ isUnlocked }: VaultStatusProps) {
  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-medium transition-all duration-200 ${
        isUnlocked
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
          : "bg-zinc-900 border-white/10 text-zinc-500"
      }`}
    >
      {isUnlocked ? (
        <Shield size={15} className="text-emerald-400" />
      ) : (
        <Lock size={15} className="text-zinc-600" />
      )}
      <span>{isUnlocked ? "Unlocked" : "Locked"}</span>
    </div>
  );
}