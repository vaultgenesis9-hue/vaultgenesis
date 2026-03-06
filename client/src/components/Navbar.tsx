import { useState } from "react";
import { Menu, X, Wallet, Sun, Moon } from "lucide-react";
import { useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";

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

  return (
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

        {/* Hamburger Menu Icon - Always Visible */}
        <div className="flex items-center gap-4">
          <button className="p-2 hover:opacity-70 transition" onClick={toggleTheme}>
            {theme === "dark" ? <Sun size={24} className="text-white" /> : <Moon size={24} className="text-black" />}
          </button>
          <button className="p-2 hover:opacity-70 transition">
            <Wallet size={24} className={theme === "dark" ? "text-white" : "text-black"} />
          </button>
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
          </div>
        </div>
      )}
    </nav>
  );
}
