import React, { useEffect, useRef, useState } from "react";
import { Modal, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const SecureVideoPlayer = ({ visible, onClose, video }) => {
  const iframeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const playerRef = useRef(null);

  // Disable right-click and keyboard shortcuts
  useEffect(() => {
    if (!visible || !video) return;

    const onContext = (e) => e.preventDefault();
    const onKey = (e) => {
      const k = e.key?.toLowerCase?.();
      if (e.ctrlKey && (k === "s" || k === "u")) e.preventDefault();
      if (e.ctrlKey && e.shiftKey && k === "i") e.preventDefault();
      if (k === "f12") e.preventDefault();
    };

    document.addEventListener("contextmenu", onContext);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("keydown", onKey);
    };
  }, [visible, video]);

  // Load Player.js and initialize Bunny Player
  useEffect(() => {
    if (!visible || !video || !iframeRef.current) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const loadPlayerJs = () =>
      new Promise((resolve, reject) => {
        if (window.playerjs) return resolve();
        const s = document.createElement("script");
        s.src = "//assets.mediadelivery.net/playerjs/player-0.1.0.min.js";
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Failed to load Player.js"));
        document.head.appendChild(s);
      });

    const init = async () => {
      try {
        await loadPlayerJs();
        if (cancelled) return;

        const p = new window.playerjs.Player(iframeRef.current);
        playerRef.current = p;

        p.on("ready", () => {
          if (!cancelled) setIsLoading(false);
        });

        p.on("error", () => {
          if (!cancelled) {
            setError("Failed to load video");
            setIsLoading(false);
          }
        });
      } catch (e) {
        if (!cancelled) {
          setError("Failed to load video player");
          setIsLoading(false);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      playerRef.current = null;
    };
  }, [visible, video]);

  if (!video) return null;

  const libraryId = video.libraryId;
  const videoId = video.videoId;
  const src = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=false&muted=false&responsive=true`;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
      centered
      destroyOnClose
      title={video.title}
    >
      {/* Player Container */}
      <div
        style={{
          position: "relative",
          paddingBottom: "56.25%",
          height: 0,
          background: "#000",
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Loading Spinner */}
        {isLoading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
            }}
          >
            <Spin
              indicator={
                <LoadingOutlined style={{ fontSize: 48, color: "#fff" }} spin />
              }
              tip={<span style={{ color: "#fff" }}>Loading video...</span>}
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              zIndex: 10,
            }}
          >
            {error}
          </div>
        )}

        {/* Bunny Stream Iframe */}
        <iframe
          ref={iframeRef}
          src={src}
          title={video.title || "Video"}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-presentation"
          referrerPolicy="no-referrer"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            border: 0,
          }}
        />
      </div>

      {/* Video Info */}
      <div style={{ userSelect: "none", padding: 16 }}>
        <h3 style={{ margin: 0, marginBottom: 8 }}>{video.title}</h3>
        {video.description && <p style={{ marginTop: 0 }}>{video.description}</p>}
        {video.duration && (
          <div style={{ color: "#666", fontSize: 12 }}>
            Duration: {video.duration}
          </div>
        )}
        {!!video.equipment?.length && (
          <div style={{ marginTop: 8 }}>
            <span
              style={{ fontSize: 12, fontWeight: 600, marginRight: 6 }}
            >
              Equipment:
            </span>
            {video.equipment.map((e, i) => (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  background: "#fee2e2",
                  color: "#991b1b",
                  padding: "2px 6px",
                  borderRadius: 4,
                  fontSize: 12,
                  marginRight: 6,
                  marginTop: 4,
                }}
              >
                {e}
              </span>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SecureVideoPlayer;
