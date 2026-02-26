import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useLocation } from "wouter";

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
  { label: "BOT TRADING", href: "/bot-trading" },
];

export default function Navbar({ mobileMenuOpen, setMobileMenuOpen }: NavbarProps) {
  const [, navigate] = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black relative" style={{
      background: 'radial-gradient(ellipse 800px 400px at 50% 0%, rgba(255, 255, 255, 0.15) 0%, rgba(0, 0, 0, 0) 70%), rgb(0, 0, 0)'
    }}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 hover:opacity-80 transition"
        >
          <img src={LOGO_URL} alt="VaultGenesis" className="h-12 w-auto" />
        </button>

        {/* Hamburger Menu Icon - Always Visible */}
        <div className="flex items-center gap-4">
          <button className="px-6 py-2 bg-white text-black font-bold hover:bg-gray-200 transition uppercase text-sm">
            CONNECT WALLET
          </button>
          <button
            className="text-white p-2 hover:bg-white/10 rounded transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Slides Down */}
      {mobileMenuOpen && (
        <div className="bg-black animate-in fade-in slide-in-from-top-2">
          <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => {
                  navigate(link.href);
                  setMobileMenuOpen(false);
                }}
                className="text-white text-left font-bold hover:text-gray-300 transition uppercase text-sm py-2"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
