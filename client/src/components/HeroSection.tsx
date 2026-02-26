export default function HeroSection() {
  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-black opacity-90"></div>

      {/* Rotating sun video - positioned at bottom center like MoonLaunch */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-96 opacity-90 pointer-events-none">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          style={{
            filter: 'drop-shadow(0 0 80px rgba(255, 200, 0, 0.3))',
            mixBlendMode: 'screen',
          }}
        >
          <source src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663061635487/vHGxKBgfCZhFIWIH.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Stars background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full opacity-60"
            style={{
              width: Math.random() * 2 + 'px',
              height: Math.random() * 2 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animation: `twinkle ${Math.random() * 3 + 2}s infinite`,
            }}
          />
        ))}
      </div>

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
          <button className="px-8 py-3 bg-white text-black font-bold text-lg rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
            CREATE TOKEN
          </button>
          <button className="px-8 py-3 border-2 border-white text-white font-bold text-lg rounded-lg hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105">
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

      {/* Twinkle animation */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
