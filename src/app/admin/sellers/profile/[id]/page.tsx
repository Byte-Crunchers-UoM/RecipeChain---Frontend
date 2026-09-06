"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminSidebar from '@/app/components/layout/AdminSidebar';
import { 
  ChefHat, Star, ShoppingBag, Utensils, 
  ArrowLeft, DollarSign, Calendar, ShieldCheck, 
  MapPin, Phone, CreditCard, User, XCircle, AlertCircle
} from 'lucide-react';

export default function ActiveSellerProfile() {
  const { id } = useParams();
  const router = useRouter();
  const [seller, setSeller] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      const apiBase = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiBase}/sellers/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) setSeller(result.data);
    };
    fetchProfile();
  }, [id]);

  if (!seller) return (
    <div className="flex h-screen items-center justify-center bg-[#F8FAFB]">
      <div className="animate-pulse text-gray-400 font-bold">Loading Chef Profile...</div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFB]">
      <AdminSidebar />
      
      <main className="flex-1 p-8 antialiased overflow-y-auto">
        {/* Back Button */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 mb-8 hover:text-[#149984] font-bold transition-all">
          <ArrowLeft size={20} /> Back to Sellers
        </button>

        {/* Header Section */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-[#149984]/10 shadow-inner">
              <img src={seller.profile_photo || '/default-avatar.png'} className="w-full h-full object-cover" alt="Profile" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#23262f]">{seller.display_name}</h1>
              <p className="text-gray-500 font-medium">{seller.users?.email}</p>
              <div className="flex gap-2 mt-4">
                {seller.verification_status === 'rejected' ? (
                  <span className="px-4 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase flex items-center gap-1">
                    <XCircle size={12} /> Rejected
                  </span>
                ) : (
                  <span className="px-4 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase flex items-center gap-1">
                    <ShieldCheck size={12} /> Verified Seller
                  </span>
                )}
                <span className="px-4 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase flex items-center gap-1">
                  <MapPin size={12} /> {seller.nationality}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-8 md:border-l md:pl-8 border-gray-100">
             <div className="text-center">
                <p className="text-gray-400 text-[10px] font-black uppercase mb-1">Rating</p>
                <div className="flex items-center gap-1 text-orange-500 font-black text-2xl">
                   <Star size={20} fill="currentColor" /> {seller.rating || "0.0"}
                </div>
             </div>
             <div className="text-center">
                <p className="text-gray-400 text-[10px] font-black uppercase mb-1">Wallet Status</p>
                <p className={seller.verification_status === 'approved' ? "text-[#149984] font-black text-2xl" : "text-gray-400 font-black text-2xl"}>
                  {seller.verification_status === 'approved' ? 'Active' : 'Inactive'}
                </p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            
            {/* Business Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Total Recipes", val: seller.total_recipes || 0, icon: Utensils, color: "text-purple-600", bg: "bg-purple-50" },
                { label: "Account Balance", val: `${seller.account_balance || 0} XRP`, icon: DollarSign, color: "text-[#149984]", bg: "bg-[#EBF7F6]" },
                { label: "Active Recipes", val: seller.active_recipes || 0, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}><stat.icon size={24} /></div>
                  <div>
                    <p className="text-gray-400 text-[11px] font-bold uppercase">{stat.label}</p>
                    <p className="text-[#23262f] font-bold text-xl">{stat.val}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Personal Information */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-semibold text-[#23262f] mb-8 border-b pb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                <DetailItem icon={<User size={16}/>} label="Full Name" value={seller.full_name} />
                <DetailItem icon={<Calendar size={16}/>} label="Date of Birth" value={seller.date_of_birth ? new Date(seller.date_of_birth).toLocaleDateString() : 'N/A'} />
                <DetailItem icon={<Phone size={16}/>} label="Phone Number" value={seller.phone_no} />
                <DetailItem icon={<CreditCard size={16}/>} label="NIC / ID Number" value={seller.nic_no} />
                <DetailItem icon={<MapPin size={16}/>} label="Residential Address" value={seller.address} fullWidth />
              </div>
            </div>

            {/* --- UPDATED: REJECTION FEEDBACK SECTION --- */}
            {seller.verification_status === 'rejected' && seller.rejection_reason && (
              <div className="bg-red-50 p-8 rounded-3xl border border-red-100 shadow-sm">
                <div className="flex items-center gap-2 text-red-600 mb-4">
                  <AlertCircle size={22} />
                  <h2 className="text-xl font-black">Rejection Feedback</h2>
                </div>
                <div className="bg-white/50 p-5 rounded-2xl border border-red-100">
                  <p className="text-red-900 font-bold leading-relaxed">
                    {(() => {
                      try {
                        const reason = typeof seller.rejection_reason === 'string' 
                          ? JSON.parse(seller.rejection_reason) 
                          : seller.rejection_reason;
                        return reason.summary || "Your application was rejected. Please contact support.";
                      } catch (e) {
                        return "Application rejected. Details stored in legacy format.";
                      }
                    })()}
                  </p>
                </div>
              </div>
            )}

            {/* Biography Section */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-semibold text-[#23262f] mb-4">Chef Biography</h2>
              <p className="text-gray-600 leading-relaxed font-medium">
                {seller.bio || "No biography information available."}
              </p>
            </div>
          </div>

          {/* Right Column: Timeline & Address */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm sticky top-8">
              <h2 className="text-xl font-semibold text-[#23262f] mb-8">Trust & Safety</h2>
              
              <div className="space-y-8">
                <TimelineItem 
                  label="Application Submitted" 
                  date={seller.verification_submitted_at ? new Date(seller.verification_submitted_at).toLocaleString() : 'Pending'} 
                  status="completed" 
                />
                <TimelineItem 
                  label={seller.verification_status === 'rejected' ? "Admin Rejected" : "Admin Verified"} 
                  date={seller.verified_at || seller.rejected_at ? new Date(seller.verified_at || seller.rejected_at).toLocaleString() : 'In Progress'} 
                  status={seller.verification_status !== 'pending' ? "completed" : "pending"} 
                  isError={seller.verification_status === 'rejected'}
                />
              </div>

              <div className="mt-10 pt-8 border-t border-gray-100">
                <p className="text-[11px] font-black text-gray-400 uppercase mb-4">Blockchain Address</p>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 break-all">
                  <p className="text-[12px] font-mono font-semibold text-[#149984]">{seller.users?.wallet_address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function DetailItem({ label, value, icon, fullWidth = false }: any) {
  return (
    <div className={fullWidth ? "col-span-2" : ""}>
      <p className="text-gray-400 text-[11px] font-black uppercase flex items-center gap-2 mb-2">
        <span className="text-[#149984]">{icon}</span> {label}
      </p>
      <p className="text-[#23262f] font-bold">{value || 'Not provided'}</p>
    </div>
  );
}

function TimelineItem({ label, date, status, isError = false }: any) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`h-4 w-4 rounded-full border-2 ${
          status === 'completed' 
            ? (isError ? 'bg-red-500 border-red-500' : 'bg-[#149984] border-[#149984]') 
            : 'border-gray-300'
        }`} />
        <div className="h-full w-0.5 bg-gray-100" />
      </div>
      <div className="pb-2">
        <p className={`text-sm font-black ${isError ? 'text-red-600' : 'text-[#23262f]'}`}>{label}</p>
        <p className="text-xs font-bold text-gray-400">{date}</p>
      </div>
    </div>
  );
}