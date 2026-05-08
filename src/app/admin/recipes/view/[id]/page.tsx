"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Poppins } from 'next/font/google';
import AdminSidebar from '@/app/components/layout/AdminSidebar';
import { 
  ChevronLeft, Loader2, Utensils, List, 
  TrendingUp, Star, DollarSign, Tag, XCircle 
} from 'lucide-react';

const poppins = Poppins({ subsets: ['latin'], weight: ['500', '600', '700'] });

export default function ActiveRecipeView() {
  const { id } = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<any>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      const token = localStorage.getItem('adminToken');
      try {
        const res = await fetch(`http://localhost:4000/api/recipes/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        if (result.success) setRecipe(result.data);
      } catch (err) {
        console.error("Failed to fetch recipe", err);
      }
    };
    fetchRecipe();
  }, [id]);

  if (!recipe) return (
    <div className="flex h-screen items-center justify-center bg-[#F8FAFB]">
      <Loader2 className="animate-spin text-[#149984] h-10 w-10" />
    </div>
  );

  return (
  <div className={`flex min-h-screen bg-[#F8FAFB] ${poppins.className}`}>
    <AdminSidebar />
    <main className="flex-1 p-8 antialiased">
      <button onClick={() => router.push('/admin/recipes')} className="flex items-center gap-2 text-gray-700 mb-6 hover:text-[#149984] font-bold transition-colors">
        <ChevronLeft size={20} /> Back to Recipes
      </button>

      {/* Rejection Reason Alert (Only shows if status is rejected) */}
      {recipe.approval_status === 'rejected' && (
        <div className="mb-8 p-6 bg-red-50 border-2 border-red-100 rounded-3xl flex items-start gap-4 shadow-sm">
          <div className="bg-red-500 p-2 rounded-xl text-white shadow-md">
            <XCircle size={24} />
          </div>
          <div>
            <h3 className="text-red-800 font-black text-xs uppercase tracking-widest mb-1">Rejection Reason</h3>
            <p className="text-red-700 font-bold text-lg leading-tight">
              {recipe.chef_note || "No specific feedback provided by the admin."}
            </p>
          </div>
        </div>
      )}

      {/* Hero Section with Image */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-10">
        <div className="lg:col-span-1 h-[200px] rounded-3xl overflow-hidden border-4 border-white shadow-xl relative group">
          <img 
            src={recipe.image_url || '/placeholder-recipe.jpg'} 
            alt={recipe.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-black text-[#149984] shadow-sm">
            RECIPE PREVIEW
          </div>
        </div>

        {/* Header Info */}
        <div className="lg:col-span-4 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            {/* DYNAMIC BADGE */}
            <span className={`px-5 py-2 rounded-full text-sm font-black uppercase tracking-widest border ${
              recipe.approval_status === 'rejected' 
              ? 'bg-red-100 text-red-700 border-red-200' 
              : 'bg-green-100 text-green-700 border-green-200'
            }`}>
              {recipe.approval_status === 'rejected' ? 'REJECTED' : 'ACTIVE'}
            </span>
            <span className="text-gray-400 font-bold text-sm italic">
              Created on {new Date(recipe.created_at).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-5xl font-semibold text-[#23262f] mb-4 leading-tight">{recipe.title}</h1>
          <p className="text-gray-500 font-medium text-lg max-w-2xl">{recipe.description}</p>
        </div>
      </div>
        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 text-blue-500 mb-2">
              <DollarSign size={20} /> <span className="text-[10px] font-black uppercase text-gray-400">Price</span>
            </div>
            <p className="text-2xl font-black text-[#23262f]">{recipe.price} XRP</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 text-yellow-500 mb-2">
              <Star size={20} /> <span className="text-[10px] font-black uppercase text-gray-400">Rating</span>
            </div>
            <p className="text-2xl font-black text-[#23262f]">{recipe.rating_avg || '0.0'}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 text-purple-500 mb-2">
              <Tag size={20} /> <span className="text-[10px] font-black uppercase text-gray-400">Difficulty</span>
            </div>
            <p className="text-2xl font-black text-[#23262f] capitalize">{recipe.difficulty_level}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 text-[#149984] mb-2">
              <TrendingUp size={20} /> <span className="text-[10px] font-black uppercase text-gray-400">Cook Time</span>
            </div>
            <p className="text-2xl font-black text-[#23262f]">{recipe.cook_time} Min</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ingredients Section */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-black text-[#23262f] mb-6 flex items-center gap-2">
              <Utensils size={20} className="text-[#149984]" /> Ingredients List
            </h2>
            <div className="space-y-3">
              {recipe.ingredients?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="font-bold text-[#23262f]">{item.name}</span>
                  <span className="text-[#149984] font-black">{item.amount} {item.unit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions Section */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-black text-[#23262f] mb-6 flex items-center gap-2">
              <List size={20} className="text-[#149984]" /> Cooking Steps
            </h2>
            <div className="space-y-6">
              {recipe.instructions?.map((step: any, idx: number) => (
                <div key={idx} className="relative pl-10 border-l-2 border-dashed border-gray-100 pb-2">
                  <span className="absolute -left-[17px] top-0 h-8 w-8 bg-white border-2 border-[#149984] text-[#149984] rounded-full flex items-center justify-center font-black text-sm shadow-sm">
                    {idx + 1}
                  </span>
                  <p className="text-gray-600 font-bold leading-relaxed">{step.instruction || step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}