import PartnersCarousel from './PartnersCarousel';
import ScrollIndicator from './ScrollIndicator';
import { useTheme } from '@/contexts/ThemeContext';
import { useEffect, useState } from 'react';
import WalletModal from './WalletModal';
import AuthModal from './AuthModal';
import { useWallet } from '@/hooks/useWallet';
import { trpc } from '@/lib/trpc';

export default function HeroSection() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isAnimating, setIsAnimating] = useState(true);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const { isConnected, shortAddress } = useWallet();
  const { data: sessionUser } = trpc.auth.me.useQuery();

  useEffect(() => {
    // Animation completes after 2.5 seconds
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const isEmailUser = sessionUser && sessionUser.loginMethod === 'email';
  const displayName = sessionUser?.name || sessionUser?.username || sessionUser?.email?.split('@')[0];

  return (
    <div className={`relative w-full min-h-screen overflow-hidden ${isDark ? 'bg-black' : 'bg-[#fafaf8]'}`}>
      {/* Solid background */}
      <div className={`absolute inset-0`} style={{ zIndex: 1 }}></div>
      
      {/* Radial gradient glow effects - extending into navbar */}
      <div className="absolute rounded-full animate-float-glow-1" style={{
        width: '600px',
        height: '800px',
        background: isDark 
          ? 'radial-gradient(rgba(255, 255, 255, 0.3) 0%, rgba(0, 0, 0, 0) 70%)'
          : 'radial-gradient(rgba(80, 80, 80, 0.4) 0%, rgba(250, 250, 248, 0) 70%)',
        filter: 'blur(80px)',
        opacity: isDark ? 0.6 : 0.8,
        pointerEvents: 'none'
      }}></div>
      <div className="absolute rounded-full animate-float-glow-2" style={{
        width: '400px',
        height: '600px',
        background: isDark 
          ? 'radial-gradient(rgba(255, 255, 255, 0.3) 0%, rgba(0, 0, 0, 0) 70%)'
          : 'radial-gradient(rgba(80, 80, 80, 0.4) 0%, rgba(250, 250, 248, 0) 70%)',
        filter: 'blur(80px)',
        opacity: isDark ? 0.6 : 0.8,
        pointerEvents: 'none'
      }}></div>
      <div className="absolute rounded-full animate-float-glow-3" style={{
        width: '500px',
        height: '700px',
        background: isDark 
          ? 'radial-gradient(rgba(255, 255, 255, 0.25) 0%, rgba(0, 0, 0, 0) 70%)'
          : 'radial-gradient(rgba(80, 80, 80, 0.35) 0%, rgba(250, 250, 248, 0) 70%)',
        filter: 'blur(80px)',
        opacity: isDark ? 0.5 : 0.75,
        pointerEvents: 'none'
      }}></div>
      <div className="absolute rounded-full animate-float-glow-4" style={{
        width: '450px',
        height: '600px',
        background: isDark 
          ? 'radial-gradient(rgba(255, 255, 255, 0.2) 0%, rgba(0, 0, 0, 0) 70%)'
          : 'radial-gradient(rgba(80, 80, 80, 0.3) 0%, rgba(250, 250, 248, 0) 70%)',
        filter: 'blur(80px)',
        opacity: isDark ? 0.4 : 0.7,
        pointerEvents: 'none'
      }}></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 text-center h-[calc(100vh-64px)]">
        {/* Main heading with shatter animation */}
        <h1 className={`text-5xl sm:text-6xl md:text-8xl lg:text-9xl mb-4 tracking-tight leading-none ${isAnimating ? 'shatter-text' : ''} ${isDark ? 'text-white' : 'text-black'}`}>
          <span className="font-black">VAULT</span>
          <br />
          <span className={`font-light ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>GENESIS</span>
        </h1>

        {/* Subtitle */}
        <p className={`text-xs sm:text-sm md:text-base mb-8 max-w-2xl ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Launch your meme coin, stake tokens, and trade with AI-powered bots
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 mb-8">
          {/* Wallet button */}
          <button
            onClick={() => setWalletModalOpen(true)}
            className={`px-6 py-2 font-semibold rounded-full uppercase text-xs tracking-wider border-2 transition-all duration-300 ${
              isDark 
                ? 'bg-white text-black border-white hover:bg-transparent hover:text-white'
                : 'bg-black text-white border-black hover:bg-transparent hover:text-black'
            }`}>
            {isConnected && shortAddress ? shortAddress : 'CONNECT WALLET'}
          </button>

          {/* Sign In / user greeting — only show if not wallet-connected */}
          {!isConnected && (
            isEmailUser ? (
              <button
                onClick={() => window.location.href = '/profile'}
                className={`px-6 py-2 font-semibold rounded-full uppercase text-xs tracking-wider border-2 transition-all duration-300 ${
                  isDark
                    ? 'border-white/30 text-white hover:bg-white/10'
                    : 'border-black/30 text-black hover:bg-black/10'
                }`}>
                👤 {displayName ?? 'My Account'}
              </button>
            ) : (
              <button
                onClick={() => { setAuthTab('signin'); setAuthModalOpen(true); }}
                className={`px-6 py-2 font-semibold rounded-full uppercase text-xs tracking-wider border-2 transition-all duration-300 ${
                  isDark
                    ? 'border-white/30 text-white hover:bg-white/10'
                    : 'border-black/30 text-black hover:bg-black/10'
                }`}>
                SIGN IN / SIGN UP
              </button>
            )
          )}
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-center mb-6">
          <div>
            <p className={`text-xs sm:text-sm md:text-base font-bold ${isDark ? 'text-white' : 'text-black'}`}>314+</p>
            <p className={`text-[10px] sm:text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tokens Launched</p>
          </div>
          <div>
            <p className={`text-xs sm:text-sm md:text-base font-bold ${isDark ? 'text-white' : 'text-black'}`}>$2.4M+</p>
            <p className={`text-[10px] sm:text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Volume</p>
          </div>
          <div>
            <p className={`text-xs sm:text-sm md:text-base font-bold ${isDark ? 'text-white' : 'text-black'}`}>1,200+</p>
            <p className={`text-[10px] sm:text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Active Users</p>
          </div>
        </div>

        {/* Partners Carousel */}
        <PartnersCarousel />

        {/* Scroll Indicator */}
        <ScrollIndicator />
      </div>

      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authTab}
      />
    </div>
  );
}
