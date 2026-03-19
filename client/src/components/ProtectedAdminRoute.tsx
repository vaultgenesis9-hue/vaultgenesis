import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

/**
 * Wraps admin-only pages. Redirects to /admin/login if no valid admin_session
 * cookie is present. Shows a full-screen spinner while the session check is in flight.
 */
export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const [, navigate] = useLocation();
  const { data: adminSession, isLoading } = trpc.adminAuth.me.useQuery(undefined, {
    retry: false,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!isLoading && !adminSession) {
      navigate("/admin/login");
    }
  }, [adminSession, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (!adminSession) {
    // Will redirect via useEffect — render nothing in the meantime
    return null;
  }

  return <>{children}</>;
}
