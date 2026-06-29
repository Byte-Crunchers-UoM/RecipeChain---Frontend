'use client';

import { useEffect, useState } from 'react';
import type { Recipe } from '@/lib/types/recipe';

interface RecipeWithId extends Recipe {
  _id?: string;
  id?: string;
}

const panelStyles = {
  fontFamily: "'Roboto', 'Arial', sans-serif",
};

export default function AdminApprovalPanel() {
  const [recipes, setRecipes] = useState<RecipeWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeWithId | null>(null);
  const [updating, setUpdating] = useState(false);

  // Fetch pending recipes
  useEffect(() => {
    const fetchPendingRecipes = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:4000/api/recipes?status=pending');
        if (!response.ok) throw new Error('Failed to fetch pending recipes');
        const data = await response.json();
        setRecipes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRecipes();
  }, []);

  // Approve recipe
  const handleApprove = async (recipeId: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`http://localhost:4000/api/recipes/${recipeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'published' }),
      });

      if (!response.ok) throw new Error('Failed to approve recipe');

      // Remove from pending list
      setRecipes(recipes.filter((r) => (r._id || r.id) !== recipeId));
      setSelectedRecipe(null);
      alert('Recipe approved and published!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setUpdating(false);
    }
  };

  // Reject recipe
  const handleReject = async (recipeId: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`http://localhost:4000/api/recipes/${recipeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'rejected' }),
      });

      if (!response.ok) throw new Error('Failed to reject recipe');

      // Remove from pending list
      setRecipes(recipes.filter((r) => (r._id || r.id) !== recipeId));
      setSelectedRecipe(null);
      alert('Recipe rejected!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={panelStyles}>
        <p style={{ color: '#1a2632', fontSize: '16px' }}>Loading pending recipes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#f8fafb', ...panelStyles }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="mb-8" style={{ color: '#1a2632', fontSize: '24px', fontWeight: 'bold' }}>
          Recipe Approval Panel
        </h1>

        {error && (
          <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5', color: '#991b1b' }}>
            {error}
          </div>
        )}

        {recipes.length === 0 ? (
          <div className="p-6 rounded-lg" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', border: '1px solid #e2e8f0' }}>
            <p style={{ color: '#1a2632', fontSize: '16px' }}>No pending recipes to review.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pending Recipes List */}
            <div className="p-6 rounded-lg h-fit" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', border: '1px solid #e2e8f0' }}>
              <h2 className="mb-4" style={{ color: '#1a2632', fontSize: '16px', fontWeight: '600' }}>
                Pending Recipes ({recipes.length})
              </h2>
              <div className="space-y-2">
                {recipes.map((recipe) => (
                  <button
                    key={recipe._id || recipe.id}
                    onClick={() => setSelectedRecipe(recipe)}
                    className="w-full text-left p-3 rounded-lg transition"
                    style={{
                      backgroundColor: selectedRecipe?._id === recipe._id || selectedRecipe?.id === recipe.id ? '#e0f2f1' : '#f1f5f9',
                      borderLeft: selectedRecipe?._id === recipe._id || selectedRecipe?.id === recipe.id ? '4px solid #0d9488' : '4px solid transparent',
                    }}
                  >
                    <p style={{ color: '#1a2632', fontSize: '14px', fontWeight: '500' }}>{recipe.name}</p>
                    <p style={{ color: '#64748b', fontSize: '12px' }}>{recipe.category}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Recipe Details */}
            {selectedRecipe && (
              <div className="p-6 rounded-lg sticky top-6" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', border: '1px solid #e2e8f0' }}>
                <h2 className="mb-4" style={{ color: '#1a2632', fontSize: '16px', fontWeight: '600' }}>
                  Recipe Details
                </h2>

                <div className="space-y-4 mb-6">
                  <div>
                    <p style={{ color: '#64748b', fontSize: '12px' }}>Name</p>
                    <p style={{ color: '#1a2632', fontSize: '14px', fontWeight: '500' }}>{selectedRecipe.name}</p>
                  </div>

                  <div>
                    <p style={{ color: '#64748b', fontSize: '12px' }}>Description</p>
                    <p style={{ color: '#1a2632', fontSize: '14px' }}>{selectedRecipe.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p style={{ color: '#64748b', fontSize: '12px' }}>Category</p>
                      <p style={{ color: '#1a2632', fontSize: '14px' }}>{selectedRecipe.category}</p>
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '12px' }}>Cuisine</p>
                      <p style={{ color: '#1a2632', fontSize: '14px' }}>{selectedRecipe.cuisine || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p style={{ color: '#64748b', fontSize: '12px' }}>Difficulty</p>
                      <p style={{ color: '#1a2632', fontSize: '14px' }}>{selectedRecipe.difficulty || '-'}</p>
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '12px' }}>Prep Time</p>
                      <p style={{ color: '#1a2632', fontSize: '14px' }}>{selectedRecipe.prepTime} min</p>
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '12px' }}>Cook Time</p>
                      <p style={{ color: '#1a2632', fontSize: '14px' }}>{selectedRecipe.cookTime} min</p>
                    </div>
                  </div>

                  <div>
                    <p style={{ color: '#64748b', fontSize: '12px' }}>Ingredients</p>
                    <ul style={{ color: '#1a2632', fontSize: '14px', paddingLeft: '1.5rem' }}>
                      {selectedRecipe.ingredients.map((ing) => (
                        <li key={ing.id}>
                          {ing.quantity} {ing.unit} {ing.name}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p style={{ color: '#64748b', fontSize: '12px' }}>Instructions</p>
                    <ol style={{ color: '#1a2632', fontSize: '14px', paddingLeft: '1.5rem' }}>
                      {selectedRecipe.instructions.map((inst) => (
                        <li key={inst.id}>{inst.description}</li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => handleApprove(selectedRecipe._id || selectedRecipe.id || '')}
                    disabled={updating}
                    className="flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50"
                    style={{ backgroundColor: '#0d9488' }}
                  >
                    {updating ? 'Processing...' : 'Approve & Publish'}
                  </button>

                  <button
                    onClick={() => handleReject(selectedRecipe._id || selectedRecipe.id || '')}
                    disabled={updating}
                    className="flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50"
                    style={{ backgroundColor: '#ef4444' }}
                  >
                    {updating ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
