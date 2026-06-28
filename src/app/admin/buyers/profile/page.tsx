"use client";

import { useEffect, useState, Suspense } from 'react'; 
import { useSearchParams, useRouter } from 'next/navigation';
import AdminSidebar from '@/app/components/layout/AdminSidebar';
import { 
  User, Mail, Wallet, ShoppingBag, 
  ArrowLeft, ShieldAlert, Loader2, Ban, ShieldCheck,
  Hash, Coins, Info
} from 'lucide-react';

// 2. Moved core profile functionality into an isolated content component
function BuyerProfileContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [buyer, setBuyer] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBuyerData = async () => {
    if (!id) return;
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`http://localhost:4000/api/buyers/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error(`Server Error: ${res.status}`);

      const result = await res.json();
      if (result.success) {
        setBuyer(result.data);
      } else {
        setError(result.message || "Failed to load buyer.");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Failed to fetch data. Ensure your backend server is running.");
    }
  };

  useEffect(() => {
    if (id) {
      fetchBuyerData();
    }
  }, [id]);

  const isUserBlocked = buyer?.status === 'blocked';
  const displayStatus = isUserBlocked ? 'Blocked' : 'Active';

  const handleStatusToggle = async () => {
    const newStatus = isUserBlocked ? 'active' : 'blocked';
    
    if (!window.confirm(`Are you sure you want to ${isUserBlocked ? 'UNBLOCK' : 'BLOCK'} this user?`)) return;

    setIsUpdating(true);
    const token = localStorage.getItem('adminToken');

    try {
      const res = await fetch(`http://localhost:4000/api/buyers/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });

      const result = await res.json();
      if (result.success) {
        await fetchBuyerData(); 
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      alert("Network error while updating status.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (error) return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#F8FAFB] gap-4">
      <div className="text-red-500 font-bold">{error}</div>
      <button onClick={() => window.location.reload()} className="text-[#149984] underline font-bold">Try Again</button>
    </div>
  );

  if (!buyer) return (
    <div className="flex h-screen items-center justify-center bg-[#F8FAFB]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-[#149984]" size={40} />
        <div className="text-[#149984] font-black uppercase tracking-widest">Loading Buyer Profile...</div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFB]">
      <AdminSidebar />
      
      <main className="flex-1 p-8 antialiased overflow-y-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 mb-8 hover:text-[#149984] font-bold transition-all">
          <ArrowLeft size={20} /> Back to Directory
        </button>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-[#149984]/10 shadow-inner bg-gray-50">
              <img 
                src={buyer.profile_picture || '/default-avatar.png'} 
                className="w-full h-full object-cover" 
                alt="Buyer" 
              />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#23262f]">{buyer.display_name || 'Anonymous Buyer'}</h1>
              <p className="text-gray-500 font-medium flex items-center gap-2">
                <Mail size={14} /> {buyer.users?.email}
              </p>
              <div className="flex gap-2 mt-4">
                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
                  isUserBlocked ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                }`}>
                  {isUserBlocked ? <Ban size={12}/> : <ShieldCheck size={12}/>}
                  {displayStatus}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleStatusToggle}
              disabled={isUpdating}
              className={`px-8 py-4 rounded-2xl font-black text-sm transition-all flex items-center gap-3 shadow-lg ${
                isUserBlocked 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-white text-red-600 border-2 border-red-100 hover:bg-red-50'
              }`}
            >
              {isUpdating ? <Loader2 className="animate-spin" size={18} /> : (
                isUserBlocked ? 'UNBLOCK BUYER' : <><ShieldAlert size={18} /> BLOCK BUYER</>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-4 rounded-xl bg-orange-50 text-orange-600"><Coins size={24} /></div>
                    <div>
                        <p className="text-gray-400 text-[11px] font-bold uppercase">Account Balance</p>
                        <p className="text-[#23262f] font-black text-xl">{buyer.account_balance || 0} XRP</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-4 rounded-xl bg-blue-50 text-blue-600"><ShoppingBag size={24} /></div>
                    <div>
                        <p className="text-gray-400 text-[11px] font-bold uppercase">Total Purchases</p>
                        <p className="text-[#23262f] font-black text-xl">{buyer.total_purchases || 0}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-black text-[#23262f] mb-4 flex items-center gap-2">
                <Info size={20} className="text-[#149984]" /> Biography
              </h2>
              <p className="text-gray-600 leading-relaxed font-medium">
                {buyer.bio || "No biography provided."}
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-black text-[#23262f] mb-8 border-b pb-4">Technical Details</h2>
              <div className="space-y-6">
                <InfoItem icon={<Wallet size={16}/>} label="XRPL Wallet Address" value={buyer.users?.wallet_address} />
                <InfoItem icon={<Hash size={16}/>} label="Internal System ID" value={buyer.user_id} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-black text-[#23262f] mb-8">Purchase Summary</h2>
              <div className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[11px] font-black text-gray-400 uppercase">Total Spent</span>
                  <span className="text-lg font-black text-[#149984]">{buyer.total_spent_xrep || 0} XRP</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Joined RecipeChain</p>
                  <p className="text-sm font-bold text-[#23262f]">
                    {buyer.created_at ? new Date(buyer.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoItem({ icon, label, value }: any) {
  return (
    <div>
      <p className="text-gray-400 text-[10px] font-black uppercase flex items-center gap-2 mb-2">
        <span className="text-[#149984]">{icon}</span> {label}
      </p>
      <p className="text-[#23262f] font-mono font-bold break-all bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm">
        {value || 'N/A'}
      </p>
    </div>
  );
}

// 3. Export the primary page wrapper wrapped in a Suspense boundary
export default function BuyerProfile() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#F8FAFB]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-[#149984]" size={40} />
          <div className="text-[#149984] font-black uppercase tracking-widest">Loading Client Context...</div>
        </div>
      </div>
    }>
      <BuyerProfileContent />
    </Suspense>
  );
}