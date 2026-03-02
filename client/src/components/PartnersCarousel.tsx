import { useTheme } from '@/contexts/ThemeContext';

const partners = [
  { name: 'Binance', logo: '/binance.svg' },
  { name: 'Kraken', logo: '/kraken.svg' },
  { name: 'Coinbase', logo: '/coinbase.svg' },
];

// Duplicate enough times for a seamless loop
const loopedPartners = [...partners, ...partners, ...partners, ...partners];

export default function PartnersCarousel() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="w-full py-2 sm:py-4">
      <div className="text-center mb-3 sm:mb-4">
        <p className={`text-xs sm:text-sm uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Trusted Partners
        </p>
      </div>

      {/* Carousel Container */}
      <div className="relative overflow-hidden">
        {/* Gradient fade overlays */}
        <div className={`absolute left-0 top-0 bottom-0 w-12 sm:w-24 z-10 pointer-events-none ${
          isDark
            ? 'bg-gradient-to-r from-black to-transparent'
            : 'bg-gradient-to-r from-[#fafaf8] to-transparent'
        }`}></div>
        <div className={`absolute right-0 top-0 bottom-0 w-12 sm:w-24 z-10 pointer-events-none ${
          isDark
            ? 'bg-gradient-to-l from-black to-transparent'
            : 'bg-gradient-to-l from-[#fafaf8] to-transparent'
        }`}></div>

        {/* Scrolling track — pure CSS animation */}
        <div className="flex carousel-track">
          {loopedPartners.map((partner, index) => (
            <div
              key={`${partner.name}-${index}`}
              className="flex-shrink-0 flex items-center justify-center px-8 sm:px-12 h-10 sm:h-12"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className={`h-5 sm:h-7 w-auto object-contain ${
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
