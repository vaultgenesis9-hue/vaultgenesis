import { useEffect, useState } from 'react';

// Partner logos as SVG components
const partners = [
  {
    name: 'Coinbase',
    logo: (
      <svg viewBox="0 0 200 200" className="w-16 h-16 fill-white">
        <circle cx="100" cy="100" r="95" fill="none" stroke="white" strokeWidth="2"/>
        <text x="100" y="110" textAnchor="middle" fontSize="60" fontWeight="bold" fill="white">₿</text>
      </svg>
    ),
  },
  {
    name: 'Kraken',
    logo: (
      <svg viewBox="0 0 200 200" className="w-16 h-16">
        <circle cx="100" cy="100" r="95" fill="white"/>
        <text x="100" y="110" textAnchor="middle" fontSize="80" fontWeight="bold" fill="black">K</text>
      </svg>
    ),
  },
  {
    name: 'Binance',
    logo: (
      <svg viewBox="0 0 200 200" className="w-16 h-16">
        <circle cx="100" cy="100" r="95" fill="white"/>
        <text x="100" y="110" textAnchor="middle" fontSize="80" fontWeight="bold" fill="black">B</text>
      </svg>
    ),
  },
  {
    name: 'FTX',
    logo: (
      <svg viewBox="0 0 200 200" className="w-16 h-16">
        <circle cx="100" cy="100" r="95" fill="white"/>
        <text x="100" y="110" textAnchor="middle" fontSize="80" fontWeight="bold" fill="black">F</text>
      </svg>
    ),
  },
  {
    name: 'Uniswap',
    logo: (
      <svg viewBox="0 0 200 200" className="w-16 h-16">
        <circle cx="100" cy="100" r="95" fill="white"/>
        <text x="100" y="110" textAnchor="middle" fontSize="80" fontWeight="bold" fill="black">U</text>
      </svg>
    ),
  },
  {
    name: 'Raydium',
    logo: (
      <svg viewBox="0 0 200 200" className="w-16 h-16">
        <circle cx="100" cy="100" r="95" fill="white"/>
        <text x="100" y="110" textAnchor="middle" fontSize="80" fontWeight="bold" fill="black">R</text>
      </svg>
    ),
  },
  {
    name: 'Phantom',
    logo: (
      <svg viewBox="0 0 200 200" className="w-16 h-16">
        <circle cx="100" cy="100" r="95" fill="white"/>
        <text x="100" y="110" textAnchor="middle" fontSize="80" fontWeight="bold" fill="black">P</text>
      </svg>
    ),
  },
  {
    name: 'MetaMask',
    logo: (
      <svg viewBox="0 0 200 200" className="w-16 h-16">
        <circle cx="100" cy="100" r="95" fill="white"/>
        <text x="100" y="110" textAnchor="middle" fontSize="80" fontWeight="bold" fill="black">M</text>
      </svg>
    ),
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
          className="flex gap-12 overflow-x-hidden scroll-smooth px-8"
          style={{ scrollBehavior: 'smooth' }}
        >
          {/* Duplicate logos for infinite loop effect */}
          {[...partners, ...partners].map((partner, index) => (
            <div
              key={`${partner.name}-${index}`}
              className="flex-shrink-0 h-20 flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              {partner.logo}
            </div>
          ))}
        </div>
      </div>

      {/* Divider Line */}
      <div className="w-full h-px bg-white/20 mt-8"></div>
    </div>
  );
}
