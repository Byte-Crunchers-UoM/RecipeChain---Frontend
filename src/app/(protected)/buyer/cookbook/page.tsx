"use client";

import Image from "next/image";
import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, MoreVertical, Clock, ChevronDown, Search } from "lucide-react";

type Recipe = {
  id: string;
  title: string;
  time: string;
  img: string;
  createdByMe?: boolean;
};

export default function MyCookbookPage() {
  const router = useRouter();
  const params = useSearchParams();

  const initialTab = (params.get("tab") || "all") as "all" | "favorites" | "mine";
  const initialQ = params.get("q") || "";

  const [tab, setTab] = useState<"all" | "favorites" | "mine">(initialTab);
  const [q, setQ] = useState(initialQ);

  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement | null>(null);

  const [favorites, setFavorites] = useState<Record<string, boolean>>({
    "1": true,
    "2": true,
    "6": true,
  });

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (filterOpen && filterRef.current && !filterRef.current.contains(target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [filterOpen]);

  const recipes: Recipe[] = [
    { id: "1", title: "Creamy Garlic Pasta", time: "25 min", img: "/Creamy Garlic Pasta.png" },
    { id: "2", title: "Fluffy Blueberry Pancakes", time: "15 min", img: "/Fluffy Blueberry Pancakes.png", createdByMe: true },
    { id: "3", title: "Mediterranean Quinoa Bowl", time: "15 min", img: "/Mediterranean Quinoa Bowl.png" },
    { id: "4", title: "Decadent Chocolate Lava Cake", time: "30 min", img: "/Decant Chocolate Lava Cake.png", createdByMe: true },
    { id: "5", title: "Herb-Crusted Grilled Chicken", time: "35 min", img: "/Herb-Crusted Grilled Chicken.png" },
    { id: "6", title: "Fresh Salmon Sushi Rolls", time: "45 min", img: "/Fresh Salmon Sushi Rolls.png" },
  ];

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return recipes
      .filter((r) => {
        if (tab === "favorites") return !!favorites[r.id];
        if (tab === "mine") return !!r.createdByMe;
        return true;
      })
      .filter((r) => (query ? r.title.toLowerCase().includes(query) : true));
  }, [recipes, tab, q, favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const runSearch = () => {
    router.replace(`/buyer/cookbook?q=${encodeURIComponent(q)}&tab=${tab}`);
  };

  return (
    <div className="max-w-[1100px]">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Cookbook</h1>
          <p className="text-sm text-gray-500 mt-1">
            Your saved and personalized recipes in one place
          </p>
        </div>

        {/* ✅ Filter dropdown (like your screenshot) */}
        <div ref={filterRef} className="relative">
          <button
            onClick={() => setFilterOpen((s) => !s)}
            className="h-12 w-64 rounded-2xl border border-gray-200 bg-white flex items-center justify-between px-5 text-sm text-gray-600 shadow-sm"
          >
            Filter
            <ChevronDown className="text-gray-500" />
          </button>

          {filterOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden z-50">
              <button className="w-full text-left px-5 py-3 text-sm hover:bg-gray-50">
                Latest
              </button>
              <button className="w-full text-left px-5 py-3 text-sm hover:bg-gray-50">
                Cooking Time
              </button>
              <button className="w-full text-left px-5 py-3 text-sm hover:bg-gray-50">
                Popular
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs + search */}
      <div className="mt-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-3 flex-wrap">
          <Tab active={tab === "all"} onClick={() => setTab("all")}>
            All Recipes
          </Tab>
          <Tab active={tab === "favorites"} onClick={() => setTab("favorites")}>
            Favorites
          </Tab>
          <Tab active={tab === "mine"} onClick={() => setTab("mine")}>
            Created by Me
          </Tab>

          <button
            onClick={() => router.push("/buyer/feedback")}
            className="h-10 px-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50"
          >
            Submit Review
          </button>
        </div>

        {/* ✅ search bar without cartoon icon + real icon left */}
        <div className="w-full sm:w-[360px]">
          <div className="h-12 px-5 rounded-2xl border border-gray-200 bg-white flex items-center gap-3 shadow-sm">
            <Search size={18} className="text-gray-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search recipes"
              className="w-full outline-none text-sm text-gray-700"
              onKeyDown={(e) => {
                if (e.key === "Enter") runSearch();
              }} 
            />
            <button
              onClick={runSearch}
              className="p-2 rounded-xl hover:bg-gray-50 transition"
              aria-label="Search"
            >
              <Search size={18} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-gray-200" />

      {/* Grid */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((r) => (
          <RecipeCard
            key={r.id}
            recipe={r}
            isFav={!!favorites[r.id]}
            onToggleFav={() => toggleFavorite(r.id)}
            onReview={() => router.push(`/buyer/feedback?recipeId=${r.id}`)}
            onFullRecipe={() => router.push(`/recipes/${r.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "h-10 px-4 rounded-xl text-sm transition",
        active ? "bg-teal-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function RecipeCard({
  recipe,
  isFav,
  onToggleFav,
  onReview,
  onFullRecipe,
}: {
  recipe: { id: string; title: string; time: string; img: string };
  isFav: boolean;
  onToggleFav: () => void;
  onReview: () => void;
  onFullRecipe: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // ✅ click outside closes card menu
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuOpen && menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  return (
    // ✅ important: overflow-visible so popup isn't clipped
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-visible">
      <div className="relative h-[160px] rounded-2xl overflow-hidden">
        <Image src={recipe.img} alt={recipe.title} fill className="object-cover" />

        {/* 3 dots */}
        <div ref={menuRef} className="absolute top-3 left-3 z-50">
          <button
            onClick={() => setMenuOpen((s) => !s)}
            className="h-9 w-9 rounded-full bg-white shadow flex items-center justify-center"
          >
            <MoreVertical size={18} className="text-gray-600" />
          </button>

          {/* ✅ visible popup with z-index + positioned */}
          {menuOpen && (
            <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden z-50">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onFullRecipe();
                }}
                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-500"
              >
                Show full recipe
              </button>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-500"
              >
                Show chef
              </button>
            </div>
          )}
        </div>

        {/* Heart */}
        <button
          onClick={onToggleFav}
          className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white shadow flex items-center justify-center z-40"
          aria-label="Toggle favorite"
        >
          <Heart
            size={18}
            className={isFav ? "text-teal-600 fill-teal-600" : "text-gray-500"}
          />
        </button>
      </div>

      <div className="p-4">
        <div className="text-gray-900 font-medium text-sm">{recipe.title}</div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <Clock size={16} className="text-gray-400" />
            {recipe.time}
          </div>

          <button
            onClick={onReview}
            className="rounded-xl bg-teal-600 text-white text-xs px-4 py-2 hover:bg-teal-700 transition shadow-sm"
          >
            Review Recipe
          </button>
        </div>
      </div>
    </div>
  );
}