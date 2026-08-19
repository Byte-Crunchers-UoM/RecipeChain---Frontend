import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Eye, Unlock, Star } from 'lucide-react';

interface Recipe {
  recipe_id: string;
  title: string;
  price: number;
  status: string;
  approval_status?: string;
  image_url?: string;
  views_count?: number;
  rating_avg?: number;
  created_at: string;
}

interface RecipesTableProps {
  recipes: Recipe[];
}

const RecipeUnlockCount: React.FC<{ recipeId: string }> = ({ recipeId }) => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    async function fetchUnlockCount() {
      const { count: unlockCount, error } = await supabase
        .from('recipe_purchases')
        .select('*', { count: 'exact', head: true })
        .eq('recipe_id', recipeId);

      if (!error && unlockCount !== null) {
        setCount(unlockCount);
      }
    }
    fetchUnlockCount();
  }, [recipeId]);

  return <span>{count || 0}</span>;
};

const RecipesTable: React.FC<RecipesTableProps> = ({ recipes }) => {
  const router = useRouter();

  const getStatusLabel = (status: string, approvalStatus?: string) => {
    const s = status ? status.toLowerCase() : '';
    const a = approvalStatus ? approvalStatus.toLowerCase() : '';

    if (s === 'deactive') {
    return { label: 'Deactivated', classes: 'bg-red-500 text-white' };
  }

  if (a === 'rejected' || s === 'rejected') {
    return { label: 'Rejected', classes: 'bg-red-500 text-white' };
  }
  
  if (a === 'pending') {
    return { label: 'Pending', classes: 'bg-orange-500 text-white' };
  }

  if (a === 'published' || s === 'active') {
    return { label: 'Active', classes: 'bg-[#0d9488] text-white' };
  }

  if (s === 'draft' && a === 'draft') {
    return { label: 'Draft', classes: 'bg-gray-400 text-white' };
  }

  return { label: 'Draft', classes: 'bg-gray-400 text-white' };
};

  return (
    <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#f8fafb] border-b border-[#e5e7eb]">
            <tr>
              <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1a2632] font-roboto">Recipe</th>
              <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1a2632] font-roboto">Price(XRP)</th>
              <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1a2632] font-roboto">Status</th>
              <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1a2632] font-roboto">Unlocks</th>
              <th className="px-6 py-4 text-left text-[14px] font-bold text-[#1a2632] font-roboto">Ratings</th>
            </tr>
          </thead>
          <tbody>
            {/* loop latest 6 recipes  */}
            {recipes.slice(0, 6).map((recipe, index) => {
              const statusInfo = getStatusLabel(recipe.status, recipe.approval_status);

              return (
                <tr
              key={recipe.recipe_id || index}
              className="border-b border-[#e5e7eb] hover:bg-[#f8fafb] transition cursor-pointer"
              onClick={() => router.push(`/seller/recipes/${recipe.recipe_id}`)}
            >
                  {/* Recipe Column */}
                  <td className="px-6 py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {recipe.image_url ? (
                          <img src={recipe.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-gray-400 text-center font-roboto">No Image</span>
                        )}
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-[#1a2632] font-roboto">{recipe.title || "Untitled Recipe"}</p>
                      </div>
                    </div>
                  </td>

                  {/* Price Column */}
                  <td className="px-6 py-4">
                    <p className="text-[14px] font-medium text-[#1a2632] font-roboto">{recipe.price || 0}</p>
                  </td>

                  {/* Status Column */}
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-[12px] ${statusInfo.classes}`}>
                      {statusInfo.label}
                    </span>
                  </td>

                  {/* Unlocks Column */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Unlock className="w-4 h-4 text-teal-600" />
                      <span className="text-[12px] font-bold text-[#1a2632] font-roboto">
                        <RecipeUnlockCount recipeId={recipe.recipe_id} />
                      </span>
                    </div>
                  </td>

                  {/* Ratings Column */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                      <span className="text-[12px] font-roboto">{recipe.rating_avg || 0}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-[#e5e7eb] flex justify-end">
        <Link href="/recipes" className="text-[12px] text-[#0d9488] hover:text-[#0d9488] opacity-80 font-medium font-roboto">
          View all recipes →
        </Link>
      </div>
    </div>
  );
};

export default RecipesTable;