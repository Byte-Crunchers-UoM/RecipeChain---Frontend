//src/app/home/HomeView.tsx
'use client';

import React from 'react';
import { Navbar } from '@/components/layout/NavBar';
import {
  HeroSection,
  FeaturesSection,
  StatsSection,
  HowItWorksSection,
  CTASection
} from '@/components/home';

/**
 * Home Page - Public Landing Page
 *
 * Displays the public home page with multiple sections:
 * - Hero Section: Hero content with CTA
 * - Features Section: Key feature highlights
 * - Stats Section: Social proof with key metrics
 * - How It Works: Step-by-step process
 * - CTA Section: Final call-to-action
 * - Footer: Navigation and legal links
 *
 * All static content is managed in src/lib/constants/home.constants.ts
 * Section components are in src/components/home/
 */
export default function HomeView(): React.ReactElement {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        <HowItWorksSection />
        <CTASection />
      </main>
    </div>
  );
}
