"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { useRouter } from "next/navigation";

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

  const signout = api.auth.signout.useMutation({
    onSuccess: () => {
      lockVault();
      router.push("/login");
    },
  });

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col h-full w-56 border-r border-white/6 bg-[#090909] px-3 py-4"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 mb-8">
        <div className="w-6 h-6 rounded-md bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
          <Lock size={11} className="text-indigo-400" />
        </div>
        <span className="text-sm font-medium text-zinc-300">Haven</span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 space-y-0.5">
        <p className="px-2 mb-2 text-[10px] font-medium tracking-widest text-zinc-600 uppercase">
          Vault
        </p>
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-150 ${
                active
                  ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/15"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/3"
              }`}
            >
              <item.icon
                size={14}
                className={active ? "text-indigo-400" : "text-zinc-600 group-hover:text-zinc-400"}
              />
              {item.label}
              {active && (
                <ChevronRight size={10} className="ml-auto text-indigo-500/60" />
              )}
            </Link>
          );
        })}

        <div className="pt-4">
          <p className="px-2 mb-2 text-[10px] font-medium tracking-widest text-zinc-600 uppercase">
            Explore
          </p>
          {bottomItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-150 ${
                  active
                    ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/15"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/3"
                }`}
              >
                <item.icon
                  size={14}
                  className={active ? "text-indigo-400" : "text-zinc-600 group-hover:text-zinc-400"}
                />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom — user / lock */}
      <div className="border-t border-white/6 pt-3 mt-3 space-y-1">
        <button
          onClick={() => signout.mutate()}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-zinc-600 hover:text-zinc-400 hover:bg-white/3 transition-all"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </motion.aside>
  );
}
