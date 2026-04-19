import React from 'react';
import { Sparkles, ShoppingBag, ArrowRight, Bot, DollarSign } from 'lucide-react';
import { Navbar } from '@/components/layout/NavBar';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { BrowseMarketplaceBtn } from '@/components/ui/MarcketplaceButton';
export default function Home() {
  // Mock data - In industry, this would often be fetched from a server component or CMS
  const featuredRecipes = {
    sushi: {
      id: '1',
      title: 'Premium Sushi Roll',
      chefName: 'Chef Yuki S.',
      price: 2.00,
      currency: 'USDC',
      imageUrl: '/api/placeholder/240/140', // Replace with items from public/images
    },
    pasta: {
      id: '2',
      title: 'Truffle Pasta',
      chefName: 'Chef Marco R.',
      price: 1.50,
      currency: 'USDC',
      imageUrl: '/api/placeholder/280/160',
      tags: ['Italian', 'Luxury'],
      isLocked: true,
    }
  };

  return (
    <div className="min-h-screen bg-[#eaf7f0] font-sans text-slate-900 overflow-hidden">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 pt-16 pb-24 grid md:grid-cols-2 gap-12 items-center">
        {/* Left Column - Content */}
        <div className="flex flex-col gap-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold w-max border border-green-200">
            <Sparkles size={16} />
            CRYPTO-POWERED RECIPE MARKETPLACE
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight text-slate-900">
            Buy & Sell <br/>
            <span className="text-[#16a34a]">Chef Recipes</span> <br/>
            with Crypto
          </h1>
          
          <p className="text-lg text-slate-500 max-w-md leading-relaxed">
            Unlock professional chef recipes for just <span className="font-bold text-[#d97706]">$0.50–$2.00</span> in crypto. Let our AI find the perfect dish for any occasion — and help you cook it flawlessly.
          </p>
          
          <div className="flex flex-wrap items-center gap-4 mt-4">
            
              <BrowseMarketplaceBtn/>
            
            <button className="flex items-center gap-2 bg-transparent border-2 border-green-200 text-[#16a34a] px-6 py-3.5 rounded-xl font-semibold hover:bg-green-50 transition-colors">
              <Bot size={20} />
              Ask AI Chef
            </button>
          </div>
        </div>

        {/* Right Column - Floating Layout */}
        <div className="relative h-150 hidden md:block w-full">
          
          {/* Card 1: Sushi */}
          <div className="absolute top-4 left-4 w-64 z-20">
             <RecipeCard recipe={featuredRecipes.sushi} className="p-4" />
          </div>

          {/* Card 2: Pasta */}
          <div className="absolute top-32 right-12 w-72 z-10">
            <RecipeCard recipe={featuredRecipes.pasta} />
          </div>

          {/* Floating Badge: Earnings */}
          <div className="absolute top-52 -right-4 bg-white p-4 rounded-2xl shadow-lg border border-slate-50 flex flex-col gap-1 z-30">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#16a34a]">
              <DollarSign size={16} className="bg-amber-100 rounded-full p-0.5" />
              Chef Earned
            </div>
            <div className="text-2xl font-black text-slate-800">+$847.50</div>
            <div className="text-xs text-slate-400">this month</div>
          </div>

          {/* Floating Card: AI Bot */}
          <div className="absolute bottom-12 right-20 bg-white p-5 rounded-3xl shadow-xl w-72 z-30 border border-slate-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-orange-100 p-2 rounded-xl text-orange-500">
                <Bot size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">AI Chef Bot</h4>
                <div className="flex items-center gap-1 text-xs text-[#16a34a]">
                  <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse"></span>
                  Online now
                </div>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-400 italic">
              "Find me a keto dinner for 4..."
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}