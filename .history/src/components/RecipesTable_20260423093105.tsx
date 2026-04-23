import React from 'react';

interface Recipe {
  id: string;
  name: string;
  image: string;
  price: number;
  status: 'Active' | 'Draft' | 'Discontinued';
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
    case 'Discontinued':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export default function RecipesTable({ recipes }: RecipesTableProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900">Recipe</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900">Price</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900">Performance</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recipes.map((recipe) => (
              <tr key={recipe.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-lg flex-shrink-0">
                      {/* Image placeholder */}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{recipe.name}</p>
                      <p className="text-xs text-gray-500">{recipe.views} views</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-900">{recipe.price} XRP</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(recipe.status)}`}>
                    {recipe.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500"
                        style={{ width: `${recipe.performance}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">{recipe.performance}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button className="text-gray-400 hover:text-gray-600 text-lg">⋮</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-gray-200">
        <a href="#" className="text-sm text-cyan-600 hover:text-cyan-700 font-medium">
          View all recipes →
        </a>
      </div>
    </div>
  );
}
