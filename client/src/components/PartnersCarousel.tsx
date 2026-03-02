import { useTheme } from '@/contexts/ThemeContext';

const partners = [
  { name: 'Binance', logo: '/binance.svg' },
  { name: 'Kraken', logo: '/kraken.svg' },
  { name: 'Coinbase', logo: '/coinbase.svg' },
];

// Duplicate for seamless loop
const loopedPartners = [...partners, ...partners, ...partners, ...partners];

export default function PartnersCarousel() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="w-full py-2 sm:py-4 flex flex-col items-center">
      <p className={`text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Trusted Partners
      </p>

      {/* Centered, width-constrained container */}
      <div className="relative w-full max-w-lg overflow-hidden">
        {/* Gradient fade on left & right edges */}
        <div className={`absolute left-0 top-0 bottom-0 w-10 z-10 pointer-events-none ${
          isDark
            ? 'bg-gradient-to-r from-black to-transparent'
            : 'bg-gradient-to-r from-[#fafaf8] to-transparent'
        }`} />
        <div className={`absolute right-0 top-0 bottom-0 w-10 z-10 pointer-events-none ${
          isDark
            ? 'bg-gradient-to-l from-black to-transparent'
            : 'bg-gradient-to-l from-[#fafaf8] to-transparent'
        }`} />

        {/* Scrolling track — pure CSS */}
        <div className="flex carousel-track">
          {loopedPartners.map((partner, index) => (
            <div
              key={`${partner.name}-${index}`}
              className="flex-shrink-0 flex items-center justify-center px-6 h-10"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className={`h-5 w-auto object-contain ${
                  isDark ? 'brightness-0 invert' : 'brightness-0'
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
