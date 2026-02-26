import PartnersCarousel from './PartnersCarousel';
import ScrollIndicator from './ScrollIndicator';
import { useTheme } from '@/contexts/ThemeContext';

export default function HeroSection() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`relative w-full min-h-screen overflow-hidden ${isDark ? 'bg-black' : 'bg-[#fafaf8]'}`}>
      {/* Background */}
      <div className={`absolute inset-0 ${isDark ? 'bg-black' : 'bg-[#fafaf8]'}`}></div>
      {/* Gradient overlay for depth */}
      <div className={`absolute inset-0 ${isDark ? 'bg-black/10' : 'bg-white/10'}`}></div>
      
      {/* Radial gradient glow effects - extending into navbar */}
      <div className="absolute rounded-full animate-float-glow-1" style={{
        width: '600px',
        height: '800px',
        background: isDark 
          ? 'radial-gradient(rgba(255, 255, 255, 0.3) 0%, rgba(0, 0, 0, 0) 70%)'
          : 'radial-gradient(rgba(100, 100, 100, 0.25) 0%, rgba(250, 250, 248, 0) 70%)',
        filter: 'blur(80px)',
        opacity: isDark ? 0.6 : 0.5,
        pointerEvents: 'none'
      }}></div>
      <div className="absolute rounded-full animate-float-glow-2" style={{
        width: '400px',
        height: '600px',
        background: isDark 
          ? 'radial-gradient(rgba(255, 255, 255, 0.3) 0%, rgba(0, 0, 0, 0) 70%)'
          : 'radial-gradient(rgba(100, 100, 100, 0.25) 0%, rgba(250, 250, 248, 0) 70%)',
        filter: 'blur(80px)',
        opacity: isDark ? 0.6 : 0.5,
        pointerEvents: 'none'
      }}></div>
      <div className="absolute rounded-full animate-float-glow-3" style={{
        width: '500px',
        height: '700px',
        background: isDark 
          ? 'radial-gradient(rgba(255, 255, 255, 0.25) 0%, rgba(0, 0, 0, 0) 70%)'
          : 'radial-gradient(rgba(80, 80, 80, 0.2) 0%, rgba(250, 250, 248, 0) 70%)',
        filter: 'blur(80px)',
        opacity: isDark ? 0.5 : 0.4,
        pointerEvents: 'none'
      }}></div>
      <div className="absolute rounded-full animate-float-glow-4" style={{
        width: '450px',
        height: '600px',
        background: isDark 
          ? 'radial-gradient(rgba(255, 255, 255, 0.2) 0%, rgba(0, 0, 0, 0) 70%)'
          : 'radial-gradient(rgba(80, 80, 80, 0.15) 0%, rgba(250, 250, 248, 0) 70%)',
        filter: 'blur(80px)',
        opacity: isDark ? 0.4 : 0.35,
        pointerEvents: 'none'
      }}></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 text-center h-[calc(100vh-64px)]">
        {/* Main heading */}
        <h1 className={`text-8xl md:text-9xl mb-4 tracking-tight leading-none ${isDark ? 'text-white' : 'text-black'}`}>
          <span className="font-black">VAULT</span>
          <br />
          <span className={`font-light ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>GENESIS</span>
        </h1>

        {/* Subtitle */}
        <p className={`text-xs md:text-sm mb-8 max-w-2xl ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Launch your meme coin, stake tokens, and trade with AI-powered bots
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-1 mb-8">
          <button className={`px-8 py-3 font-bold rounded-full uppercase text-sm border-2 transition-all duration-300 ${
            isDark 
              ? 'bg-white text-black border-white hover:bg-transparent hover:text-white'
              : 'bg-black text-white border-black hover:bg-transparent hover:text-black'
          }`}>
            CONNECT WALLET
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row gap-4 text-center mb-6">
          <div>
            <p className={`text-sm md:text-base font-bold ${isDark ? 'text-white' : 'text-black'}`}>314+</p>
            <p className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tokens Launched</p>
          </div>
          <div>
            <p className={`text-sm md:text-base font-bold ${isDark ? 'text-white' : 'text-black'}`}>$2.4M+</p>
            <p className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Volume</p>
          </div>
          <div>
            <p className={`text-sm md:text-base font-bold ${isDark ? 'text-white' : 'text-black'}`}>1,200+</p>
            <p className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Active Users</p>
          </div>
        </div>

        {/* Partners Carousel */}
        <PartnersCarousel />
      </div>
      
      {/* Scroll Indicator */}
      <ScrollIndicator />
    </div>
  );
}
