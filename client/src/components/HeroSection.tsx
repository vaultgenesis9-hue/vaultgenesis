export default function HeroSection() {
  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden">
      {/* Background - pure black */}
      <div className="absolute inset-0 bg-black"></div>
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-black/10"></div>
      
      {/* Radial gradient glow effects - exact MoonLaunch positioning */}
      <div className="absolute rounded-full" style={{
        top: '-500px',
        left: '-100px',
        width: '600px',
        height: '800px',
        background: 'radial-gradient(rgba(255, 255, 255, 0.3) 0%, rgba(0, 0, 0, 0) 70%)',
        filter: 'blur(80px)',
        opacity: 0.6,
        pointerEvents: 'none'
      }}></div>
      <div className="absolute rounded-full" style={{
        top: '-300px',
        left: '200px',
        width: '400px',
        height: '600px',
        background: 'radial-gradient(rgba(255, 255, 255, 0.3) 0%, rgba(0, 0, 0, 0) 70%)',
        filter: 'blur(80px)',
        opacity: 0.6,
        pointerEvents: 'none'
      }}></div>
      <div className="absolute rounded-full" style={{
        top: '-250px',
        right: '100px',
        width: '500px',
        height: '700px',
        background: 'radial-gradient(rgba(255, 255, 255, 0.25) 0%, rgba(0, 0, 0, 0) 70%)',
        filter: 'blur(80px)',
        opacity: 0.5,
        pointerEvents: 'none'
      }}></div>
      <div className="absolute rounded-full" style={{
        top: '50px',
        right: '200px',
        width: '450px',
        height: '600px',
        background: 'radial-gradient(rgba(255, 255, 255, 0.2) 0%, rgba(0, 0, 0, 0) 70%)',
        filter: 'blur(80px)',
        opacity: 0.4,
        pointerEvents: 'none'
      }}></div>



      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {/* Main heading */}
        <h1 className="text-7xl md:text-8xl font-black text-white mb-6 tracking-tight leading-none">
          VAULT
          <br />
          GENESIS
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl font-light">
          Launch your meme coin, stake tokens, and trade with AI-powered bots
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <button className="px-8 py-3 bg-white text-black font-bold text-base hover:bg-gray-100 transition-all duration-300">
            CREATE TOKEN
          </button>
          <button className="px-8 py-3 bg-white text-black font-bold text-base hover:bg-gray-100 transition-all duration-300">
            CONNECT WALLET
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row gap-8 text-gray-400 text-sm">
          <div>
            <p className="text-white font-bold">314+</p>
            <p>TOKENS LAUNCHED</p>
          </div>
          <div>
            <p className="text-white font-bold">$2.4M+</p>
            <p>TOTAL VOLUME</p>
          </div>
          <div>
            <p className="text-white font-bold">1,200+</p>
            <p>ACTIVE USERS</p>
          </div>
        </div>
      </div>


    </div>
  );
}
