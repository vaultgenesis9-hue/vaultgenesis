import { useEffect, useState } from 'react';

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
    <div className="w-full py-12">
      <div className="text-center mb-8">
        <p className="text-gray-400 text-sm uppercase tracking-wider">Trusted Partners</p>
      </div>

      {/* Carousel Container */}
      <div className="relative overflow-hidden">
        {/* Gradient overlays for fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>

        {/* Scrolling carousel */}
        <div
          id="carousel-scroll"
          className="flex gap-16 overflow-x-hidden scroll-smooth px-8"
          style={{ scrollBehavior: 'smooth' }}
        >
          {/* Duplicate logos for infinite loop effect */}
          {[...partners, ...partners, ...partners].map((partner, index) => (
            <div
              key={`${partner.name}-${index}`}
              className="flex-shrink-0 h-20 flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="h-16 w-auto object-contain filter brightness-0 invert"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Divider Line */}
      <div className="w-full h-px bg-white/20 mt-8"></div>
    </div>
  );
}
