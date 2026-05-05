//src/components/recipe/RecipeCartOverlay.tsx
"use client";
import { useRecipeCart } from '@/lib/context/RecipeCartContext';
import { ShoppingCart } from 'lucide-react';
import RecipeCartItem from './RecipeCartItem';

const RecipeCartOverlay = () => {
    const { isOpen, closeCart, cartItems, removeFromCart, isLoading, error } = useRecipeCart();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Dark, blurred background backdrop */}
            <div 
                className="absolute inset-0 bg-black/30 backdrop-blur-sm" 
                onClick={closeCart}
            />

            {/* The sliding panel (Right side) */}
            <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-slide-in-right">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-500 text-white p-2 rounded-full">
                            <ShoppingCart/>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Recipe Cart</h2>
                            <p className="text-sm text-gray-500">{cartItems.length} recipes saved</p>
                        </div>
                    </div>
                    <button onClick={closeCart} className="text-gray-400 hover:text-gray-700 transition">
                        ✕
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {/* Recipe List (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <svg className="animate-spin h-8 w-8 mx-auto text-gray-400 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="text-gray-500">Loading cart...</p>
                            </div>
                        </div>
                    ) : cartItems.length === 0 ? (
                        <p className="text-gray-500 text-center mt-10">Your cart is empty.</p>
                    ) : (
                        cartItems.map((recipe) => (
                            <RecipeCartItem 
                                key={recipe.recipe_id} 
                                recipe={recipe} 
                                onRemove={removeFromCart} 
                            />
                        ))
                    )}
                </div>

                {/* Bottom Actions */}
                {cartItems.length > 0 && (
                    <div className="p-6 border-t border-gray-100 space-y-3">
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecipeCartOverlay;