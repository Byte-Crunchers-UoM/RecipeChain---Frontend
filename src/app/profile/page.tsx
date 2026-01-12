"use client";

import ProtectedRoute from '@/../components/custom/ProtectedRoute';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen items-center justify-center">
        <main className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold">
            Profile
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-md">
            Manage your recipes and view your blockchain identity.
          </p>
        </main>
      </div>
    </ProtectedRoute>
  );
}
