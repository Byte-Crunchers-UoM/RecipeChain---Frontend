"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function CookbookTopSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentQuery = searchParams.get("q") || "";
  const [searchText, setSearchText] = useState(currentQuery);

  useEffect(() => {
    setSearchText(currentQuery);
  }, [currentQuery]);

  const pushSearchQuery = (value: string) => {
    const query = value.trim();
    const params = new URLSearchParams(searchParams.toString());

    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }

    const queryString = params.toString();
    const targetPath = pathname || "/buyer/cookbook";

    router.push(queryString ? `${targetPath}?${queryString}` : targetPath);
  };

  const handleSearch = () => {
    pushSearchQuery(searchText);
  };

  const handleClear = () => {
    setSearchText("");
    pushSearchQuery("");
  };

  return (
    <div className="relative w-full max-w-3xl">
      <div className="flex h-12 items-center rounded-full border border-slate-200 bg-white px-5 shadow-sm transition focus-within:ring-2 focus-within:ring-teal-200">
        <input
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSearch();
            }
          }}
          placeholder="Search your cookbook"
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />

        {searchText.trim() ? (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg p-1 transition hover:bg-slate-50"
            aria-label="Clear cookbook search"
          >
            <X size={18} className="text-slate-400" />
          </button>
        ) : null}

        <button
          type="button"
          onClick={handleSearch}
          className="rounded-lg p-1 transition hover:bg-slate-50"
          aria-label="Search cookbook"
        >
          <Search size={19} className="text-slate-500" />
        </button>
      </div>
    </div>
  );
}