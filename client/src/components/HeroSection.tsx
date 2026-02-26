import PartnersCarousel from './PartnersCarousel';
import ScrollIndicator from './ScrollIndicator';

export default function HeroSection() {
  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden">
      {/* Background - pure black */}
      <div className="absolute inset-0 bg-black"></div>
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-black/10"></div>
      
      {/* Radial gradient glow effects - extending into navbar */}
      <div className="absolute rounded-full" style={{
        top: '-300px',
        left: '-100px',
        width: '600px',
        height: '800px',
        background: 'radial-gradient(rgba(255, 255, 255, 0.3) 0%, rgba(0, 0, 0, 0) 70%)',
        filter: 'blur(80px)',
        opacity: 0.6,
        pointerEvents: 'none'
      }}></div>
      <div className="absolute rounded-full" style={{
        top: '-150px',
        left: '200px',
        width: '400px',
        height: '600px',
        background: 'radial-gradient(rgba(255, 255, 255, 0.3) 0%, rgba(0, 0, 0, 0) 70%)',
        filter: 'blur(80px)',
        opacity: 0.6,
        pointerEvents: 'none'
      }}></div>
      <div className="absolute rounded-full" style={{
        top: '-100px',
        right: '100px',
        width: '500px',
        height: '700px',
        background: 'radial-gradient(rgba(255, 255, 255, 0.25) 0%, rgba(0, 0, 0, 0) 70%)',
        filter: 'blur(80px)',
        opacity: 0.5,
        pointerEvents: 'none'
      }}></div>
      <div className="absolute rounded-full" style={{
        top: '100px',
        right: '200px',
        width: '450px',
        height: '600px',
        background: 'radial-gradient(rgba(255, 255, 255, 0.2) 0%, rgba(0, 0, 0, 0) 70%)',
        filter: 'blur(80px)',
        opacity: 0.4,
        pointerEvents: 'none'
      }}></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 text-center h-[calc(100vh-64px)]">
        {/* Main heading */}
        <h1 className="text-8xl md:text-9xl text-white mb-4 tracking-tight leading-none">
          <span className="font-black">VAULT</span>
          <br />
          <span className="font-light text-gray-400">GENESIS</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xs md:text-sm text-gray-300 mb-8 max-w-2xl">
          Launch your meme coin, stake tokens, and trade with AI-powered bots
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-1 mb-8">
          <button className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition uppercase text-sm">
            CONNECT WALLET
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row gap-4 text-center mb-6">
          <div>
            <p className="text-sm md:text-base font-bold text-white">314+</p>
            <p className="text-gray-400 text-xs uppercase tracking-wider">Tokens Launched</p>
          </div>
          <div>
            <p className="text-sm md:text-base font-bold text-white">$2.4M+</p>
            <p className="text-gray-400 text-xs uppercase tracking-wider">Total Volume</p>
          </div>
          <div>
            <p className="text-sm md:text-base font-bold text-white">1,200+</p>
            <p className="text-gray-400 text-xs uppercase tracking-wider">Active Users</p>
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
