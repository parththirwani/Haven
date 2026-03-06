"use client";

import { TopBar } from "@/src/components/layout/TopBar";
import { EmptyState } from "@/src/components/dashboard/ItemSkeleton";
import { Trash2 } from "lucide-react";

export default function TrashPage() {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Trash" />
      <div className="flex-1 overflow-y-auto">
        <EmptyState
          icon={<Trash2 size={20} />}
          title="Trash is empty"
          desc="Deleted items appear here before permanent deletion after 30 days."
        />
      </div>
    </div>
  );
}
