import Navbar from "@/components/Navbar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

export default function TokenCreator() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    description: "",
    decimals: "9",
    initialSupply: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.symbol || !formData.initialSupply) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success(`Token "${formData.name}" created successfully!`);
    setFormData({ name: "", symbol: "", description: "", decimals: "9", initialSupply: "" });
  };

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
          <div className="max-w-2xl mx-auto">
            <h1 className={`text-5xl sm:text-6xl md:text-7xl font-black mb-4 uppercase tracking-tighter ${isDark ? 'text-white' : 'text-black'}`}>CREATE TOKEN</h1>
            <p className={`text-sm sm:text-base md:text-lg mb-12 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Launch your meme coin in seconds. No coding required.
            </p>

            <Card className={`p-6 sm:p-8 rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white/50 border-gray-300'} backdrop-blur-sm mb-6`}>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className={`block text-xs sm:text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    Token Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Doge Moon"
                    value={formData.name}
                    onChange={handleChange}
                    className={`text-sm ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'}`}
                  />
                </div>

                <div>
                  <Label htmlFor="symbol" className={`block text-xs sm:text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    Token Symbol *
                  </Label>
                  <Input
                    id="symbol"
                    name="symbol"
                    placeholder="e.g., DMOON"
                    maxLength={6}
                    value={formData.symbol}
                    onChange={handleChange}
                    className={`text-sm ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'}`}
                  />
                </div>

                <div>
                  <Label htmlFor="description" className={`block text-xs sm:text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    Description
                  </Label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Tell us about your token..."
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-gray-600' : 'bg-white border-gray-300 text-black placeholder-gray-400 focus:ring-gray-300'}`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="decimals" className={`block text-xs sm:text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      Decimals
                    </Label>
                    <Input
                      id="decimals"
                      name="decimals"
                      type="number"
                      min="0"
                      max="18"
                      value={formData.decimals}
                      onChange={handleChange}
                      className={`text-sm ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'}`}
                    />
                  </div>

                  <div>
                    <Label htmlFor="initialSupply" className={`block text-xs sm:text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      Initial Supply *
                    </Label>
                    <Input
                      id="initialSupply"
                      name="initialSupply"
                      type="number"
                      placeholder="e.g., 1000000"
                      value={formData.initialSupply}
                      onChange={handleChange}
                      className={`text-sm ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'}`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 px-4 rounded-lg font-semibold uppercase text-sm transition-all ${
                    isDark
                      ? 'bg-white text-black hover:bg-gray-200'
                      : 'bg-black text-white hover:bg-gray-900'
                  }`}
                >
                  CREATE TOKEN
                </button>
              </form>
            </Card>

            <Card className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white/50 border-gray-300'} backdrop-blur-sm`}>
              <h3 className={`font-bold text-base sm:text-lg mb-4 uppercase tracking-wider ${isDark ? 'text-white' : 'text-black'}`}>What happens next?</h3>
              <ul className={`space-y-2 text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>✓ Your token will be deployed to the blockchain</li>
                <li>✓ You'll receive the token contract address</li>
                <li>✓ You can then set up presale or staking</li>
                <li>✓ Share your token with the community</li>
              </ul>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
