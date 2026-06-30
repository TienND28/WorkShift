import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { hydrate, isAuthenticated, user } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate().finally(() => setReady(true));
  }, [hydrate]);

  if (!ready) {
    return (
      <div className="min-h-dvh bg-[#f8f9fa] flex items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-teal-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!user?.isSystemAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
