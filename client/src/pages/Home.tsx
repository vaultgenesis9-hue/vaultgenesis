import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import VideoExplainer from "@/components/VideoExplainer";
import { useTheme } from "@/contexts/ThemeContext";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-black' : 'bg-[#fafaf8]'}`}>
      <Navbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <HeroSection />
      <VideoExplainer />
      <HowItWorks />
    </div>
  );
}
