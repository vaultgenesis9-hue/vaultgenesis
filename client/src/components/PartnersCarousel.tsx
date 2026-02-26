import { useEffect, useState } from 'react';

const partners = [
  {
    name: 'Coinbase',
    logo: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" fill="white"/>
      </svg>
    ),
  },
  {
    name: 'Kraken',
    logo: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
        <path d="M12 7v10M7 12h10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: 'Binance',
    logo: (
      <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
        <path d="M12 2L2 8v8l10 6 10-6V8l-10-6zm0 16l-8-4.8V8.8L12 4l8 4.8v4.4l-8 4.8z"/>
        <path d="M12 8l-4 2.4v4.8l4 2.4 4-2.4v-4.8L12 8z"/>
      </svg>
    ),
  },
  {
    name: 'Uniswap',
    logo: (
      <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
      </svg>
    ),
  },
  {
    name: 'Raydium',
    logo: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="white" strokeWidth="2"/>
        <path d="M9 9l6 6M15 9l-6 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: 'Phantom',
    logo: (
      <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15h4v-4h-4v4zm0-6h4V7h-4v4z"/>
      </svg>
    ),
  },
];

export default function PartnersCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % partners.length);
    }, 3000); // Change logo every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const getVisibleLogos = () => {
    const logos = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % partners.length;
      logos.push(partners[index]);
    }
    return logos;
  };

  const visibleLogos = getVisibleLogos();

  return (
    <div className="flex justify-center py-8">
      <div className="flex flex-col items-center gap-4 w-full">
        {/* Carousel Container */}
        <div className="flex items-center justify-center gap-8 w-full px-4">
          {visibleLogos.map((partner, index) => (
            <div
              key={`${partner.name}-${index}`}
              className={`transition-all duration-500 ease-out ${
                index === 1
                  ? 'scale-100 opacity-100'
                  : 'scale-75 opacity-50'
              }`}
            >
              <div className="w-24 h-24 flex items-center justify-center border border-white/30 rounded-lg hover:border-white/60 transition-all bg-black/20">
                {partner.logo}
              </div>
            </div>
          ))}
        </div>

        {/* Dots Indicator */}
        <div className="flex gap-2">
          {partners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-6'
                  : 'bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* Divider Line */}
        <div className="w-80 h-px bg-white/20 mt-2"></div>
      </div>
    </div>
  );
}
