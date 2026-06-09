"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Poppins } from 'next/font/google';
import Image from 'next/image';
import AdminSidebar from '@/app/components/layout/AdminSidebar';
import { 
  Bell, ChefHat, Search, MoreVertical, 
  CheckCircle, Clock, XCircle, FileText, Loader2 
} from 'lucide-react';

const customFont = Poppins({ subsets: ['latin'], weight: ['500', '600', '700'] });

interface Recipe {
  recipe_id: string;
  title: string;
  full_name?: string; 
  category: string;
  price_xrp: number;
 approval_status: 'pending' | 'published' | 'rejected'| 'draft';
  created_at: string;
  image_url?: string;
}

export default function RecipesManagement() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    const fetchRecipes = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) return router.push('/admin/login');

      try {
        const response = await fetch('http://localhost:4000/api/recipes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (response.ok && result.success) {
          setRecipes(result.data || []);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecipes();
  }, [router]);

  // Search & Filter Logic
  // Inside RecipesManagement component

// Search & Filter Logic
const filteredRecipes = recipes.filter(r => {
  // 1. Exclude Drafts 
  if (r.approval_status === 'draft') return false;

  // 2. Apply Search Query
  const matchesSearch = 
    (r.title?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (r.full_name?.toLowerCase().includes(searchQuery.toLowerCase()));
  
  // 3. Apply Top Tab Filter (Status)
  const matchesStatus = filterStatus === "All" || r.approval_status === filterStatus;
  
  return matchesSearch && matchesStatus;
});

  return (
    <div className={`min-h-screen bg-[#F8FAFB] flex antialiased ${customFont.className}`}>
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="bg-[#149984] p-3 rounded-xl shadow-md shadow-[#149984]/20">
              <ChefHat className="text-white h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#23262f] tracking-tight">Recipes</h1>
              <p className="text-gray-500 text-sm font-medium">Manage Recipes, Approved or Reject</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Bell className="text-gray-400 h-6 w-6 cursor-pointer hover:text-[#149984] transition-colors" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-[#23262f]">Admin User</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Super Admin</p>
              </div>
              <div className="h-10 w-10 bg-[#149984] rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                AU
              </div>
            </div>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Total Recipes", val: recipes.length, icon: FileText, color: "text-blue-500", bg: "bg-blue-50", key: "all" },
            { label: "Pending Approvals", val: recipes.filter(r => r.approval_status === 'pending').length, icon: Clock, color: "text-orange-500", bg: "bg-orange-50", key: "pending" },
            { label: "Approved", val: recipes.filter(r => r.approval_status === 'published').length, icon: CheckCircle, color: "text-green-500", bg: "bg-green-50", key: "published" },
            { label: "Rejected", val: recipes.filter(r => r.approval_status === 'rejected').length, icon: XCircle, color: "text-red-500", bg: "bg-red-50", key: "rejected" }
          ].map((stat, i) => (
            <button 
              key={i} 
              onClick={() => setFilterStatus(stat.key)}
              className={`p-5 rounded-xl border flex items-center justify-between shadow-sm transition-all hover:scale-[1.02] bg-white ${filterStatus === stat.key ? 'border-[#149984] ring-1 ring-[#149984]' : 'border-gray-100'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}><stat.icon className="h-5 w-5" /></div>
                <span className="text-gray-500 text-xs font-bold">{stat.label}</span>
              </div>
              <span className="text-2xl font-bold text-[#23262f]">{stat.val}</span>
            </button>
          ))}
        </div>

        {/* Search Bar Row */}
        <div className="relative mb-8 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
          <input 
            type="text" 
            placeholder="Search recipes by name or chef..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-[#149984] focus:ring-2 focus:ring-[#149984]/10 transition-all text-[#23262f]"
          />
        </div>

        {/* Table Area */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-[#149984]">
              <Loader2 className="animate-spin h-8 w-8 mb-2" />
              <p className="font-bold text-sm">Loading Recipe Vault...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b border-gray-50 bg-gray-50/50">
                  <th className="px-6 py-4">Recipe</th>
                  <th className="py-4">Chef Name</th>
                  <th className="py-4">Price (XRP)</th>
                  <th className="py-4">Status</th>
                  <th className="py-4">Uploaded Date</th>
                  <th className="py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredRecipes.length > 0 ? filteredRecipes.map((recipe) => (
                  <tr key={recipe.recipe_id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden relative border border-gray-100">
                        {recipe.image_url ? (
                          <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300"><FileText /></div>
                        )}
                      </div>
                      <span className="font-bold text-[#23262f] text-sm">{recipe.title}</span>
                    </td>
                    <td className="py-4 text-sm text-gray-500 font-semibold">{recipe.full_name || 'Unassigned Chef'}</td>
                    <td className="py-4 font-bold text-[#23262f] text-sm">{recipe.price_xrp} XRP</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-bold ${
                        recipe.approval_status === 'published' ? 'bg-green-50 text-green-600' :
                        recipe.approval_status === 'pending' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {recipe.approval_status}
                      </span>
                    </td>
                    <td className="py-4 text-gray-400 text-xs font-bold">
                      {recipe.created_at ? new Date(recipe.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="py-4 text-center">
                      <button
                       onClick={() => {
                            if (recipe.approval_status === 'published') {
                              router.push(`/admin/recipes/view/${recipe.recipe_id}`);
                            } else {
                              // Both 'pending' and 'rejected' recipes go to the verify page
                              router.push(`/admin/recipes/verify/${recipe.recipe_id}`);
                            }
                          }}
                        className="px-4 py-1.5 bg-[#EBF7F6] text-[#149984] text-[10px] font-bold rounded-lg hover:bg-[#149984] hover:text-white transition-all"
                      >
                        VIEW
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="py-20 text-center text-gray-400 italic">No recipes match your criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}