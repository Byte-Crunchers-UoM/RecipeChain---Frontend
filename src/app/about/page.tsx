export default function AboutPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold">
          About RecipeChain
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-md">
          RecipeChain is a decentralized platform for sharing and preserving culinary creations
          through blockchain technology, ensuring authenticity and ownership.
        </p>
      </main>
    </div>
  );
}
