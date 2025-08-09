import Link from "next/link";
import BrandShell from "@/components/BrandShell";
import LayeredArrowGradient from "@/components/LayeredArrowGradient";
import { brand } from "@/lib/brand";

export default function Home() {
  return (
    <BrandShell>
      <div className="space-y-12">
        {/* Hero Section */}
        <LayeredArrowGradient className="rounded-2xl">
          <div className="px-8 py-16 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your Voice Matters
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Help us improve Propellic by sharing your monthly feedback
            </p>
            <Link
              href="/survey"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:opacity-90 active:scale-95"
              style={{ 
                backgroundColor: brand.bg, 
                color: brand.primary 
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8m4 7V9" />
              </svg>
              Share Your Feedback
            </Link>
          </div>
        </LayeredArrowGradient>

        {/* Simple Info Section */}
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6" style={{ color: brand.text }}>
            Quick & Anonymous Employee Feedback
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Help us track employee satisfaction and improve our workplace culture through monthly pulse surveys.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/survey"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-90 active:scale-95"
            style={{ 
              backgroundColor: brand.primary, 
              color: brand.bg 
            }}
          >
            Take Survey
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </BrandShell>
  );
}
