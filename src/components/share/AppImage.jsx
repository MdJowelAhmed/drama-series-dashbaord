import { useState } from "react";
import { cn } from "@/lib/utils";
import { getImageUrl } from "./imageUrl";

/**
 * Reusable image component with:
 * - native lazy loading + async decoding (faster perceived load)
 * - optional CDN resize (width/height/quality) for thumbnails
 * - skeleton/shimmer placeholder until the image paints
 * - graceful fallback when the image fails to load
 *
 * Pass a raw path/URL as `src`; it is resolved through getImageUrl().
 * Set `resolve={false}` if `src` is already a final URL (e.g. object URL).
 */
const AppImage = ({
  src,
  alt = "",
  className,
  width,
  height,
  quality,
  resolve = true,
  fallbackSrc = "",
  eager = false,
  ...rest
}) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const finalSrc = resolve
    ? getImageUrl(src, { width, height, quality })
    : src;

  const showSkeleton = !loaded && !errored;
  const hideBroken = errored && !fallbackSrc;

  return (
    <span className="relative block">
      {showSkeleton && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-0 rounded-[inherit] bg-slate-700/20 animate-pulse"
          )}
        />
      )}
      <img
        src={errored && fallbackSrc ? fallbackSrc : finalSrc}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        className={cn(
          "relative transition-opacity duration-300",
          showSkeleton ? "opacity-0" : "opacity-100",
          hideBroken && "opacity-0",
          className
        )}
        {...rest}
      />
    </span>
  );
};

export default AppImage;
