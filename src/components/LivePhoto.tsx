import { useEffect, useRef, useState } from "react";
import { resolveAssetPath } from "../lib/image-utils";

interface LivePhotoProps {
  imageSrc: string;
  imageAlt: string;
  videoSrc?: string;
  className?: string;
  imageClassName?: string;
  frameClassName?: string;
}

export function LivePhoto({
  imageSrc,
  imageAlt,
  videoSrc,
  className = "",
  imageClassName = "",
  frameClassName = ""
}: LivePhotoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const resolvedImageSrc = resolveAssetPath(imageSrc);
  const resolvedVideoSrc = videoSrc ? resolveAssetPath(videoSrc) : undefined;
  const pressTimerRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isPressingRef = useRef(false);
  const didLongPressRef = useRef(false);

  useEffect(() => {
    return () => {
      if (pressTimerRef.current) {
        window.clearTimeout(pressTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (isPlaying) {
      video.currentTime = 0;
      void video.play().catch(() => {
        setIsPlaying(false);
      });
      return;
    }

    video.pause();
    video.currentTime = 0;
  }, [isPlaying]);

  const startPress = () => {
    if (!resolvedVideoSrc) {
      return;
    }

    isPressingRef.current = true;
    pressTimerRef.current = window.setTimeout(() => {
      if (isPressingRef.current) {
        didLongPressRef.current = true;
        setIsPlaying(true);
      }
    }, 180);
  };

  const endPress = () => {
    isPressingRef.current = false;
    if (pressTimerRef.current) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    setIsPlaying(false);
  };

  return (
    <div
      className={`live-photo-frame ${isPlaying ? "is-playing" : ""} ${frameClassName}`.trim()}
      onMouseDown={startPress}
      onMouseUp={endPress}
      onMouseLeave={endPress}
      onTouchStart={startPress}
      onTouchEnd={endPress}
      onTouchCancel={endPress}
      onClickCapture={(event) => {
        if (didLongPressRef.current) {
          event.preventDefault();
          event.stopPropagation();
          didLongPressRef.current = false;
        }
      }}
      onContextMenu={(event) => {
        if (resolvedVideoSrc) {
          event.preventDefault();
        }
      }}
    >
      <img src={resolvedImageSrc} alt={imageAlt} className={`${className} ${imageClassName}`.trim()} />
      {resolvedVideoSrc ? (
        <>
          <video
            ref={videoRef}
            className={`live-photo-video ${className}`.trim()}
            src={resolvedVideoSrc}
            muted
            playsInline
            preload="metadata"
          />
          <span className="live-photo-badge">Hold for live</span>
        </>
      ) : null}
      {resolvedVideoSrc ? (
        <div className="live-photo-overlay" aria-hidden="true" />
      ) : null}
    </div>
  );
}
