"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Poppins } from 'next/font/google';
import AdminSidebar from '@/app/components/layout/AdminSidebar';
import { 
  LogOut, Users, Search, UserCheck, UserX, Loader2, User
} from 'lucide-react';

const customFont = Poppins({ subsets: ['latin'], weight: ['500', '600', '700'] });

interface Buyer {
  user_id: string;
  display_name: string;
  status: string | null;
  profile_picture?: string; // Matching your DB column name 'profile_picture'
  users?: {
    email: string;
    full_name: string;
  };
}

export default function BuyerManagement() {
  const router = useRouter();
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  useEffect(() => {
    const fetchBuyers = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) return router.push('/admin/login');

      try {
        const response = await fetch('http://localhost:4000/api/buyers', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (response.ok && result.success) {
          setBuyers(result.data || []);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBuyers();
  }, [router]);

  // Helper to normalize status for filtering and display
  const getNormalizedStatus = (status: string | null) => {
    return status === 'blocked' ? 'blocked' : 'active';
  };

  const filteredBuyers = buyers.filter(b => {
    const searchLower = searchQuery.toLowerCase().trim();
    const name = (b.display_name || "").toLowerCase();
    const email = (b.users?.email || "").toLowerCase();
    
    const currentStatus = getNormalizedStatus(b.status);

    const matchesSearch = name.includes(searchLower) || email.includes(searchLower);
    const matchesStatus = filterStatus === "All" || currentStatus === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={`min-h-screen bg-[#F8FAFB] flex antialiased ${customFont.className}`}>
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="bg-[#149984] p-3 rounded-xl shadow-md">
              <Users className="text-white h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#23262f]">Buyer Directory</h1>
              <p className="text-gray-500 text-sm font-medium">Monitor customer accounts and purchase status</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right pr-2">
              <p className="text-sm font-bold text-[#23262f]">Admin User</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Super Admin</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="group relative h-10 w-10 bg-[#149984] rounded-full flex items-center justify-center text-white font-bold shadow-sm hover:bg-red-500 transition-colors duration-200"
            >
              <span className="group-hover:hidden">AU</span>
              <LogOut className="hidden group-hover:block h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: "Total Buyers", val: buyers.length, icon: Users, color: "text-blue-500", bg: "bg-blue-50", key: "All" },
            { 
              label: "Active Accounts", 
              val: buyers.filter(b => getNormalizedStatus(b.status) === 'active').length, 
              icon: UserCheck, color: "text-green-500", bg: "bg-green-50", key: "active" 
            },
            { 
              label: "Blocked Users", 
              val: buyers.filter(b => getNormalizedStatus(b.status) === 'blocked').length, 
              icon: UserX, color: "text-red-500", bg: "bg-red-50", key: "blocked" 
            }
          ].map((stat, i) => (
            <button 
              key={i} 
              onClick={() => setFilterStatus(stat.key)}
              className={`p-5 rounded-2xl border flex items-center justify-between transition-all bg-white shadow-sm hover:translate-y-[-2px] ${filterStatus === stat.key ? 'border-[#149984] ring-2 ring-[#149984]/10' : 'border-gray-100'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}><stat.icon className="h-5 w-5" /></div>
                <span className="text-gray-500 text-xs font-bold">{stat.label}</span>
              </div>
              <span className="text-2xl font-black text-[#23262f]">{stat.val}</span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search buyers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-[#149984] transition-all text-[#23262f] shadow-sm"
          />
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-[#149984]"><Loader2 className="animate-spin h-8 w-8" /></div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-50 bg-gray-50/30">
                  <th className="px-8 py-5">Buyer Identity</th>
                  <th className="py-5">Email</th>
                  <th className="py-5 text-center">Status</th>
                  <th className="py-5 text-center">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredBuyers.map((buyer) => (
                  <tr key={buyer.user_id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center">
                          {buyer.profile_picture ? (
                            <img src={buyer.profile_picture} className="w-full h-full object-cover" alt="Avatar" />
                          ) : (
                            <User className="h-5 w-5 text-gray-300" />
                          )}
                        </div>
                        <p className="font-extrabold text-[#23262f] text-sm">
                          {buyer.display_name || 'Anonymous Buyer'}
                        </p>
                      </div>
                    </td>
                    <td className="py-5 text-sm font-bold text-gray-500">
                      {buyer.users?.email || 'N/A'}
                    </td>
                    <td className="py-5 text-center">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                        getNormalizedStatus(buyer.status) === 'blocked' 
                          ? 'bg-red-50 text-red-600' 
                          : 'bg-green-50 text-green-600'
                      }`}>
                        {getNormalizedStatus(buyer.status)}
                      </span>
                    </td>
                    <td className="py-5 text-center">
                      <button 
                        onClick={() => router.push(`/admin/buyers/profile?id=${buyer.user_id}`)}
                        className="px-4 py-1.5 bg-[#EBF7F6] text-[#149984] text-[10px] font-black rounded-lg hover:bg-[#149984] hover:text-white transition-all shadow-sm"
                      >
                        VIEW PROFILE
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