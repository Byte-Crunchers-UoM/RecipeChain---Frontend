import Link from 'next/link';

export default function RecipeSubmittedPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-lg border border-green-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Recipe submitted successfully</h1>
        <p className="text-gray-700 mb-8">Waiting for admin approval</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/seller/dashboard"
            className="px-5 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/seller/recipes/add"
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Add Another Recipe
          </Link>
        </div>
      </div>
    </main>
  );
}
