import { Sidebar } from "@/src/components/layout/Sidebar";
import { VaultGuard } from "@/src/components/layout/VaultGuard";

export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <VaultGuard>
      <div className="flex h-screen bg-[#080808] overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </VaultGuard>
  );
}
