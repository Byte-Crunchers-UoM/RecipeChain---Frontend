"use client";

import React, { useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { supabase } from "@/services/supabaseClient";
import ChefDirectoryCard from "@/components/ChefDirectoryCard";

export default function ExploreChefsPage() {
  const [chefs, setChefs] = useState<any[]>([]);
  const [filteredChefs, setFilteredChefs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchChefs = async () => {
      try {
        setLoading(true);
        // Fetch all sellers and count their recipes
        const { data, error } = await supabase
          .from("sellers")
          .select("user_id, display_name, full_name, profile_photo, nationality, verify_badge_status, recipes(count), followers_count");

        if (error) {
          throw error;
        }

        if (data) {
          const sortedData = data.sort((a, b) => {
            const nameA = (a.display_name || a.full_name || "").toLowerCase();
            const nameB = (b.display_name || b.full_name || "").toLowerCase();
            return nameA.localeCompare(nameB);
          });
          setChefs(sortedData);
          setFilteredChefs(sortedData);
        }
      } catch (error) {
        console.error("Error fetching chefs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChefs();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredChefs(chefs);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const filtered = chefs.filter((chef) => {
      const name = (chef.display_name || chef.full_name || "").toLowerCase();
      return name.includes(lowerQuery);
    });
    setFilteredChefs(filtered);
  }, [searchQuery, chefs]);

  return (
    <div className="p-12 min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto">
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 font-outfit mb-2">Explore Chefs</h1>
            <p className="text-slate-500 text-lg">Explore Our Community of Culinary Experts</p>
          </div>

          <div className="relative w-full md:w-[350px]">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-[#a0aabf]" />
            </div>
            <input
              type="text"
              placeholder="Search culinary experts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#e2e8f0] rounded-full text-slate-700 placeholder-[#a0aabf] focus:outline-none focus:ring-1 focus:ring-slate-300 transition-all text-[15px]"
            />
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 size={40} className="animate-spin text-[#008080]" />
          </div>
        ) : filteredChefs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredChefs.map((chef) => (
              <ChefDirectoryCard key={chef.user_id} chef={chef} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <p className="text-slate-500 text-lg">No chefs found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
