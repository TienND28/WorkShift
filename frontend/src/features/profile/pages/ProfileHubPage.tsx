import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function ProfileHubPage() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" replace />;

  if (user.profileTypes.includes("WORKER")) {
    return <Navigate to="/profile/worker" replace />;
  }
  if (user.profileTypes.includes("EMPLOYER")) {
    return <Navigate to="/profile/employer" replace />;
  }

  return <Navigate to="/onboarding" replace />;
}
