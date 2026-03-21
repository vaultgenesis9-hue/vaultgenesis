import { useState } from "react";
import { Menu, X, Wallet, Sun, Moon, LogOut, User, MailWarning } from "lucide-react";
import { useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import WalletModal from "./WalletModal";
import AuthModal from "./AuthModal";
import { trpc } from "@/lib/trpc";
import { useAccount } from "wagmi";
import { toast } from "sonner";

const LOGO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663061635487/ESNvsZAfVRrpKtvv.png";

interface NavbarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const navLinks = [
  { label: "TOKEN CREATOR", href: "/token-creator" },
  { label: "PRESALE", href: "/presale" },
  { label: "STAKING", href: "/staking" },
  { label: "WALLET", href: "/wallet" },
  { label: "MY PROFILE", href: "/profile" },
];

export default function Navbar({ mobileMenuOpen, setMobileMenuOpen }: NavbarProps) {
  const [, navigate] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin");

  const { isConnected } = useAccount();
  const { data: sessionUser } = trpc.auth.me.useQuery();
  const utils = trpc.useUtils();

  const logoutMut = trpc.auth.logout.useMutation({
    onSuccess: () => {
      // Immediately clear the cached user so the navbar updates right away
      utils.auth.me.setData(undefined, null);
      utils.auth.me.invalidate();
      toast.info("Signed out");
      // Navigate to home page after a short delay
      setTimeout(() => {
        navigate("/");
        window.location.href = "/";
      }, 300);
    },
  });

  const openSignIn = () => {
    setAuthTab("signin");
    setAuthModalOpen(true);
  };

  const openSignUp = () => {
    setAuthTab("signup");
    setAuthModalOpen(true);
  };

  // Determine display name for session user
  const displayName = sessionUser?.name || sessionUser?.username || sessionUser?.email?.split("@")[0];
  // Show user pill if any session user is logged in
  const isLoggedIn = !!sessionUser;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 relative ${theme === "dark" ? "bg-black" : "bg-[#fafaf8]"}`} style={{
        background: theme === "dark"
          ? 'radial-gradient(ellipse 800px 400px at 50% 0%, rgba(255, 255, 255, 0.15) 0%, rgba(0, 0, 0, 0) 70%), rgb(0, 0, 0)'
          : 'radial-gradient(ellipse 800px 400px at 50% 0%, rgba(0, 0, 0, 0.1) 0%, rgba(255, 255, 255, 0) 70%), rgb(250, 250, 248)',
        boxShadow: theme === "dark" ? 'inset 0 -20px 40px -20px rgba(0, 0, 0, 0.5)' : 'inset 0 -20px 40px -20px rgba(0, 0, 0, 0.05)'
      }}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <img src={LOGO_URL} alt="VaultGenesis" className={`h-14 w-auto ${theme === "light" ? "brightness-0" : ""}`} />
          </button>

          {/* Right side icons */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button className="p-2 hover:opacity-70 transition" onClick={toggleTheme}>
              {theme === "dark" ? <Sun size={22} className="text-white" /> : <Moon size={22} className="text-black" />}
            </button>

            {/* Wallet icon — always visible */}
            <button
              className="p-2 hover:opacity-70 transition"
              onClick={() => setWalletModalOpen(true)}
              title="Connect Wallet"
            >
              <Wallet size={22} className={isConnected ? "text-green-400" : (theme === "dark" ? "text-white" : "text-black")} />
            </button>

            {/* Auth state: show user pill or Sign In button */}
            {isLoggedIn ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigate("/dashboard")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    theme === "dark"
                      ? "bg-white/10 text-white hover:bg-white/20"
                      : "bg-black/10 text-black hover:bg-black/20"
                  }`}
                  title={displayName ?? "Profile"}
                >
                  <User size={14} />
                  <span className="max-w-[80px] truncate">{displayName}</span>
                  {sessionUser && !sessionUser.emailVerified && sessionUser.loginMethod === 'email' && (
                    <span title="Email not verified">
                      <MailWarning size={13} className="text-yellow-400 shrink-0" />
                    </span>
                  )}
                </button>
                <button
                  onClick={() => logoutMut.mutate()}
                  className={`p-1.5 rounded-xl transition-all ${
                    theme === "dark"
                      ? "text-gray-500 hover:text-white hover:bg-white/10"
                      : "text-gray-400 hover:text-black hover:bg-black/10"
                  }`}
                  title="Sign Out"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : !isConnected ? (
              <button
                onClick={openSignIn}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  theme === "dark"
                    ? "border border-white/20 text-white hover:bg-white/10"
                    : "border border-black/20 text-black hover:bg-black/10"
                }`}
              >
                Sign In
              </button>
            ) : null}

            {/* Hamburger */}
            <button
              className={`p-2 hover:bg-white/10 rounded transition ${theme === "dark" ? "text-white" : "text-black"}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Slides Down */}
        {mobileMenuOpen && (
          <div className="animate-in fade-in slide-in-from-top-2" style={{
            background: theme === "dark"
              ? 'radial-gradient(ellipse 800px 400px at 50% 0%, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 70%), rgb(0, 0, 0)'
              : 'radial-gradient(ellipse 800px 400px at 50% 0%, rgba(0, 0, 0, 0.1) 0%, rgba(255, 255, 255, 0) 70%), rgb(250, 250, 248)'
          }}>
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => {
                    navigate(link.href);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left font-semibold transition uppercase text-xs tracking-wider py-2 ${theme === "dark" ? "text-white hover:text-gray-300" : "text-black hover:text-gray-600"}`}
                >
                  {link.label}
                </button>
              ))}

              {/* Mobile auth actions */}
              <div className={`border-t pt-4 flex flex-col gap-2 ${theme === "dark" ? "border-white/10" : "border-black/10"}`}>
                {isLoggedIn ? (
                  <>
                    <button
                      onClick={() => { navigate("/profile"); setMobileMenuOpen(false); }}
                      className={`text-left font-semibold transition uppercase text-xs tracking-wider py-2 ${theme === "dark" ? "text-white hover:text-gray-300" : "text-black hover:text-gray-600"}`}
                    >
                      👤 {displayName ?? "My Account"}
                    </button>
                    <button
                      onClick={() => { logoutMut.mutate(); setMobileMenuOpen(false); }}
                      className={`text-left font-semibold transition uppercase text-xs tracking-wider py-2 text-red-500 hover:text-red-400`}
                    >
                      Sign Out
                    </button>
                  </>
                ) : !isConnected ? (
                  <>
                    <button
                      onClick={() => { openSignIn(); setMobileMenuOpen(false); }}
                      className={`text-left font-semibold transition uppercase text-xs tracking-wider py-2 ${theme === "dark" ? "text-white hover:text-gray-300" : "text-black hover:text-gray-600"}`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => { openSignUp(); setMobileMenuOpen(false); }}
                      className={`text-left font-semibold transition uppercase text-xs tracking-wider py-2 ${theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-black"}`}
                    >
                      Create Account
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Wallet Modal */}
      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authTab}
        onSuccess={() => navigate("/dashboard")}
      />
    </>
  );
}
