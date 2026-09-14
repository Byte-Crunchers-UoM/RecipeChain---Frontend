import AddRecipeForm from '@/components/AddRecipeForm';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default function AddRecipePage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <Suspense fallback={<div className="flex justify-center p-8 text-slate-500">Loading form...</div>}>
        <AddRecipeForm />
      </Suspense>
    </main>
  );
}
