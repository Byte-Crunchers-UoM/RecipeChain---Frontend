'use client';

import React from 'react';
import { Navbar } from '@/components/layout/NavBar';
import {
  HeroSection,
  FeaturesSection,
  StatsSection,
  HowItWorksSection,
  CTASection,
  FooterSection,
} from '@/components/home';

/**
 * Home Page
 *
 * Main landing page component that composes multiple sections:
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
export default function Home(): React.ReactElement {
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
      <FooterSection />
    </div>
  );
}