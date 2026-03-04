import { useTheme } from '@/contexts/ThemeContext';

const steps = [
  {
    number: "01",
    title: "Connect Your Wallet",
    description: "Link your MetaMask, WalletConnect, Phantom, or Coinbase wallet to VaultGenesis in seconds. Your keys, your crypto.",
    icon: "🔗",
  },
  {
    number: "02",
    title: "Create Your Token",
    description: "Launch your own meme coin or utility token in minutes. Set name, symbol, supply, and upload your logo — no coding required.",
    icon: "🪙",
  },
  {
    number: "03",
    title: "Run a Presale",
    description: "Set up tiered presale rounds with custom pricing, hard caps, and contribution limits. Let your community get in early.",
    icon: "🚀",
  },
  {
    number: "04",
    title: "Stake & Earn",
    description: "Stake your tokens to earn passive rewards at competitive APY rates. Compound your earnings and grow your holdings.",
    icon: "💰",
  },
  {
    number: "05",
    title: "Activate Trading Bots",
    description: "Deploy AI-powered trading bots with scalping, arbitrage, or momentum strategies. Set risk parameters and let the bot trade for you.",
    icon: "🤖",
  },
];

export default function HowItWorks() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section className={`relative py-20 px-4 overflow-hidden ${isDark ? 'bg-black' : 'bg-[#fafaf8]'}`}>
      {/* Subtle gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-3xl ${isDark ? 'bg-white/5' : 'bg-black/5'}`} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className={`text-xs font-bold uppercase tracking-[0.3em] mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            How It Works
          </p>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
            Five Steps to
          </h2>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-light uppercase tracking-tight ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Financial Freedom
          </h2>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`group flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-6 rounded-2xl border transition-all duration-300 ${
                isDark
                  ? 'border-white/10 hover:border-white/25 hover:bg-white/5'
                  : 'border-black/10 hover:border-black/25 hover:bg-black/5'
              }`}
            >
              {/* Step number */}
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm ${
                isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'
              }`}>
                {step.number}
              </div>

              {/* Icon */}
              <div className="text-2xl flex-shrink-0">{step.icon}</div>

              {/* Content */}
              <div className="flex-1">
                <h3 className={`font-black text-base sm:text-lg uppercase tracking-wide mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                  {step.title}
                </h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {step.description}
                </p>
              </div>

              {/* Connector arrow (not on last item) */}
              {index < steps.length - 1 && (
                <div className={`hidden sm:block flex-shrink-0 text-lg ${isDark ? 'text-gray-700' : 'text-gray-300'}`}>
                  →
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Ready to start your crypto journey?
          </p>
          <button className={`px-10 py-3 font-black rounded-full uppercase text-sm border-2 transition-all duration-300 ${
            isDark
              ? 'bg-white text-black border-white hover:bg-transparent hover:text-white'
              : 'bg-black text-white border-black hover:bg-transparent hover:text-black'
          }`}>
            Get Started Now
          </button>
        </div>
      </div>
    </section>
  );
}
