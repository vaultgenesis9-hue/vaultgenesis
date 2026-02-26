import Navbar from "@/components/Navbar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";

export default function Admin() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const stats = [
    { label: "Total Users", value: "1,234" },
    { label: "Tokens Created", value: "314" },
    { label: "Total Volume", value: "$2.4M" },
    { label: "Active Bots", value: "89" },
  ];

  const adminActions = [
    { title: "User Management", description: "View and manage platform users" },
    { title: "Transaction Monitoring", description: "Monitor all platform transactions" },
    { title: "Token Management", description: "Manage created tokens" },
    { title: "Platform Settings", description: "Configure platform settings" },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-[#fafaf8]'} relative overflow-hidden`}>
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute rounded-full animate-float-glow-1" style={{
          width: '600px',
          height: '800px',
          background: isDark 
            ? 'radial-gradient(rgba(255, 255, 255, 0.3) 0%, rgba(0, 0, 0, 0) 70%)'
            : 'radial-gradient(rgba(80, 80, 80, 0.4) 0%, rgba(250, 250, 248, 0) 70%)',
          filter: 'blur(80px)',
          opacity: isDark ? 0.6 : 0.8,
        }}></div>
        <div className="absolute rounded-full animate-float-glow-2" style={{
          width: '400px',
          height: '600px',
          background: isDark 
            ? 'radial-gradient(rgba(255, 255, 255, 0.3) 0%, rgba(0, 0, 0, 0) 70%)'
            : 'radial-gradient(rgba(80, 80, 80, 0.4) 0%, rgba(250, 250, 248, 0) 70%)',
          filter: 'blur(80px)',
          opacity: isDark ? 0.6 : 0.8,
        }}></div>
      </div>

      <Navbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <main className="relative z-10 pt-24 pb-20">
        <div className="container mx-auto px-4">
          <h1 className={`text-5xl sm:text-6xl md:text-7xl font-black mb-4 uppercase tracking-tighter ${isDark ? 'text-white' : 'text-black'}`}>ADMIN DASHBOARD</h1>
          <p className={`text-sm sm:text-base md:text-lg mb-12 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Manage the VaultGenesis platform</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {stats.map((stat) => (
              <Card key={stat.label} className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white/50 border-gray-300'} backdrop-blur-sm`}>
                <p className={`text-xs sm:text-sm uppercase font-bold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
                <p className={`text-2xl sm:text-3xl font-black ${isDark ? 'text-white' : 'text-black'}`}>{stat.value}</p>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminActions.map((action) => (
              <Card key={action.title} className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white/50 border-gray-300'} backdrop-blur-sm`}>
                <h2 className={`text-lg sm:text-xl font-black mb-4 uppercase tracking-wider ${isDark ? 'text-white' : 'text-black'}`}>{action.title}</h2>
                <p className={`text-xs sm:text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{action.description}</p>
                <button className={`w-full py-2 px-4 rounded-lg font-semibold uppercase text-xs sm:text-sm transition-all ${
                  isDark
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'bg-black text-white hover:bg-gray-900'
                }`}>
                  {action.title === "User Management" && "Manage Users"}
                  {action.title === "Transaction Monitoring" && "View Transactions"}
                  {action.title === "Token Management" && "Manage Tokens"}
                  {action.title === "Platform Settings" && "Settings"}
                </button>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
