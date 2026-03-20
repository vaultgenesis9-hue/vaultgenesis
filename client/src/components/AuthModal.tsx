import { useState } from "react";
import { X, Eye, EyeOff, Loader2, User, Mail, Lock, AtSign, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Which tab to open first */
  defaultTab?: "signin" | "signup";
  /** Called after successful sign in or sign up */
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, defaultTab = "signin", onSuccess }: AuthModalProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [tab, setTab] = useState<"signin" | "signup">(defaultTab);
  const [showVerifyScreen, setShowVerifyScreen] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");

  // Sign In state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPwd, setShowSignInPwd] = useState(false);

  // Sign Up state
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpUsername, setSignUpUsername] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirm, setSignUpConfirm] = useState("");
  const [showSignUpPwd, setShowSignUpPwd] = useState(false);

  const utils = trpc.useUtils();

  const loginMut = trpc.auth.login.useMutation({
    onSuccess: () => {
      toast.success("Welcome back!");
      utils.auth.me.invalidate();
      onClose();
      onSuccess?.();
      setTimeout(() => window.location.reload(), 300);
    },
    onError: (err) => {
      if (err.message === "EMAIL_NOT_VERIFIED") {
        // Show the email verification gate screen
        setUnverifiedEmail(signInEmail.trim());
        setShowVerifyScreen(true);
      } else {
        toast.error(err.message || "Sign in failed");
      }
    },
  });

  const registerMut = trpc.auth.register.useMutation({
    onSuccess: () => {
      toast.success("Account created! Check your inbox to verify your email.");
      utils.auth.me.invalidate();
      onClose();
      onSuccess?.();
      setTimeout(() => window.location.reload(), 300);
    },
    onError: (err) => {
      toast.error(err.message || "Registration failed");
    },
  });

  // Resend verification email (public procedure using email)
  const resendMut = trpc.auth.resendVerification.useMutation({
    onSuccess: () => {
      toast.success("Verification email sent! Check your inbox.");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to send verification email");
    },
  });

  if (!isOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail.trim() || !signInPassword) return;
    loginMut.mutate({ emailOrUsername: signInEmail.trim(), password: signInPassword });
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (signUpPassword !== signUpConfirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (signUpPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    registerMut.mutate({
      name: signUpName.trim(),
      email: signUpEmail.trim(),
      username: signUpUsername.trim(),
      password: signUpPassword,
    });
  };

  const bg = isDark ? "bg-black border-white/10" : "bg-white border-black/10";
  const cardBg = isDark ? "bg-white/5" : "bg-black/5";
  const labelColor = isDark ? "text-gray-400" : "text-gray-500";
  const inputClass = `w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all ${
    isDark
      ? "bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-white/30"
      : "bg-black/5 border-black/10 text-black placeholder-gray-400 focus:border-black/30"
  }`;
  const btnClass = `w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
    isDark ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800"
  }`;
  const tabActive = isDark ? "bg-white text-black" : "bg-black text-white";
  const tabInactive = isDark ? "text-gray-500 hover:text-white" : "text-gray-400 hover:text-black";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative z-10 w-full max-w-sm rounded-2xl border p-6 ${bg}`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors ${
            isDark ? "text-gray-500 hover:text-white hover:bg-white/10" : "text-gray-400 hover:text-black hover:bg-black/10"
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Email Verification Gate Screen */}
        {showVerifyScreen ? (
          <div className="text-center py-2">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isDark ? "bg-white/10" : "bg-black/5"}`}>
              <MailCheck className={`w-7 h-7 ${isDark ? "text-white" : "text-black"}`} />
            </div>
            <h2 className={`text-lg font-black uppercase tracking-tight mb-1 ${isDark ? "text-white" : "text-black"}`}>
              Verify Your Email
            </h2>
            <p className={`text-xs mb-1 ${labelColor}`}>
              Your email address has not been verified yet.
            </p>
            <p className={`text-xs mb-5 font-medium ${isDark ? "text-white/70" : "text-black/70"}`}>
              {unverifiedEmail}
            </p>
            <p className={`text-xs mb-5 ${labelColor}`}>
              Check your inbox for the verification link we sent when you signed up. If you didn't receive it, click below to resend.
            </p>
            <button
              onClick={() => resendMut.mutate({ email: unverifiedEmail })}
              disabled={resendMut.isPending}
              className={`${btnClass} mb-3`}
            >
              {resendMut.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
              {resendMut.isPending ? "Sending..." : "Resend Verification Email"}
            </button>
            <button
              type="button"
              onClick={() => setShowVerifyScreen(false)}
              className={`text-xs underline ${labelColor}`}
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-5">
              <div className="text-2xl mb-1">🔐</div>
              <h2 className={`text-lg font-black uppercase tracking-tight ${isDark ? "text-white" : "text-black"}`}>
                {tab === "signin" ? "Welcome Back" : "Create Account"}
              </h2>
              <p className={`text-xs mt-0.5 ${labelColor}`}>
                {tab === "signin"
                  ? "Sign in to access your VaultGenesis account"
                  : "No wallet needed — sign up with email"}
              </p>
            </div>

            {/* Tabs */}
            <div className={`flex rounded-xl p-0.5 mb-5 ${cardBg}`}>
              <button
                onClick={() => setTab("signin")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  tab === "signin" ? tabActive : tabInactive
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setTab("signup")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  tab === "signup" ? tabActive : tabInactive
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Sign In Form */}
            {tab === "signin" && (
              <form onSubmit={handleSignIn} className="space-y-3">
                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider mb-1.5 block ${labelColor}`}>
                    Email or Username
                  </label>
                  <div className="relative">
                    <AtSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${labelColor}`} />
                    <input
                      type="text"
                      placeholder="you@example.com or username"
                      value={signInEmail}
                      onChange={e => setSignInEmail(e.target.value)}
                      className={`${inputClass} pl-9`}
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider mb-1.5 block ${labelColor}`}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${labelColor}`} />
                    <input
                      type={showSignInPwd ? "text" : "password"}
                      placeholder="••••••••"
                      value={signInPassword}
                      onChange={e => setSignInPassword(e.target.value)}
                      className={`${inputClass} pl-9 pr-10`}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPwd(v => !v)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${labelColor}`}
                    >
                      {showSignInPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button type="submit" className={btnClass} disabled={loginMut.isPending}>
                  {loginMut.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  {loginMut.isPending ? "Signing In..." : "Sign In"}
                </button>

                <p className={`text-center text-xs ${labelColor}`}>
                  No account?{" "}
                  <button
                    type="button"
                    onClick={() => setTab("signup")}
                    className={`font-bold underline ${isDark ? "text-white" : "text-black"}`}
                  >
                    Create one free
                  </button>
                </p>
              </form>
            )}

            {/* Sign Up Form */}
            {tab === "signup" && (
              <form onSubmit={handleSignUp} className="space-y-3">
                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider mb-1.5 block ${labelColor}`}>
                    Full Name
                  </label>
                  <div className="relative">
                    <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${labelColor}`} />
                    <input
                      type="text"
                      placeholder="Your name"
                      value={signUpName}
                      onChange={e => setSignUpName(e.target.value)}
                      className={`${inputClass} pl-9`}
                      required
                      minLength={2}
                    />
                  </div>
                </div>

                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider mb-1.5 block ${labelColor}`}>
                    Email
                  </label>
                  <div className="relative">
                    <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${labelColor}`} />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={signUpEmail}
                      onChange={e => setSignUpEmail(e.target.value)}
                      className={`${inputClass} pl-9`}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider mb-1.5 block ${labelColor}`}>
                    Username
                  </label>
                  <div className="relative">
                    <AtSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${labelColor}`} />
                    <input
                      type="text"
                      placeholder="yourhandle"
                      value={signUpUsername}
                      onChange={e => setSignUpUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                      className={`${inputClass} pl-9`}
                      required
                      minLength={3}
                      maxLength={32}
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider mb-1.5 block ${labelColor}`}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${labelColor}`} />
                    <input
                      type={showSignUpPwd ? "text" : "password"}
                      placeholder="Min 8 characters"
                      value={signUpPassword}
                      onChange={e => setSignUpPassword(e.target.value)}
                      className={`${inputClass} pl-9 pr-10`}
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPwd(v => !v)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${labelColor}`}
                    >
                      {showSignUpPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider mb-1.5 block ${labelColor}`}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${labelColor}`} />
                    <input
                      type="password"
                      placeholder="Repeat password"
                      value={signUpConfirm}
                      onChange={e => setSignUpConfirm(e.target.value)}
                      className={`${inputClass} pl-9`}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <button type="submit" className={btnClass} disabled={registerMut.isPending}>
                  {registerMut.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  {registerMut.isPending ? "Creating Account..." : "Create Account"}
                </button>

                <p className={`text-center text-xs ${labelColor}`}>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setTab("signin")}
                    className={`font-bold underline ${isDark ? "text-white" : "text-black"}`}
                  >
                    Sign in
                  </button>
                </p>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
