"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getChefRecipes } from "@/services/api";

const RecipeCard = ({ recipe }: { recipe: any }) => {
    const rating = Math.round(recipe.rating_avg || 0);
    const ratingCount = recipe.feedbacks?.[0]?.count || 0;

    return (
        <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full group transition-all hover:shadow-md">
            <div className="h-48 bg-gray-50 relative">
                {/* Recipe Image Placeholder */}
                {recipe.image_url ? (
                    <img
                        src={recipe.image_url}
                        alt={recipe.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                            <path d="M7 2v20" />
                            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                        </svg>
                    </div>
                )}
            </div>

            <div className="p-5 flex flex-col flex-1">
                <h3 className="sub-heading text-[var(--text)] mb-3 font-semibold group-hover:text-[var(--primary)] transition-colors line-clamp-1">{recipe.title}</h3>

                <div className="flex items-center space-x-2 text-[var(--muted)] description mb-4">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{recipe.cook_time} mins</span>
                </div>

                <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                                key={star}
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill={star <= rating ? "#facc15" : "none"}
                                stroke={star <= rating ? "#facc15" : "#d1d5db"}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                        ))}
                        <span className="text-[10px] text-[var(--muted)] font-medium ml-1">{ratingCount}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CookbookSection = ({ chefId: chefIdProp }: { chefId?: string } = {}) => {
    const [recipes, setRecipes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const chefId = chefIdProp ?? user?.user_id ?? null;

    useEffect(() => {
        const fetchRecipes = async () => {
            if (!chefId) {
                setRecipes([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const data = await getChefRecipes(chefId);
                console.log("Chef Recipes Received from API:", data);

                if (data && data.length > 0) {
                    console.log("%c✅ SUCCESS: RECIPES LOADED", "color: blue; font-weight: bold; font-size: 14px;");
                    console.log("Count:", data.length);
                    setRecipes(data);
                } else {
                    console.log("No recipes found for this chef.");
                    setRecipes([]);
                }
            } catch (error) {
                console.error("Error fetching recipes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipes();
    }, [chefId]);

    return (
        <div className="w-full">
            <h2 className="heading mb-8 text-[var(--text)]">My Cookbook</h2>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-80 bg-gray-50 animate-pulse rounded-[24px]"></div>
                    ))}
                </div>
            ) : recipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipes.map((recipe) => (
                        <RecipeCard key={recipe.recipe_id} recipe={recipe} />
                    ))}
                </div>
            ) : (
                <div className="py-12 text-center bg-gray-50 rounded-[32px] border border-dashed border-gray-200">
                    <p className="description text-[var(--muted)]">No recipes found in this chef's cookbook.</p>
                </div>
            )}
        </div>
    );
};

export default CookbookSection;
