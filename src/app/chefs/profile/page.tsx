'use client';

import React, { Suspense } from 'react';
import ChefProfileCard from '@/components/ChefProfileCard';
import AboutSpecialties from '@/components/AboutSpecialties';
import CookbookSection from '@/components/CookbookSection';

export default function ChefProfilePage() {
  return (
    <div className="p-12">
      <Suspense fallback={<div className="p-12 text-center text-gray-500">Loading chef profile...</div>}>
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
      </Suspense>
    </div>
  );
}
