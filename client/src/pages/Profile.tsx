import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import WalletModal from "@/components/WalletModal";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { User, Mail, Wallet, Save, CheckCircle, Loader2 } from "lucide-react";
import { useAccount } from "wagmi";

export default function Profile() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user, loading, isAuthenticated } = useAuth();
  const { isConnected, address: connectedAddress } = useAccount();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [saved, setSaved] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  // Pre-fill form with existing data when user loads
  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
      setWalletAddress((user as Record<string, unknown>).walletAddress as string ?? connectedAddress ?? "");
    } else if (connectedAddress && !walletAddress) {
      setWalletAddress(connectedAddress);
    }
  }, [user, connectedAddress]);

  const updateProfile = trpc.users.updateProfile.useMutation({
    onSuccess: () => {
      setSaved(true);
      toast.success("Profile saved successfully");
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSave = () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedWallet = walletAddress.trim();

    if (!trimmedName) { toast.error("Name is required"); return; }
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error("Please enter a valid email address"); return;
    }

    updateProfile.mutate({
      name: trimmedName || undefined,
      email: trimmedEmail || undefined,
      walletAddress: trimmedWallet || undefined,
    });
  };

  const bg = isDark ? "bg-black" : "bg-[#fafaf8]";
  const cardBg = isDark ? "bg-[#111] border-white/10" : "bg-white border-black/10";
  const labelClass = `text-xs font-bold uppercase tracking-widest ${isDark ? "text-gray-500" : "text-gray-400"}`;
  const inputClass = `w-full rounded-xl border px-4 py-2.5 text-sm font-medium outline-none transition-all ${
    isDark
      ? "bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-white/30"
      : "bg-black/5 border-black/10 text-black placeholder-gray-400 focus:border-black/30"
  }`;

  if (loading) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center`}>
        <Loader2 className={`w-6 h-6 animate-spin ${isDark ? "text-white" : "text-black"}`} />
      </div>
    );
  }

  // Show connect wallet prompt if wallet is not connected
  if (!isAuthenticated && !isConnected) {
    return (
      <div className={`min-h-screen ${bg} flex flex-col`}>
        <Navbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className={`w-full max-w-sm rounded-2xl border p-8 text-center ${cardBg}`}>
            <Wallet className={`w-10 h-10 mx-auto mb-4 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
            <h2 className={`text-xl font-black uppercase tracking-tighter mb-2 ${isDark ? "text-white" : "text-black"}`}>
              Connect Your Wallet
            </h2>
            <p className={`text-xs mb-6 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
              Connect your wallet to view and edit your profile.
            </p>
            <button
              onClick={() => setWalletModalOpen(true)}
              className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-center transition-all ${
                isDark ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              Connect Wallet
            </button>
          </div>
        </div>
        <WalletModal isOpen={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} flex flex-col`}>
      <Navbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-black uppercase tracking-tighter ${isDark ? "text-white" : "text-black"}`}>
            My Profile
          </h1>
          <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
            Update your name and contact details. This information helps our support team assist you.
          </p>
        </div>

        {/* Profile Card */}
        <div className={`rounded-2xl border p-6 space-y-5 ${cardBg}`}>
          {/* Avatar row */}
          <div className="flex items-center gap-4 pb-5 border-b border-inherit">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-black ${
              isDark ? "bg-white/10 text-white" : "bg-black/10 text-black"
            }`}>
              {(name || user?.name || "?")[0]?.toUpperCase()}
            </div>
            <div>
              <p className={`font-black text-sm ${isDark ? "text-white" : "text-black"}`}>
                {name || user?.name || "Anonymous"}
              </p>
              <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                {user?.openId ? `ID: ${user.openId.slice(0, 12)}...` : ""}
              </p>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className={labelClass}>
              <User className="w-3 h-3 inline mr-1" /> Full Name
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your full name"
              className={inputClass}
              maxLength={64}
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className={labelClass}>
              <Mail className="w-3 h-3 inline mr-1" /> Email Address
            </label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email address"
              type="email"
              className={inputClass}
              maxLength={128}
            />
            <p className={`text-xs ${isDark ? "text-gray-600" : "text-gray-400"}`}>
              Used for account recovery and support communications.
            </p>
          </div>

          {/* Wallet Address */}
          <div className="space-y-1.5">
            <label className={labelClass}>
              <Wallet className="w-3 h-3 inline mr-1" /> Wallet Address
            </label>
            <input
              value={walletAddress}
              onChange={e => setWalletAddress(e.target.value)}
              placeholder="0x... (optional)"
              className={`${inputClass} font-mono`}
              maxLength={64}
            />
            <p className={`text-xs ${isDark ? "text-gray-600" : "text-gray-400"}`}>
              Your primary wallet address for transactions and support.
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <Button
              onClick={handleSave}
              disabled={updateProfile.isPending || saved}
              className={`w-full py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${
                saved
                  ? "bg-green-500 text-white"
                  : isDark
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {updateProfile.isPending ? (
                <><Loader2 className="w-3 h-3 mr-2 animate-spin" /> Saving...</>
              ) : saved ? (
                <><CheckCircle className="w-3 h-3 mr-2" /> Saved</>
              ) : (
                <><Save className="w-3 h-3 mr-2" /> Save Profile</>
              )}
            </Button>
          </div>
        </div>

        {/* Info box */}
        <div className={`mt-4 rounded-xl border p-4 ${isDark ? "bg-white/3 border-white/5" : "bg-black/3 border-black/5"}`}>
          <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>
            <strong className={isDark ? "text-gray-300" : "text-gray-700"}>Why do we collect this?</strong>{" "}
            Your name and email are stored securely and used only to help our support team identify and assist your account.
            This information is never shared with third parties.
          </p>
        </div>
      </main>
    </div>
  );
}
