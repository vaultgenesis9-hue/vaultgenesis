export default function ScrollIndicator() {
  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20">
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
        <div className="w-6 h-10 border-2 border-white/60 rounded-full flex items-center justify-center">
          {/* Scroll dot */}
          <div className="scroll-indicator w-1 h-2 bg-white/60 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
