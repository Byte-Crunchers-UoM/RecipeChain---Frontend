"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getChefProfile, getChefRecipes } from "@/services/api";

interface Specialty {
  tag_id: string;
  dietary_tags: string;
}

const AboutSpecialties = ({ chefId: chefIdProp }: { chefId?: string } = {}) => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [bio, setBio] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const chefId = chefIdProp ?? user?.user_id ?? null;

  useEffect(() => {
    const fetchData = async () => {
      if (!chefId) {
        setSpecialties([]);
        setBio("");
        setLoading(false);
        return;
      }

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
          const allTags: Specialty[] = [];
          const seenTags = new Set();

          recipes.forEach((recipe: any) => {
            if (recipe.tags) {
              const tag = recipe.tags;
              if (tag && !seenTags.has(tag.tag_id)) {
                seenTags.add(tag.tag_id);
                allTags.push(tag);
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
            {specialties.map((specialty) => (
              <span
                key={specialty.tag_id}
                className="px-6 py-2.5 bg-[var(--secondary)] text-[var(--primary)] rounded-full sub-heading font-medium transition-all hover:brightness-95 cursor-default">
                {specialty.dietary_tags}
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