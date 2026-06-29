"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Poppins } from 'next/font/google';
import AdminSidebar from '@/app/components/layout/AdminSidebar';
import {
  LogOut,
  ChefHat,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  Loader2,
} from 'lucide-react';

const poppins = Poppins({ subsets: ['latin'], weight: ['500', '600', '700'] });

type Seller = {
  user_id: string;
  verification_status: 'approved' | 'pending' | 'rejected';
  profile_photo?: string;
  full_name?: string; 
  users?: {
    email?: string;
    wallet_address?: string;
  };
};

///  Normalization 
function normalizeSeller(record: any): Seller {
  return {
    user_id: record.user_id || record.id,
    // Database uses verification_status
    verification_status: record.verification_status || 'pending', 
    profile_photo: record.profile_photo || record.profile_picture || '/default-avatar.png',
    // Database uses display_name 
    full_name: record.display_name || record.users?.display_name || 'Anonymous Chef',
    users: record.users || {}
  };
}

export default function SellerManagement() {
  const router = useRouter();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'approved' | 'pending' | 'rejected'>('All');

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

useEffect(() => {
  const fetchSellers = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      // We use the trailing slash to satisfy strict Express routing
      const response = await fetch('http://localhost:4000/api/sellers/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const payload = await response.json();

      if (response.ok && payload.success) {
        // We use 'display_name' and 'verification_status'
        const normalized = payload.data.map((record: any) => ({
          ...normalizeSeller(record),
          full_name: record.full_name || record.display_name || record.users?.full_name || 'Anonymous Chef',
        }));
        setSellers(normalized);
      }
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setIsLoading(false);
    }
  };
  fetchSellers();
}, [router]); // dependency array is stable now to avoid the previous Hook error

  const filteredSellers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return sellers.filter((seller) => {
      const name = (seller.full_name || '').toLowerCase();
      const email = (seller.users?.email || '').toLowerCase();
      const matchesSearch = !query || name.includes(query) || email.includes(query);
      const matchesStatus = filterStatus === 'All' || seller.verification_status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [sellers, searchQuery, filterStatus]);

  const stats = useMemo(() => [
    { label: 'Total Chefs', value: sellers.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50', key: 'All' },
    { label: 'Pending', value: sellers.filter((s) => s.verification_status === 'pending').length, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50', key: 'pending' },
    { label: 'Active', value: sellers.filter((s) => s.verification_status === 'approved').length, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', key: 'approved' },
    { label: 'Rejected', value: sellers.filter((s) => s.verification_status === 'rejected').length, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', key: 'rejected' },
  ], [sellers]);

  return (
    <div className={`min-h-screen bg-[#F8FAFB] flex antialiased ${poppins.className}`}>
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex flex-col gap-10 xl:flex-row xl:items-center xl:justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="bg-[#149984] p-3 rounded-xl shadow-md">
              <ChefHat className="text-white h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#23262f]">Sellers</h1>
              <p className="text-gray-500 text-sm font-medium">Review and verify chef applications.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-[#23262f]">Admin User</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Super Admin</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="group relative h-10 w-10 bg-[#149984] rounded-full flex items-center justify-center text-white font-bold hover:bg-red-500 transition-colors duration-200"
            >
              <span className="group-hover:hidden">AU</span>
              <LogOut className="hidden group-hover:block h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Stats Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {stats.map((stat) => (
            <button
              key={stat.label}
              onClick={() => setFilterStatus(stat.key as any)}
              className={`p-5 rounded-2xl border flex items-center justify-between transition-all bg-white shadow-sm hover:scale-[1.02] ${filterStatus === stat.key ? 'border-[#149984] ring-1 ring-[#149984]' : 'border-gray-100'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}><stat.icon className="h-5 w-5" /></div>
                <span className="text-gray-500 text-xs font-bold">{stat.label}</span>
              </div>
              <span className="text-2xl font-bold text-[#23262f]">{stat.value}</span>
            </button>
          ))}
        </div>

        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black-1000" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-[#149984] transition-all text-[#23262f] shadow-sm"
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-[#149984]"><Loader2 className="animate-spin h-8 w-8" /></div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b border-gray-50 bg-gray-50/50">
                  <th className="px-8 py-4">Chef Name</th>
                  <th className="py-4">Email Address</th>
                  <th className="py-4 text-center">Status</th>
                  <th className="py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredSellers.map((seller) => (
                  <tr key={seller.user_id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center">
                          <img src={seller.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <p className="font-bold text-[#23262f] text-sm">{seller.full_name}</p>
                      </div>
                    </td>
                    <td className="py-5 text-sm font-semibold text-gray-500 italic">
                      {seller.users?.email || 'N/A'}
                    </td>
                    <td className="py-5 text-center">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase ${
                        seller.verification_status === 'approved' ? 'bg-green-50 text-green-600' :
                        seller.verification_status === 'pending' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {seller.verification_status === 'approved' ? 'Active' : seller.verification_status}
                      </span>
                    </td>
                    <td className="py-5 text-center">
                      <button
                        onClick={() => {
                          const route = seller.verification_status === 'pending' ? 'verify' : 'profile';
                          router.push(`/admin/sellers/${route}/${seller.user_id}`);
                        }}
                        className="px-4 py-1.5 bg-[#EBF7F6] text-[#149984] text-[10px] font-bold rounded-lg hover:bg-[#149984] hover:text-white transition-all shadow-sm"
                      >
                        VIEW
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}