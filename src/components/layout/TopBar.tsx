"use client";

import { useState, useCallback } from "react";
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
  newItemLabel = "New" 
}: TopBarProps) {
  
  const [query, setQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const { isUnlocked } = useVault();

  // Optional: Add debounce if you plan to search onChange later
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    // You can add debounced search logic here in the future
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-white/6 bg-[#090909]/80 backdrop-blur-md sticky top-0 z-20">
      
      {/* Title */}
      <h1 className="text-sm font-medium text-zinc-300 tracking-tight">
        {title}
      </h1>

      <div className="flex items-center gap-3">
        
        {/* Search Bar */}
        <div className="relative group">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={handleSearchChange}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Search…"
            aria-label="Search vault items"
            className={`pl-9 pr-4 py-1.5 text-xs rounded-xl border transition-all duration-200 
              outline-none bg-white/5 text-zinc-200 placeholder-zinc-500
              focus:bg-white/10
              ${isSearchFocused 
                ? "border-indigo-500/50 w-60 shadow-sm" 
                : "border-white/10 w-44 hover:border-white/20"
              }`}
          />
        </div>

        {/* Vault Status Indicator */}
        <VaultStatus isUnlocked={isUnlocked} />

        {/* New Item Button */}
        {onNewItem && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNewItem}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl 
                       bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 
                       text-white text-xs font-medium transition-colors duration-200
                       shadow-sm shadow-indigo-500/20"
            aria-label={`Create new ${newItemLabel.toLowerCase()}`}
          >
            <Plus size={13} strokeWidth={3} />
            {newItemLabel}
          </motion.button>
        )}
      </div>
    </header>
  );
}

interface VaultStatusProps {
  isUnlocked: boolean;
}

function VaultStatus({ isUnlocked }: VaultStatusProps) {
  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-[10px] font-medium transition-all ${
        isUnlocked
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          : "bg-zinc-900/50 border-white/10 text-zinc-500"
      }`}
    >
      {isUnlocked ? (
        <Shield size={12} className="text-emerald-400" />
      ) : (
        <Lock size={12} className="text-zinc-600" />
      )}
      <span>{isUnlocked ? "Unlocked" : "Locked"}</span>
    </div>
  );
}