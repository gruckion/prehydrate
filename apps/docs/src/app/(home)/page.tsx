import Link from 'next/link';
import { HeroVideoDialog } from '@/components/hero-video-dialog';
import { PrehydrateFeatures } from '@/components/prehydrate-features';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-16 md:py-24">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#249361] to-[#10B77F] bg-clip-text text-transparent">
          Prehydrate
        </h1>
        <p className="text-xl md:text-2xl text-fd-muted-foreground mb-8">
          Show users the right content instantly, before React loads.
        </p>
        <Link
          href="/docs"
          className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-[#249361] to-[#10B77F] rounded-lg hover:opacity-90 transition-opacity shadow-lg"
        >
          Get Started
          <svg
            className="ml-2 w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>

      {/* Video Section */}
      <div className="w-full max-w-4xl mx-auto">
        <HeroVideoDialog
          animationStyle="from-center"
          videoSrc="/PrehydrateDemo.mp4"
          thumbnailAlt="Watch Prehydrate demo"
        />
      </div>

      {/* Features Section */}
      <PrehydrateFeatures />
    </div>
  );
}
