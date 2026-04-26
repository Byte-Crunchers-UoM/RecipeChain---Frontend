import React from 'react';

interface Recipe {
  recipe_id: string;
  title: string;
  price: number;
  status: string;
  image_url?: string;
  views_count?: number;
  unlocks_count?: number;
  created_at: string;
}

interface RecipesTableProps {
  recipes: Recipe[];
}

const RecipesTable: React.FC<RecipesTableProps> = ({ recipes }) => {
  return (
    <div className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#f8fafb] border-b border-[#e5e7eb]">
            <tr>
              <th className="px-6 py-4 text-left text-[12px] font-bold text-[#1a2632] font-roboto">Recipe</th>
              <th className="px-6 py-4 text-left text-[12px] font-bold text-[#1a2632] font-roboto">Price</th>
              <th className="px-6 py-4 text-left text-[12px] font-bold text-[#1a2632] font-roboto">Status</th>
              <th className="px-6 py-4 text-left text-[12px] font-bold text-[#1a2632] font-roboto">Performance</th>
              <th className="px-6 py-4 text-left text-[12px] font-bold text-[#1a2632] font-roboto">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recipes.map((recipe, index) => (
              <tr key={recipe.recipe_id || index} className="border-b border-[#e5e7eb] hover:bg-[#f8fafb] transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {recipe.image_url ? (
                        <img src={recipe.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-gray-400 text-center font-roboto">No Image</span>
                      )}
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-[#1a2632] font-roboto">{recipe.title || "Untitled Recipe"}</p>
                      <p className="text-[12px] text-[#64748b] font-roboto">{recipe.views_count || 0} views</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-[14px] font-medium text-[#1a2632] font-roboto">{recipe.price || 0} XRP</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-[12px] font-medium font-roboto ${
                    recipe.status === 'published' ? 'bg-green-100 text-green-700' : 
                    recipe.status === 'deactivate' ? 'bg-red-100 text-red-700' : 
                    recipe.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-gray-100 text-gray-500' // Draft සඳහා Ash color
                  }`}>
                    {recipe.status || 'draft'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-[#64748b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="text-[12px] font-bold text-[#1a2632] font-roboto">{recipe.views_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-[#64748b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-[12px] font-bold text-[#1a2632] font-roboto">{recipe.unlocks_count || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#64748b] font-roboto">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Updated: {recipe.created_at ? new Date(recipe.created_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button className="text-[#64748b] hover:text-[#1a2632] text-lg">⋮</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-[#e5e7eb]">
        <a href="/recipes" className="text-[12px] text-[#0d9488] hover:text-[#0d9488] opacity-80 font-medium font-roboto">
          View all recipes →
        </a>
      </div>
    </div>
  );
};

export default RecipesTable;