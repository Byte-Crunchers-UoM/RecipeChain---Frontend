import React from 'react';

interface Recipe {
  id: string;
  name: string;
  image: string;
  price: number;
  status: 'Active' | 'Draft' | 'Deactivate';
  performance: number;
  views: number;
  earnings: number;
}

interface RecipesTableProps {
  recipes: Recipe[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active':
      return 'text-green-600 bg-green-50';
    case 'Draft':
      return 'text-yellow-600 bg-yellow-50';
    case 'Deactivate':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-[#64748b] bg-[#f1f5f9]';
  }
};

export default function RecipesTable({ recipes }: RecipesTableProps) {
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
            {recipes.map((recipe) => (
              <tr key={recipe.id} className="border-b border-[#e5e7eb] hover:bg-[#f8fafb] transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-lg flex-shrink-0">
                      {/* Image placeholder */}
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-[#1a2632] font-roboto">{recipe.name}</p>
                      <p className="text-[12px] text-[#64748b] font-roboto">{recipe.views} views</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-[14px] font-medium text-[#1a2632] font-roboto">{recipe.price} XRP</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-[12px] font-medium font-roboto ${getStatusColor(recipe.status)}`}>
                    {recipe.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1 bg-[#e5e7eb] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0d9488]"
                        style={{ width: `${recipe.performance}%` }}
                      />
                    </div>
                    <span className="text-[12px] text-[#64748b] font-roboto">{recipe.performance}%</span>
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
        <a href="#" className="text-[12px] text-[#0d9488] hover:text-[#0d9488] opacity-80 font-medium font-roboto">
          View all recipes →
        </a>
      </div>
    </div>
  );
}
