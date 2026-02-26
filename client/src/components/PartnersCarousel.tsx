import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

// Partner logos with actual SVG files
const partners = [
  {
    name: 'Binance',
    logo: '/binance.svg',
  },
  {
    name: 'Kraken',
    logo: '/kraken.svg',
  },
  {
    name: 'Coinbase',
    logo: '/coinbase.svg',
  },
];

export default function PartnersCarousel() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const scrollContainer = document.getElementById('carousel-scroll');
    if (!scrollContainer) return;

    const scroll = () => {
      setScrollPosition((prev) => {
        const newPos = prev + 1;
        // Reset to 0 when reaching the end for infinite loop
        if (newPos > scrollContainer.scrollWidth - scrollContainer.clientWidth) {
          return 0;
        }
        return newPos;
      });
    };

    const interval = setInterval(scroll, 30); // Smooth continuous scroll

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const scrollContainer = document.getElementById('carousel-scroll');
    if (scrollContainer) {
      scrollContainer.scrollLeft = scrollPosition;
    }
  }, [scrollPosition]);

  return (
    <div className="w-full py-2 sm:py-4">
      <div className="text-center mb-3 sm:mb-4">
        <p className={`text-xs sm:text-sm uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Trusted Partners</p>
      </div>

      {/* Carousel Container */}
      <div className="relative overflow-hidden flex justify-center">
        {/* Gradient overlays for fade effect - reduced on mobile */}
        <div className={`absolute left-0 top-0 bottom-0 w-8 sm:w-20 z-10 pointer-events-none ${
          isDark 
            ? 'bg-gradient-to-r from-black to-transparent'
            : 'bg-gradient-to-r from-[#fafaf8] to-transparent'
        }`}></div>
        <div className={`absolute right-0 top-0 bottom-0 w-8 sm:w-20 z-10 pointer-events-none ${
          isDark 
            ? 'bg-gradient-to-l from-black to-transparent'
            : 'bg-gradient-to-l from-[#fafaf8] to-transparent'
        }`}></div>

        {/* Scrolling carousel */}
        <div
          id="carousel-scroll"
          className="flex gap-4 sm:gap-8 overflow-x-hidden scroll-smooth px-4 sm:px-6 w-full max-w-3xl"
          style={{ scrollBehavior: 'smooth' }}
        >
          {/* Duplicate logos for infinite loop effect */}
          {[...partners, ...partners, ...partners].map((partner, index) => (
            <div
              key={`${partner.name}-${index}`}
              className="flex-shrink-0 h-10 sm:h-12 flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className={`h-5 sm:h-7 w-auto object-contain ${
                  isDark 
                    ? 'filter brightness-0 invert'
                    : 'filter brightness-0'
                }`}
              />
            </div>
          ))}
        </div>
      </div>


    </div>
  );
}
