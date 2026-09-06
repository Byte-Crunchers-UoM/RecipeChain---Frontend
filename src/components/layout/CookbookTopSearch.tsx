"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface GlobalSearchProps {
  placeholder?: string;
  fallbackPath?: string;
}

export default function CookbookTopSearch({ placeholder = "Search...", fallbackPath = "/buyer/cookbook" }: GlobalSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentQuery = searchParams.get("q") || "";
  const [searchText, setSearchText] = useState(currentQuery);

  useEffect(() => {
    setSearchText(currentQuery);
  }, [currentQuery]);

  const pushSearchQuery = (value: string) => {
    // Note: We don't trim here because if the user types a space, we don't want to lose focus or jump
    // We trim only for the URL parameter
    const query = value.trim();
    const params = new URLSearchParams(searchParams.toString());

    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }

    const queryString = params.toString();
    const targetPath = pathname || fallbackPath;

    router.replace(queryString ? `${targetPath}?${queryString}` : targetPath, { scroll: false });
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
          onChange={(event) => {
            const val = event.target.value;
            setSearchText(val);
            pushSearchQuery(val);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSearch();
            }
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />

        {searchText.trim() ? (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg p-1 transition hover:bg-slate-50"
            aria-label="Clear search"
          >
            <X size={18} className="text-slate-400" />
          </button>
        ) : null}

        <button
          type="button"
          onClick={handleSearch}
          className="rounded-lg p-1 transition hover:bg-slate-50"
          aria-label="Submit search"
        >
          <Search size={19} className="text-slate-500" />
        </button>
      </div>
    </div>
  );
}