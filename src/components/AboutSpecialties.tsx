"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/services/supabaseClient";

interface Specialty {
  tag_id: string;
  dietary_tags: string;
}

const AboutSpecialties = () => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [bio, setBio] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Hardcoded ID for demonstration purposes (same as ChefProfileCard)
  const chefId = "d41deb90-482a-4372-9855-c3eb1076538e";

  useEffect(() => {
    const fetchSpecialties = async () => {
      setLoading(true);

      // Fetch specialties (via recipes) and bio
      const [sellerResponse, recipesResponse] = await Promise.all([
        supabase.from("sellers").select("bio").eq("user_id", chefId).single(),
        supabase
          .from("recipes")
          .select(`
            tags (
              tag_id,
              dietary_tags
            )
          `)
          .eq("chef_id", chefId)
      ]);

      if (sellerResponse.error) {
        console.error("Error fetching seller bio:", sellerResponse.error.message);
      } else {
        setBio(sellerResponse.data?.bio?.trim() ? sellerResponse.data.bio : "No bio available.");
      }

      if (recipesResponse.error) {
        console.error("Error fetching specialties:", recipesResponse.error.message);
      } else {
        // Extract unique tags from the recipes result
        const rawTags = recipesResponse.data
          ?.map((item: any) => item.tags)
          .filter((tag: any) => tag !== null);

        // Remove duplicates based on tag_id
        const uniqueTags = Array.from(
          new Map(rawTags.map((tag: any) => [tag.tag_id, tag])).values()
        ) as Specialty[];

        setSpecialties(uniqueTags);
      }

      setLoading(false);
    };

    fetchSpecialties();
  }, []);

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