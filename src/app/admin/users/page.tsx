"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Poppins } from 'next/font/google';
import AdminSidebar from '@/app/components/layout/AdminSidebar';
import { 
  Bell, Users, UserCheck, ChefHat, UserMinus, 
  MoreVertical, ChevronDown, Loader2, Search 
} from 'lucide-react';

const customFont = Poppins({ subsets: ['latin'], weight: ['500', '600', '700'] });

interface User {
  user_id: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  wallet_address?: string;
  created_at?: string;
  display_name?: string; 
  full_name?: string;    
}

export default function UsersManagement() {
  const router = useRouter();
  
  const [adminName, setAdminName] = useState('Admin User');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // NEW: Filter State
  const [filterRole, setFilterRole] = useState("all"); // 'all', 'buyer', or 'seller'

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) return router.push('/admin/login');

      const savedUser = localStorage.getItem('adminUser');
      if (savedUser) setAdminName(JSON.parse(savedUser).username || 'Admin User');

      try {
        const response = await fetch('http://localhost:4000/api/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (response.ok && result.success) {
          const allData = result.data || [];
          const filteredList = allData.filter((u: User) => u.role !== 'admin');
          setUsers(filteredList);
        }
      } catch (error) {
        console.error("Database sync error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [router]);

  // UPDATED: Combined Search + Role Filtering Logic
  const filteredUsers = users.filter((user) => {
    const name = (user.role === 'seller' ? user.full_name : user.display_name) || "";
    const searchLower = searchQuery.toLowerCase();
    
    const matchesSearch = 
      name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      (user.wallet_address && user.wallet_address.toLowerCase().includes(searchLower));

    // Role check
    const matchesRole = filterRole === "all" || user.role === filterRole;

    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#149984] mx-auto mb-4" />
          <p className="text-gray-500 font-bold italic animate-pulse">RecipeChain: Syncing User Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#F8FAFB] flex antialiased ${customFont.className}`}>
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* Header */}
        <header className="flex justify-between items-start mb-10">
          <div className="flex items-center gap-4">
            <div className="bg-[#149984] p-3 rounded-xl shadow-md shadow-[#149984]/20">
              <Users className="text-white h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#23262f] tracking-tight">User Management</h1>
              <p className="text-gray-500 text-sm font-medium mt-1">Manage Marketplace Participants</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="h-6 w-6" />
              <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-[#F8FAFB]"></span>
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold text-[#23262f]">{adminName}</p>
                <p className="text-xs text-gray-500 font-medium">Super Admin</p>
              </div>
              <div className="h-11 w-11 bg-[#149984] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
                {adminName.substring(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* 4 Stat Cards - Now Clickable for Filtering */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: "Total Users", val: users.length, icon: Users, color: "text-[#149984]", bg: "bg-[#EBF7F6]", roleKey: "all" },
            { title: "Total Buyers", val: users.filter(u => u.role === 'buyer').length, icon: UserCheck, color: "text-blue-500", bg: "bg-blue-50", roleKey: "buyer" },
            { title: "Total Sellers", val: users.filter(u => u.role === 'seller').length, icon: ChefHat, color: "text-purple-500", bg: "bg-purple-50", roleKey: "seller" },
            { title: "Blocked", val: 0, icon: UserMinus, color: "text-red-500", bg: "bg-red-50", roleKey: "blocked" }
          ].map((card, i) => (
            <button 
              key={i} 
              onClick={() => setFilterRole(card.roleKey)}
              className={`p-6 rounded-2xl border flex justify-between items-center transition-all hover:scale-[1.02] text-left shadow-sm bg-white
                ${filterRole === card.roleKey ? 'border-[#149984] ring-1 ring-[#149984]' : 'border-gray-100'}`}
            >
              <div>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">{card.title}</p>
                <h3 className="text-3xl font-bold text-[#23262f]">{card.val}</h3>
              </div>
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${card.bg} ${card.color}`}>
                <card.icon className="h-6 w-6" />
              </div>
            </button>
          ))}
        </div>

        {/* Search & Active Filter Info */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, email, or wallet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-[#23262f] font-semibold focus:ring-2 focus:ring-[#149984]/20 focus:border-[#149984] outline-none shadow-sm transition-all placeholder:text-gray-400 placeholder:font-normal"
            />
          </div>
          {filterRole !== 'all' && (
            <button 
              onClick={() => setFilterRole('all')}
              className="px-4 py-2 bg-[#EBF7F6] text-[#149984] rounded-2xl text-xs font-bold flex items-center gap-2 border border-[#149984]/20"
            >
              Clear Filter: <span className="capitalize">{filterRole}</span>
            </button>
          )}
        </div>

        {/* Main User Table */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[400px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b border-gray-50">
                  <th className="pb-4">User Details</th>
                  <th className="pb-4">Email Address</th>
                  <th className="pb-4">Wallet</th>
                  <th className="pb-4">Role</th>
                  <th className="pb-4">Join Date</th>
                  <th className="pb-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const name = user.role === 'seller' ? user.full_name : user.display_name;
                    const displayName = name || user.email.split('@')[0];
                    const initials = displayName.substring(0, 2).toUpperCase();

                    return (
                      <tr key={user.user_id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="py-5 flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-[#EBF7F6] text-[#149984] flex items-center justify-center font-bold text-sm shadow-sm border-2 border-white">
                            {initials}
                          </div>
                          <span className="font-bold text-[#23262f]">{displayName}</span>
                        </td>
                        <td className="py-5 text-gray-500 text-sm font-medium">{user.email}</td>
                        <td className="py-5">
                          <code className="text-[10px] bg-gray-50 px-2 py-1 rounded text-gray-400 border border-gray-100 font-mono">
                            {user.wallet_address ? `${user.wallet_address.substring(0, 12)}...` : 'N/A'}
                          </code>
                        </td>
                        <td className="py-5">
                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-tight border ${
                            user.role === 'seller' 
                              ? 'bg-purple-50 text-purple-600 border-purple-100' 
                              : 'bg-blue-50 text-blue-600 border-blue-100'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-5 text-gray-400 text-xs font-bold">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-5 text-center">
                          <button 
                            onClick={() => router.push(`/admin/users/${user.user_id}`)}
                            className="px-5 py-2 bg-[#EBF7F6] text-[#149984] text-xs font-bold rounded-xl hover:bg-[#149984] hover:text-white transition-all duration-200 shadow-sm border border-[#149984]/10"
                          >
                            VIEW
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-gray-400 italic">
                      No {filterRole === 'all' ? '' : filterRole + 's'} found matching your query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}