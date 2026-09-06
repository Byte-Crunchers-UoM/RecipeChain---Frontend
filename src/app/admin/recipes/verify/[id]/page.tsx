"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Poppins } from 'next/font/google';
import AdminSidebar from '@/app/components/layout/AdminSidebar';
import {
    CheckCircle, XCircle, Clock, ChevronLeft,
    Loader2, MessageSquare, Utensils, List
} from 'lucide-react';

const poppins = Poppins({ subsets: ['latin'], weight: ['500', '600', '700'] });

export default function RecipeVerificationDetail() {
    const { id } = useParams();
    const router = useRouter();
    const [recipe, setRecipe] = useState<any>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [adminNote, setAdminNote] = useState("");

    //State to toggle the Reject Panel visibility
    const [showRejectPanel, setShowRejectPanel] = useState(false);

    useEffect(() => {
        const fetchRecipe = async () => {
            const token = localStorage.getItem('adminToken');
            try {
                const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
                const res = await fetch(`${apiBase}/recipes/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await res.json();
                if (result.success) setRecipe(result.recipe);
            } catch (err) {
                console.error("Failed to fetch recipe details", err);
            }
        };
        fetchRecipe();
    }, [id]);

    const handleAction = async (approval_status: 'published' | 'rejected') => {
        if (approval_status === 'rejected' && !adminNote.trim()) {
            alert("Please provide a reason for rejection.");
            return;
        }

        setIsUpdating(true);
        const token = localStorage.getItem('adminToken');

        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
            const res = await fetch(`${apiBase}/recipes/${id}/verify`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    approval_status,
                    rejection_reason: adminNote 
                })
            });

            if (res.ok) router.push('/admin/recipes');
        } catch (err) {
            console.error("Update failed", err);
        } finally {
            setIsUpdating(false);
        }
    };

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

                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-extrabold text-[#23262f]">{recipe.title}</h1>
                    <span className="px-5 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-black uppercase tracking-widest">
                        {recipe.approval_status || 'pending'}
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">

                        {/* Show this if the recipe already has a rejection reason */}
                        {recipe.approval_status === 'rejected' && (
                        <div className="mb-8 p-6 bg-red-50 border-2 border-red-100 rounded-3xl flex items-start gap-4 shadow-sm">
                            <div className="bg-red-500 p-2 rounded-xl text-white shadow-md">
                            <XCircle size={24} />
                            </div>
                            <div>
                            <h3 className="text-red-800 font-black text-[10px] uppercase tracking-widest mb-1">Current Rejection Reason</h3>
                            <p className="text-red-700 font-bold text-lg leading-tight">
                                {recipe.rejection_reason || "No feedback found in database."}
                            </p>
                            </div>
                        </div>
                        )}
                        {/* Recipe Image Preview */}
                        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="relative h-[400px] w-full rounded-2xl overflow-hidden border border-gray-100">
                                <img
                                    src={recipe.image_url || '/placeholder-recipe.jpg'}
                                    className="w-full h-full object-cover"
                                    alt="Recipe Preview"
                                />
                                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl">
                                    <p className="text-white text-[10px] font-black uppercase tracking-widest">Main Display Image</p>
                                </div>
                            </div>
                        </div>

                        {/* Recipe Basic Info */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-black text-[#23262f] mb-8 border-b pb-4">Recipe Summary</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                <div>
                                    <p className="text-gray-400 font-bold mb-1 uppercase text-[10px]">Price</p>
                                    <p className="font-extrabold text-[#149984] text-lg">{recipe.price} XRP</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 font-bold mb-1 uppercase text-[10px]">Cuisine</p>
                                    <p className="font-extrabold text-[#23262f] text-lg capitalize">{recipe.cuisine || 'Not Specified'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 font-bold mb-1 uppercase text-[10px]">Prep Time</p>
                                    <p className="font-extrabold text-[#23262f] text-lg">{recipe.prep_time} mins</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 font-bold mb-1 uppercase text-[10px]">Cook Time</p>
                                    <p className="font-extrabold text-[#23262f] text-lg">{recipe.cook_time} mins</p>
                                </div>
                            </div>
                        </div>
                        {/* Ingredients Display */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-black text-[#23262f] mb-6 flex items-center gap-2">
                                <Utensils size={20} className="text-[#149984]" /> Ingredients
                            </h2>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {recipe.ingredients?.map((item: any, idx: number) => (
                                    <li key={idx} className="p-3 bg-gray-50 rounded-xl text-sm font-bold text-gray-600">
                                        • {item.amount} {item.unit} {item.name}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Instructions Display */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-black text-[#23262f] mb-6 flex items-center gap-2">
                                <List size={20} className="text-[#149984]" /> Instructions
                            </h2>
                            <div className="space-y-4">
                                {recipe.instructions?.map((step: any, idx: number) => (
                                    <div key={idx} className="flex gap-4">
                                        <span className="h-8 w-8 shrink-0 bg-[#149984] text-white rounded-full flex items-center justify-center font-black">{idx + 1}</span>
                                        <p className="text-gray-600 font-medium leading-relaxed">{step.instruction || step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Decision Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-lg sticky top-8">
                            <h2 className="text-xl font-black text-[#23262f] mb-6">Review Decision</h2>

                            {recipe.approval_status === 'pending' ? (
                                !showRejectPanel ? (
                                    /* VIEW 1: Clean View (Red Reject Button) */
                                    <div className="space-y-4">
                                        <button
                                            onClick={() => handleAction('published')}
                                            disabled={isUpdating}
                                            className="w-full py-4 bg-[#149984] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-[#11806e] transition-all disabled:opacity-50 shadow-sm"
                                        >
                                            {isUpdating ? <Loader2 className="animate-spin" /> : <><CheckCircle size={20} /> APPROVE RECIPE</>}
                                        </button>

                                        <button
                                            onClick={() => setShowRejectPanel(true)}
                                            className="w-full py-4 bg-white text-red-600 border-2 border-red-600 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-red-50 transition-all shadow-sm"
                                        >
                                            <XCircle size={20} /> REJECT RECIPE
                                        </button>
                                    </div>
                                ) : (
                                    /* VIEW 2: Rejection Form (Red Border Focus) */
                                    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Feedback to Chef</label>
                                        <textarea
                                            className="w-full p-4 bg-white border-2 border-red-300 rounded-2xl text-sm font-bold text-[#23262f] min-h-[150px] focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-gray-400"
                                                placeholder="Explain why this recipe needs improvement..."
                                                value={adminNote}
                                                onChange={(e) => setAdminNote(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setShowRejectPanel(false)}
                                                className="w-1/3 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-200 transition-all"
                                            >
                                                CANCEL
                                            </button>
                                            <button
                                                onClick={() => handleAction('rejected')}
                                                disabled={isUpdating || !adminNote.trim()}
                                                className="w-2/3 py-3 bg-red-600 text-white rounded-xl font-black text-xs hover:bg-red-700 transition-all disabled:opacity-50 shadow-sm"
                                            >
                                                {isUpdating ? 'PROCESSING...' : 'CONFIRM REJECT'}
                                            </button>
                                        </div>
                                  </div>
                                )
                            ) : (
                                /* VIEW 3: Already processed */
                                <div className="p-4 bg-gray-50 rounded-2xl text-center border border-gray-100">
                                    <p className="text-gray-500 font-bold text-sm">
                                        Already <span className="uppercase">{recipe.approval_status}</span>.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}