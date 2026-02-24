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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 hover:opacity-80 transition"
        >
          <img src={LOGO_URL} alt="VaultGenesis" className="h-8 w-auto" />
        </button>

        {/* Connect Wallet Button - Desktop */}
        <button className="hidden md:block px-6 py-2 bg-white text-black font-bold rounded hover:bg-gray-200 transition uppercase text-sm">
          CONNECT WALLET
        </button>

        {/* Hamburger Menu */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black border-t border-white/10">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => {
                  navigate(link.href);
                  setMobileMenuOpen(false);
                }}
                className="text-white text-left font-bold hover:text-gray-300 transition uppercase text-sm"
              >
                {link.label}
              </button>
            ))}
            <button className="w-full px-6 py-2 bg-white text-black font-bold rounded hover:bg-gray-200 transition uppercase text-sm mt-4">
              CONNECT WALLET
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
