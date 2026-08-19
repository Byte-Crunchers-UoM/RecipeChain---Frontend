'use client';

import React, { Suspense } from 'react';
import ChefProfileCard from '@/components/chef/ChefProfileCard';
import AboutSpecialties from '@/components/chef/AboutSpecialties';
import CookbookSection from '@/components/chef/CookbookSection';

function ChefProfileContent() {
  return (
    <div className="max-w-[1400px] mx-auto space-y-12">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 items-stretch">
        <div className="xl:col-span-1">
          <ChefProfileCard />
        </div>
        <div className="xl:col-span-2">
          <AboutSpecialties />
        </div>
      </div>

      <CookbookSection />
    </div>
  );
}

export default function ChefProfilePage() {
  return (
    <div className="p-8 lg:p-10 min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto mb-8">
        <h1 className="text-[28px] font-bold font-outfit text-slate-800">Chef Profile</h1>
        <p className="text-slate-400 text-[14px] mt-1">Discover the chef&apos;s story, explore their signature recipes, and follow their culinary journey.</p>
      </div>
      <Suspense fallback={<div className="p-12 text-center text-gray-500">Loading chef profile...</div>}>
        <ChefProfileContent />
      </Suspense>
    </div>
  );
}
