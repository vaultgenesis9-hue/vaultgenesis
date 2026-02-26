export default function HeroSection() {
  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden">
      {/* Background - pure black */}
      <div className="absolute inset-0 bg-black"></div>
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-black/10"></div>



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
