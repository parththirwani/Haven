"use client";

import { motion } from "framer-motion";

interface ItemSkeletonProps {
  count?: number;
}

export function ItemSkeleton({ count = 5 }: ItemSkeletonProps) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-3 p-3.5 rounded-lg border border-white/5"
        >
          <div className="skeleton w-8 h-8 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3 w-2/5 rounded" />
            <div className="skeleton h-2.5 w-3/5 rounded" />
          </div>
          <div className="skeleton h-2.5 w-16 rounded" />
        </motion.div>
      ))}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  desc,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full py-24 px-6 text-center"
    >
      <div className="w-12 h-12 rounded-xl bg-white/3 border border-white/6 flex items-center justify-center mb-5 text-zinc-600">
        {icon}
      </div>
      <h3 className="text-sm font-medium text-zinc-300 mb-1">{title}</h3>
      <p className="text-xs text-zinc-600 max-w-xs mb-6">{desc}</p>
      {action}
    </motion.div>
  );
}
