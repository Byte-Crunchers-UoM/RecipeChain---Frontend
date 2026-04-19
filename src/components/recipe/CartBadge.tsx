"use client";

import React from 'react';
import { useRecipeCart } from '@/lib/context/RecipeCartContext';
import { ShoppingCart } from 'lucide-react';

export default function CartBadge() {
    const { cartItems, toggleCart } = useRecipeCart();

    return (
        <button 
            onClick={toggleCart}
            className="relative p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
        >
            <ShoppingCart className="w-6 h-6" />
            {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {cartItems.length}
                </span>
            )}
        </button>
        
    );
}