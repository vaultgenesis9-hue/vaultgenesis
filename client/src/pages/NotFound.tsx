import { Home } from "lucide-react";
import { useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";

export default function NotFound() {
  const [, setLocation] = useLocation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center ${isDark ? 'bg-black' : 'bg-[#fafaf8]'}`}>
      <div className={`w-full max-w-sm mx-4 rounded-2xl border p-10 text-center ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/10'}`}>
        <div className="text-6xl mb-4">🔒</div>
        <h1 className={`text-7xl font-black uppercase tracking-tighter mb-2 ${isDark ? 'text-white' : 'text-black'}`}>404</h1>
        <h2 className={`text-lg font-black uppercase tracking-wider mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Page Not Found
        </h2>
        <p className={`text-xs mb-8 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          The page you are looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={handleGoHome}
          className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
            isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          <Home className="w-3 h-3 inline mr-2" />
          Go Home
        </button>
      </div>
    </div>
  );
}
