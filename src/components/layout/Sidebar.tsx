"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import React from "react";

import {
  FileText,
  Link2,
  BookOpen,
  KeyRound,
  Paperclip,
  GitBranch,
  Trash2,
  ClipboardList,
  Lock,
  LogOut,
  ChevronRight,
} from "lucide-react";

import { api } from "@/src/trpc/react";
import { useVault } from "@/src/stores/useVault";

const navItems = [
  { href: "/web/notes", icon: FileText, label: "Notes" },
  { href: "/web/links", icon: Link2, label: "Links" },
  { href: "/web/resources", icon: BookOpen, label: "Resources" },
  { href: "/web/passwords", icon: KeyRound, label: "Passwords" },
  { href: "/web/files", icon: Paperclip, label: "Files" },
];

const bottomItems = [
  { href: "/web/graph", icon: GitBranch, label: "Graph" },
  { href: "/web/audit", icon: ClipboardList, label: "Audit log" },
  { href: "/web/trash", icon: Trash2, label: "Trash" },
];

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { lockVault } = useVault();

  const signoutMutation = api.auth.signout.useMutation({
    onSuccess: () => {
      lockVault();
      router.replace("/login"); // replace is better than push for auth
    },
  });

  // Active route checker
  const isActive = (href: string, exact = false): boolean => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Reusable NavLink (memoized for performance)
  const NavLink = React.memo(
    ({
      href,
      icon: Icon,
      label,
      exact = false,
    }: {
      href: string;
      icon: React.ComponentType<{ size?: number; className?: string }>;
      label: string;
      exact?: boolean;
    }) => {
      const active = isActive(href, exact);

      return (
        <Link
          href={href}
          className={`group flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-sm transition-all duration-200 ${
            active
              ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
              : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
          }`}
        >
          <Icon
            size={15}
            className={
              active
                ? "text-indigo-400"
                : "text-zinc-600 group-hover:text-zinc-400"
            }
          />
          <span className="font-medium">{label}</span>

          {active && (
            <ChevronRight
              size={14}
              className="ml-auto text-indigo-500/70"
            />
          )}
        </Link>
      );
    }
  );

  NavLink.displayName = "NavLink";

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col h-full w-56 border-r border-white/6 bg-[#090909] px-3 py-5"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-7 h-7 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
          <Lock size={13} className="text-indigo-400" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-zinc-200">
          Haven
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        <div className="px-3 mb-2">
          <p className="text-[10px] font-semibold tracking-widest text-zinc-600 uppercase">
            Vault
          </p>
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
          />
        ))}

        <div className="pt-8">
          <div className="px-3 mb-2">
            <p className="text-[10px] font-semibold tracking-widest text-zinc-600 uppercase">
              Explore
            </p>
          </div>

          {bottomItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              exact
            />
          ))}
        </div>
      </nav>

      {/* Bottom Section - Sign Out */}
      <div className="border-t border-white/6 pt-4 mt-auto">
        <button
          onClick={() => signoutMutation.mutate()}
          disabled={signoutMutation.isPending}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-zinc-500 hover:text-zinc-400 hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut size={15} />
          <span>Sign out</span>
        </button>
      </div>
    </motion.aside>
  );
}