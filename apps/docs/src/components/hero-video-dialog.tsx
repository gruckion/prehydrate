'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Play, XIcon } from 'lucide-react';

type AnimationStyle =
  | 'from-bottom'
  | 'from-center'
  | 'from-top'
  | 'from-left'
  | 'from-right'
  | 'fade'
  | 'top-in-bottom-out'
  | 'left-in-right-out';

interface HeroVideoProps {
  animationStyle?: AnimationStyle;
  videoSrc: string;
  thumbnailAlt?: string;
  className?: string;
}

const animationVariants = {
  'from-bottom': {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
  },
  'from-center': {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.5, opacity: 0 },
  },
  'from-top': {
    initial: { y: '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '-100%', opacity: 0 },
  },
  'from-left': {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
  },
  'from-right': {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  'top-in-bottom-out': {
    initial: { y: '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
  },
  'left-in-right-out': {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
  },
};

export function HeroVideoDialog({
  animationStyle = 'from-center',
  videoSrc,
  thumbnailAlt = 'Video preview',
  className = '',
}: HeroVideoProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const dialogVideoRef = useRef<HTMLVideoElement>(null);
  const selectedAnimation = animationVariants[animationStyle];

  // Ensure preview video plays on mount
  useEffect(() => {
    const video = previewVideoRef.current;
    if (video) {
      // Ensure muted is set (required for autoplay)
      video.muted = true;
      // Try to play when video data is loaded
      const handleCanPlay = () => {
        video.play().catch(() => {
          // Autoplay was prevented, that's ok
        });
      };
      video.addEventListener('canplay', handleCanPlay);
      // Also try to play immediately in case video is already loaded
      if (video.readyState >= 3) {
        video.play().catch(() => {});
      }
      return () => {
        video.removeEventListener('canplay', handleCanPlay);
      };
    }
  }, []);

  // Play dialog video when opened
  useEffect(() => {
    if (isVideoOpen && dialogVideoRef.current) {
      dialogVideoRef.current.currentTime = 0;
      dialogVideoRef.current.play();
    }
  }, [isVideoOpen]);

  const handleOpenVideo = () => {
    // Pause preview video when opening dialog
    if (previewVideoRef.current) {
      previewVideoRef.current.pause();
    }
    setIsVideoOpen(true);
  };

  const handleCloseVideo = () => {
    // Pause dialog video and resume preview
    if (dialogVideoRef.current) {
      dialogVideoRef.current.pause();
    }
    if (previewVideoRef.current) {
      previewVideoRef.current.play();
    }
    setIsVideoOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className="relative cursor-pointer group"
        onClick={handleOpenVideo}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Preview video - autoplay, muted, loop */}
        <video
          ref={previewVideoRef}
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full aspect-video object-cover transition-all duration-200 group-hover:brightness-[0.8] ease-out rounded-xl shadow-2xl border border-white/10"
          aria-label={thumbnailAlt}
        />

        {/* Play button overlay - only visible on hover */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out rounded-2xl ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.9]'
          }`}
        >
          <div className="bg-black/20 flex items-center justify-center rounded-full backdrop-blur-md size-28">
            <div
              className={`flex items-center justify-center bg-gradient-to-b from-[#10B77F]/80 to-[#249361] shadow-md rounded-full size-20 transition-all ease-out duration-200 relative ${
                isHovered ? 'scale-[1.1]' : 'scale-100'
              }`}
            >
              <Play
                className="size-8 text-white fill-white transition-transform duration-200 ease-out"
                style={{
                  filter:
                    'drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06))',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isVideoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleCloseVideo}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
          >
            <motion.div
              {...selectedAnimation}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full max-w-5xl aspect-video mx-4 md:mx-0"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                onClick={handleCloseVideo}
                className="absolute -top-14 right-0 text-white text-xl bg-neutral-900/50 ring-1 ring-white/20 backdrop-blur-md rounded-full p-2 hover:bg-neutral-800/70 transition-colors"
              >
                <XIcon className="size-5" />
              </motion.button>
              <div className="size-full border-2 border-white/20 rounded-2xl overflow-hidden isolate z-[1] relative bg-black">
                <video
                  ref={dialogVideoRef}
                  src={videoSrc}
                  controls
                  autoPlay
                  className="size-full rounded-2xl"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
