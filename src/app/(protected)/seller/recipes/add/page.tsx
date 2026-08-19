import { Suspense } from 'react';
import AddRecipeForm from '@/components/AddRecipeForm';

export default function AddRecipePage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <Suspense fallback={null}>
        <AddRecipeForm />
      </Suspense>
    </main>
  );
}
