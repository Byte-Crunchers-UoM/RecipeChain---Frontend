"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getChefProfile, getChefRecipes } from "@/lib/api/chefs";

interface Specialty {
  tag_id: string;
  dietary_tags: string;
}

const AboutSpecialties = () => {
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [bio, setBio] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const chefId = searchParams.get("id");

  useEffect(() => {
    const fetchData = async () => {
      if (!chefId) return;
      setLoading(true);
      try {
        const [profile, recipes] = await Promise.all([
          getChefProfile(chefId),
          getChefRecipes(chefId)
        ]);

        if (profile && profile.seller) {
          setBio(profile.seller.bio || "No bio available.");
        }

        if (recipes && Array.isArray(recipes)) {
          const allTags: string[] = [];
          const seenTags = new Set<string>();

          recipes.forEach((recipe: any) => {
            if (recipe.tags && recipe.tags.dietary_tags) {
              let parsedTags: any[] = [];
              try {
                if (typeof recipe.tags.dietary_tags === 'string') {
                  parsedTags = JSON.parse(recipe.tags.dietary_tags);
                } else if (Array.isArray(recipe.tags.dietary_tags)) {
                  parsedTags = recipe.tags.dietary_tags;
                }
              } catch (e) {
                // If it fails to parse, maybe it's comma-separated
                if (typeof recipe.tags.dietary_tags === 'string') {
                  parsedTags = recipe.tags.dietary_tags.split(',').map((s: string) => s.trim());
                }
              }

              if (Array.isArray(parsedTags)) {
                parsedTags.forEach((tagStr: any) => {
                  const cleanTag = String(tagStr).replace(/[\[\]"']/g, '').trim();
                  if (cleanTag && !seenTags.has(cleanTag)) {
                    seenTags.add(cleanTag);
                    allTags.push(cleanTag);
                  }
                });
              } else if (typeof parsedTags === 'string') {
                const cleanTag = String(parsedTags).replace(/[\[\]"']/g, '').trim();
                if (cleanTag && !seenTags.has(cleanTag)) {
                  seenTags.add(cleanTag);
                  allTags.push(cleanTag);
                }
              }
            }
          });
          setSpecialties(allTags);
        }
      } catch (err) {
        console.error("Error fetching about data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [chefId]);

  return (
    <div className="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100 flex flex-col gap-10">
      {/* About Me Section */}
      <section>
        <h2 className="heading mb-6 text-[var(--text)]"> About Me </h2>
        <p className="description text-[var(--muted)] leading-relaxed text-justify min-h-[3rem]">
          {loading ? "Loading bio..." : bio}
        </p>
      </section>

      {/* Specialties Section */}
      <section>
        <h2 className="heading mb-6 text-[var(--text)]"> Specialties </h2>
        {loading ? (
          <p className="description text-[var(--muted)]">Loading specialties...</p>
        ) : specialties.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {specialties.map((specialty, index) => (
              <span
                key={index}
                className="px-6 py-2.5 bg-[var(--secondary)] text-[var(--primary)] rounded-full sub-heading font-medium transition-all hover:brightness-95 cursor-default">
                {specialty}
              </span>
            ))}
          </div>
        ) : (
          <p className="description text-[var(--muted)]">No specialties found.</p>
        )}
      </section>
    </div>
  );
};

export default AboutSpecialties;