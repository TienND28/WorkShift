import { GoogleOAuthProvider } from "@react-oauth/google";
import type { ReactNode } from "react";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  if (!clientId) {
    return (
      <div className="min-h-dvh bg-white text-neutral-900 flex items-center justify-center p-6 text-center">
        <p>
          Thiếu <code className="text-red-600">VITE_GOOGLE_CLIENT_ID</code> trong
          file .env
        </p>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>
  );
}
