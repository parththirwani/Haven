"use client";

import { TopBar } from "@/src/components/layout/TopBar";
import { EmptyState, ItemSkeleton } from "@/src/components/dashboard/ItemSkeleton";
import { BookOpen } from "lucide-react";

export default function ResourcesPage() {
  const isLoading = false;
  const items: unknown[] = [];

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Resources" onNewItem={() => {}} newItemLabel="Add resource" />
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <ItemSkeleton count={5} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={20} />}
            title="No resources yet"
            desc="Organize research, articles, and references. All encrypted."
            action={
              <button className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-medium transition-colors">
                Add resource
              </button>
            }
          />
        ) : null}
      </div>
    </div>
  );
}
