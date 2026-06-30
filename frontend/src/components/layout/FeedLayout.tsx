import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { FeedHeader } from "@/components/layout/FeedHeader";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { useAuth } from "@/hooks/useAuth";

export function FeedLayout() {
  const { hydrate } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate().finally(() => setReady(true));
  }, [hydrate]);

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#0A4B3E]" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#F8F7F4] text-slate-950">
      <FeedHeader />

      <div className="flex min-h-dvh pt-16">
        <SidebarNav />

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1180px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
