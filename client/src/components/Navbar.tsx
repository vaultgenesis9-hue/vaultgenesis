import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface NavbarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const LOGO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663061635487/ESNvsZAfVRrpKtvv.png";

const navLinks = [
  { label: "TOKEN CREATOR", href: "/token-creator" },
  { label: "PRESALE", href: "/presale" },
  { label: "STAKING", href: "/staking" },
  { label: "WALLET", href: "/wallet" },
  { label: "BOT TRADING", href: "/bot-trading" },
];

export default function Navbar({ mobileMenuOpen, setMobileMenuOpen }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img src={LOGO_URL} alt="VaultGenesis" className="h-8 md:h-10 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <a className="text-xs font-bold text-foreground hover:text-accent transition-colors uppercase tracking-wider">
                {link.label}
              </a>
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Button className="bg-foreground text-background hover:bg-accent font-bold text-sm uppercase">
            CONNECT WALLET
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-foreground hover:text-accent transition-colors"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <div className="container py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <a
                  className="block text-sm font-bold text-foreground hover:text-accent transition-colors py-2 uppercase tracking-wider"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              </Link>
            ))}
            <Button className="w-full mt-4 bg-foreground text-background hover:bg-accent font-bold uppercase">
              CONNECT WALLET
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
