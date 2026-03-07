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

export function TopBar({ title, onNewItem, newItemLabel = "New" }: TopBarProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [query, setQuery] = useState("");
  const { isUnlocked } = useVault();

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-white/6 bg-[#090909]/50 backdrop-blur-sm sticky top-0 z-10">
      <h1 className="text-sm font-medium text-zinc-300">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search…"
            className={`pl-8 pr-3 py-1.5 text-xs rounded-lg border transition-all duration-200 outline-none bg-white/3 text-zinc-300 placeholder-zinc-600 ${
              searchFocused
                ? "border-indigo-500/40 w-52 bg-white/5"
                : "border-white/6 w-36"
            }`}
          />
        </div>

        {/* Vault status */}
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md border transition-all ${
            isUnlocked
              ? "bg-emerald-500/5 border-emerald-500/15"
              : "bg-white/2 border-white/6"
          }`}
        >
          {isUnlocked ? (
            <Shield size={11} className="text-emerald-400" />
          ) : (
            <Lock size={11} className="text-zinc-600" />
          )}
          <span
            className={`text-[10px] ${
              isUnlocked ? "text-emerald-400" : "text-zinc-600"
            }`}
          >
            {isUnlocked ? "Unlocked" : "Locked"}
          </span>
        </div>

        {/* New item button */}
        {onNewItem && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNewItem}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-medium transition-all duration-200"
          >
            <Plus size={12} />
            {newItemLabel}
          </motion.button>
        )}
      </div>
    </header>
  );
}