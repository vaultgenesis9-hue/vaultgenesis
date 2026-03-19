import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2 } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const VIDEO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663061635487/hDJwWwsXRADFzVMPvCDuWe/vaultgenesis-explainer-v2_bd201b4f.mp4";

export default function VideoExplainer() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
      setHasStarted(true);
      // Unmute on first play
      if (!hasStarted) {
        video.muted = false;
        setIsMuted(false);
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
    resetControlsTimer();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setProgress((video.currentTime / video.duration) * 100);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    video.currentTime = ratio * video.duration;
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) video.requestFullscreen();
  };

  const resetControlsTimer = () => {
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    setShowControls(true);
    controlsTimerRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, []);

  return (
    <section className={`py-20 px-4 ${isDark ? "bg-black" : "bg-[#fafaf8]"}`}>
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-10">
          <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            See It In Action
          </p>
          <h2 className={`text-3xl sm:text-4xl font-black uppercase tracking-tight ${isDark ? "text-white" : "text-black"}`}>
            How VaultGenesis Works
          </h2>
          <p className={`mt-3 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            A 90-second walkthrough of every feature — from wallet connection to token launch.
          </p>
        </div>

        {/* Video player */}
        <div
          className={`relative rounded-2xl overflow-hidden border ${isDark ? "border-white/10 bg-black" : "border-black/10 bg-black"} shadow-2xl group`}
          style={{ aspectRatio: "16/9" }}
          onMouseMove={resetControlsTimer}
          onMouseLeave={() => isPlaying && setShowControls(false)}
        >
          <video
            ref={videoRef}
            src={VIDEO_URL}
            className="w-full h-full object-cover"
            muted={isMuted}
            playsInline
            preload="metadata"
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => { setIsPlaying(false); setShowControls(true); setProgress(0); }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Big play button overlay (before first play) */}
          {!hasStarted && (
            <div
              className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/40 backdrop-blur-sm"
              onClick={togglePlay}
            >
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-200">
                <Play className="w-8 h-8 text-black ml-1" fill="black" />
              </div>
            </div>
          )}

          {/* Controls overlay */}
          <div
            className={`absolute bottom-0 left-0 right-0 transition-opacity duration-300 ${showControls || !isPlaying ? "opacity-100" : "opacity-0"}`}
            style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.8))" }}
          >
            {/* Progress bar */}
            <div
              className="mx-4 mb-2 h-1 bg-white/20 rounded-full cursor-pointer hover:h-2 transition-all"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 px-4 pb-3">
              <button
                onClick={togglePlay}
                className="text-white hover:text-gray-300 transition-colors"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" fill="white" />
                ) : (
                  <Play className="w-5 h-5" fill="white" />
                )}
              </button>

              <button
                onClick={toggleMute}
                className="text-white hover:text-gray-300 transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>

              <span className="text-white/60 text-xs flex-1">
                VaultGenesis Explainer · 0:36
              </span>

              <button
                onClick={handleFullscreen}
                className="text-white hover:text-gray-300 transition-colors"
                aria-label="Fullscreen"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Caption */}
        <p className={`text-center text-xs mt-4 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
          🔊 Click play — voiceover included
        </p>
      </div>
    </section>
  );
}
