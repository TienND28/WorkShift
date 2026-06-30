import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

interface GuestRouteProps {
  children: ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const { hydrate, isAuthenticated } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate().finally(() => setReady(true));
  }, [hydrate]);

  if (!ready) {
    return (
      <div className="min-h-dvh bg-white flex items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-blue-600" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
