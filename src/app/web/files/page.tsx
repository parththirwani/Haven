"use client";

import { TopBar } from "@/src/components/layout/TopBar";
import { EmptyState, ItemSkeleton } from "@/src/components/dashboard/ItemSkeleton";
import { Paperclip } from "lucide-react";

export default function FilesPage() {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Files" onNewItem={() => {}} newItemLabel="Attach file" />
      <div className="flex-1 overflow-y-auto">
        <EmptyState
          icon={<Paperclip size={20} />}
          title="No files attached"
          desc="Attach encrypted files to any item in your vault."
          action={
            <button className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-medium transition-colors">
              Upload file
            </button>
          }
        />
      </div>
    </div>
  );
}
