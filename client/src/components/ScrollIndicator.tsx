import { useTheme } from '@/contexts/ThemeContext';

export default function ScrollIndicator() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20">
      <style>{`
        @keyframes scroll-bounce {
          0%, 20%, 50%, 80%, 100% {
            opacity: 1;
            transform: translateY(0);
          }
          40% {
            opacity: 0.5;
            transform: translateY(8px);
          }
          60% {
            opacity: 0.5;
            transform: translateY(4px);
          }
        }
        
        .scroll-indicator {
          animation: scroll-bounce 2s infinite;
        }
      `}</style>
      
      {/* Scroll indicator - mouse wheel icon */}
      <div className="flex flex-col items-center gap-2">
        {/* Mouse wheel outline */}
        <div className={`w-5 h-8 border rounded-full flex items-center justify-center ${
          isDark 
            ? 'border-white/40'
            : 'border-black/40'
        }`}>
          {/* Scroll dot */}
          <div className={`scroll-indicator w-0.5 h-1.5 rounded-full ${
            isDark 
              ? 'bg-white/40'
              : 'bg-black/40'
          }`}></div>
        </div>
      </div>
    </div>
  );
}
