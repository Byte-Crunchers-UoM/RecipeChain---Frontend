export default function RecipesPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold">
          Recipes
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-md">
          Browse and discover recipes on the blockchain.
        </p>
      </main>
    </div>
  );
}
