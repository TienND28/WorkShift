import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-dvh bg-white text-neutral-900">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <span className="font-bold text-neutral-900">WorkShift</span>
          <div className="flex items-center gap-3">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="h-9 w-9 rounded-full object-cover ring-1 ring-neutral-200"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-semibold text-neutral-600">
                {user?.username?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
            <button
              type="button"
              onClick={() => logout()}
              className="text-sm text-neutral-600 hover:text-blue-600 transition"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">{children}</main>
    </div>
  );
}
