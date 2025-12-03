import { useEffect, useRef, useState, useCallback, memo } from "react";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";

/**
 * VideoPlayerManagement - Secure video player for Bunny Stream
 * 
 * @param {Object} props
 * @param {Object} props.video - Video data with videoId and libraryId
 * @param {boolean} props.autoplay - Auto-play on load
 * @param {boolean} props.showControls - Show video controls
 * @param {boolean} props.muted - Mute video
 * @param {string} props.aspectRatio - Aspect ratio ("16:9", "4:3", "1:1")
 * @param {Object} props.style - Additional styles
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.watermark - Watermark config { text, position }
 * @param {Function} props.onReady - Called when video is ready
 * @param {Function} props.onPlay - Called when video plays
 * @param {Function} props.onPause - Called when video pauses
 * @param {Function} props.onEnded - Called when video ends
 * @param {Function} props.onError - Called on error
 * @param {Function} props.onSecurityViolation - Called on security violation
 */
const VideoPlayerManagement = memo(({
  video,
  autoplay = false,
  showControls = true,
  muted = false,
  aspectRatio = "16:9",
  style = {},
  className = "",
  watermark = null,
  onReady = () => {},
  onPlay = () => {},
  onPause = () => {},
  onEnded = () => {},
  onError = () => {},
  onSecurityViolation = () => {},
}) => {
  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [securityAlert, setSecurityAlert] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Reset state when video changes
  useEffect(() => {
    if (video?.videoId) {
      setIsLoading(true);
      setError(null);
    }
  }, [video?.videoId]);

  // Calculate padding based on aspect ratio
  const getPaddingBottom = useCallback(() => {
    const ratios = {
      "4:3": "75%",
      "1:1": "100%",
      "21:9": "42.86%",
      "16:9": "56.25%",
    };
    return ratios[aspectRatio] || "56.25%";
  }, [aspectRatio]);

  // Handle iframe messages for video events
  useEffect(() => {
    if (!isMounted) return;

    const handleMessage = (event) => {
      if (event.origin !== "https://iframe.mediadelivery.net") return;

      try {
        const data = typeof event.data === "string" 
          ? JSON.parse(event.data) 
          : event.data;
        
        const eventType = data.event || data.type;
        
        switch (eventType) {
          case "ended":
            onEnded();
            break;
          case "play":
            onPlay();
            break;
          case "pause":
            onPause();
            break;
          case "ready":
            onReady();
            break;
          default:
            break;
        }
      } catch {
        // Ignore parsing errors
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isMounted, onEnded, onPlay, onPause, onReady]);

  // DevTools detection
  useEffect(() => {
    if (!isMounted) return;

    const detectDevTools = () => {
      const threshold = 160;
      const isOpen = 
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold;

      if (isOpen && !securityAlert) {
        setSecurityAlert(true);
        onSecurityViolation("devtools_detected");
      }
    };

    const interval = setInterval(detectDevTools, 2000);
    window.addEventListener("resize", detectDevTools);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", detectDevTools);
    };
  }, [isMounted, securityAlert, onSecurityViolation]);

  // Keyboard shortcut prevention
  useEffect(() => {
    if (!isMounted) return;

    const handleKeyDown = (e) => {
      const blockedKeys = ["s", "u", "i", "j", "c"];
      const key = e.key?.toLowerCase();

      if ((e.ctrlKey || e.metaKey) && blockedKeys.includes(key)) {
        e.preventDefault();
        onSecurityViolation("key_blocked");
      }

      if (key === "f12" || key === "printscreen") {
        e.preventDefault();
        onSecurityViolation("key_blocked");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMounted, onSecurityViolation]);

  // Handle iframe load
  const handleIframeLoad = useCallback(() => {
    // Small delay to ensure video is ready
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  // Handle iframe error
  const handleIframeError = useCallback(() => {
    setIsLoading(false);
    setError("Failed to load video");
    onError(new Error("Failed to load video"));
  }, [onError]);

  // Handle retry
  const handleRetry = useCallback(() => {
    setError(null);
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  }, []);

  // Handle security alert dismiss
  const handleDismissAlert = useCallback(() => {
    setSecurityAlert(false);
  }, []);

  // SSR fallback
  if (!isMounted) {
    return (
      <div
        style={{
          width: "100%",
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "200px",
          borderRadius: "8px",
          ...style,
        }}
        className={className}
      >
        <Loader2 className="w-10 h-10 text-white/50 animate-spin" />
      </div>
    );
  }

  // No video data
  if (!video?.videoId || !video?.libraryId) {
    return (
      <div
        style={{
          width: "100%",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "200px",
          borderRadius: "8px",
          gap: "12px",
          ...style,
        }}
        className={className}
      >
        <AlertTriangle className="w-10 h-10 text-white/30" />
        <p className="text-white/50 text-sm">No video available</p>
      </div>
    );
  }

  // Build iframe URL
  const iframeUrl = `https://iframe.mediadelivery.net/embed/${video.libraryId}/${video.videoId}?autoplay=${autoplay}&muted=${muted}&loop=false&preload=true&responsive=true`;

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        paddingBottom: getPaddingBottom(),
        height: 0,
        background: "#000",
        overflow: "hidden",
        borderRadius: "8px",
        userSelect: "none",
        ...style,
      }}
      className={className}
    >
      {/* Security Alert Overlay */}
      {securityAlert && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-50 text-white text-center p-6 gap-4">
          <div className="text-5xl">🔒</div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Security Alert</h3>
            <p className="text-sm text-white/60 max-w-md">
              Developer tools detected. Please close DevTools to continue watching.
            </p>
          </div>
          <button
            onClick={handleDismissAlert}
            className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/80 transition-colors"
          >
            Continue
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
            <p className="text-white/50 text-sm">Loading video...</p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10 gap-4 p-4">
          <AlertTriangle className="w-10 h-10 text-red-400" />
          <p className="text-white/70 text-sm text-center">{error}</p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )}

      {/* Watermark */}
      {watermark && (
        <div
          style={{
            position: "absolute",
            top: watermark.position?.includes("bottom") ? "auto" : 8,
            bottom: watermark.position?.includes("bottom") ? 8 : "auto",
            left: watermark.position?.includes("right") ? "auto" : 8,
            right: watermark.position?.includes("right") ? 8 : "auto",
            zIndex: 1,
            pointerEvents: "none",
          }}
          className="bg-black/50 text-white/60 px-3 py-1 rounded text-xs font-semibold"
        >
          {watermark.text}
        </div>
      )}

      {/* Video iframe */}
      <iframe
        ref={iframeRef}
        src={iframeUrl}
        title={video.title || "Video Player"}
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-presentation"
        referrerPolicy="no-referrer"
        className="absolute top-0 left-0 w-full h-full border-0"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
      />
    </div>
  );
});

VideoPlayerManagement.displayName = "VideoPlayerManagement";

export default VideoPlayerManagement;
