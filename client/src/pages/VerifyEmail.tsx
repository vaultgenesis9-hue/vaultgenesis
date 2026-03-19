import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useTheme } from "@/contexts/ThemeContext";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

export default function VerifyEmail() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Extract token from URL query string
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") ?? "";

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const verifyMutation = trpc.auth.verifyEmail.useMutation({
    onSuccess: () => setStatus("success"),
    onError: (err) => {
      setStatus("error");
      setErrorMsg(err.message);
    },
  });

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg("No verification token found in the URL.");
      return;
    }
    setStatus("loading");
    verifyMutation.mutate({ token });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className={`min-h-screen ${isDark ? "bg-black" : "bg-[#fafaf8]"} relative overflow-hidden`}>
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute rounded-full"
          style={{
            width: "600px",
            height: "600px",
            top: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            background: isDark
              ? "radial-gradient(rgba(255,255,255,0.08) 0%, rgba(0,0,0,0) 70%)"
              : "radial-gradient(rgba(80,80,80,0.12) 0%, rgba(250,250,248,0) 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <Navbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <main className="relative z-10 pt-32 pb-20 flex flex-col items-center justify-center min-h-screen">
        <div
          className={`w-full max-w-md mx-auto px-6 py-10 rounded-2xl border text-center ${
            isDark ? "bg-white/5 border-white/10" : "bg-white/70 border-black/10"
          }`}
        >
          {status === "loading" && (
            <>
              <Loader2 className={`w-12 h-12 mx-auto mb-4 animate-spin ${isDark ? "text-white" : "text-black"}`} />
              <h1 className={`text-2xl font-black uppercase tracking-tight mb-2 ${isDark ? "text-white" : "text-black"}`}>
                Verifying...
              </h1>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Please wait while we verify your email address.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
              <h1 className={`text-2xl font-black uppercase tracking-tight mb-2 ${isDark ? "text-white" : "text-black"}`}>
                Email Verified!
              </h1>
              <p className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Your email address has been successfully verified. Your VaultGenesis account is now fully active.
              </p>
              <Button
                onClick={() => navigate("/")}
                className={`w-full py-3 font-bold uppercase tracking-wide text-sm rounded-xl ${
                  isDark
                    ? "bg-white text-black hover:bg-gray-200"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                Go to Homepage
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
              <h1 className={`text-2xl font-black uppercase tracking-tight mb-2 ${isDark ? "text-white" : "text-black"}`}>
                Verification Failed
              </h1>
              <p className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {errorMsg || "This verification link is invalid or has expired."}
              </p>
              <p className={`text-xs mb-6 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                Verification links expire after 24 hours. Sign in to your account and request a new verification email from your profile.
              </p>
              <Button
                onClick={() => navigate("/")}
                className={`w-full py-3 font-bold uppercase tracking-wide text-sm rounded-xl ${
                  isDark
                    ? "bg-white text-black hover:bg-gray-200"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                Back to Homepage
              </Button>
            </>
          )}

          {status === "idle" && (
            <>
              <Mail className={`w-12 h-12 mx-auto mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
              <h1 className={`text-2xl font-black uppercase tracking-tight mb-2 ${isDark ? "text-white" : "text-black"}`}>
                Check Your Email
              </h1>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                A verification link has been sent to your email address.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
