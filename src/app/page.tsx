import Sidebar from "@/components/Sidebar";
import ChefProfileCard from "@/components/ChefProfileCard";
import AboutSpecialties from "@/components/AboutSpecialties";
import CookbookSection from "@/components/CookbookSection";

export default function Home() {
  return (
    <div className="flex flex-row min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-12">
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
      </main>
    </div>
  );
}