"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Poppins } from 'next/font/google';
import AdminSidebar from '@/app/components/layout/AdminSidebar';
import { 
  Bell, LayoutGrid, Users, FileText, UserCheck, 
  Clock, DollarSign, CheckCircle2, FilePlus 
} from 'lucide-react';

const customFont = Poppins({ subsets: ['latin'], weight: ['500', '600', '700'] });

export default function AdminDashboard() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('Admin User');
  const [isAuthorizing, setIsAuthorizing] = useState(true);
  
  //This holds the live data from your Express backend
  const [liveStats, setLiveStats] = useState<any>(null);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      // 1. Get the token
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      //  Set the Admin's Name
      const savedUser = localStorage.getItem('adminUser');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setAdminName(parsedUser.username || 'Admin User');
      }

      // Fetch the live data from the backend
      try {
        const response = await fetch('http://localhost:4000/api/dashboard/stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          }
        });

        const data = await response.json();

        if (response.ok) {
          // Save the live numbers into React state!
          setLiveStats(data.data); 
        } else {
          localStorage.removeItem('adminToken');
          router.push('/admin/login');
        }

      } catch (error) {
        console.error("Failed to fetch live stats:", error);
      } finally {
        setIsAuthorizing(false);
      }
    };

    checkAuthAndFetchData();
  }, [router]);

  if (isAuthorizing) return <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center text-[#149984] font-bold">Authorizing...</div>;

  // This array now uses your live database numbers instead of the fake ones!
  const stats = [
    { title: "Total Users", value: liveStats?.totalUsers || "0", icon: Users },
    { title: "Total Recipes", value: liveStats?.totalRecipes || "0", icon: FileText },
    { title: "Sellers", value: liveStats?.Sellers || "0", icon: UserCheck },
    { title: "Pending Approvals", value: liveStats?.pendingApprovals || "0", icon: Clock },
    { title: "Total Transactions", value: liveStats?.totalTransactions || "0", icon: DollarSign },
    { title: "Platform Revenue", value: liveStats?.platformRevenue || "0 XRP", icon: DollarSign },
  ];

  // Mock data for recent activity 
  const activities = [
    { title: "New Recipe Purchase", desc: "User @chef_marco purchased 'Italian Carbonara' for 50 XRP", time: "5 min ago", icon: FileText, iconBg: "bg-[#EBF7F6]", iconColor: "text-[#149984]" },
    { title: "Recipe Approved", desc: "Admin approved 'Vegan Buddha Bowl' by @healthychef", time: "12 min ago", icon: CheckCircle2, iconBg: "bg-green-50", iconColor: "text-green-500" },
    { title: "New User Registration", desc: "New chef @cooking_star joined the platform", time: "23 min ago", icon: Users, iconBg: "bg-purple-50", iconColor: "text-purple-500" },
    { title: "Recipe Submitted", desc: "@pastaqueen submitted 'Authentic Pesto Pasta' for review", time: "1 hour ago", icon: FilePlus, iconBg: "bg-blue-50", iconColor: "text-blue-500" },
    { title: "New Recipe Purchase", desc: "User @foodlover bought 'French Macarons' for 75 XRP", time: "2 hours ago", icon: FileText, iconBg: "bg-[#EBF7F6]", iconColor: "text-[#149984]" },
  ];

  return (
    <div className={`min-h-screen bg-[#F8FAFB] flex ${customFont.className}`}>
      
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* Header Section */}
        <header className="flex justify-between items-start mb-10">
          <div className="flex items-center gap-4">
            <div className="bg-[#149984] p-3 rounded-xl shadow-md shadow-[#149984]/20">
              <LayoutGrid className="text-white h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#23262f] tracking-tight">Dashboard</h1>
              <p className="text-gray-500 text-sm font-medium mt-1">View Details about Recipechain</p>
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
                AU
              </div>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-[#23262f]">{stat.value}</h3>
              </div>
              <div className="h-12 w-12 rounded-xl bg-[#EBF7F6] text-[#149984] flex items-center justify-center">
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section: Chart and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Chart Area */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#23262f]">Revenue Growth</h3>
                <p className="text-xs text-gray-500 font-medium">Platform earnings in XRP</p>
              </div>
              <div className="flex bg-gray-50 p-1 rounded-lg">
                <button className="px-4 py-1.5 text-xs font-bold bg-[#149984] text-white rounded-md shadow-sm">Daily</button>
                <button className="px-4 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-700">Monthly</button>
              </div>
            </div>
            
            <div className="flex-1 relative w-full min-h-[200px] mt-4">
              <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-[10px] text-gray-400 font-medium text-right pr-2 border-r border-gray-100">
                <span>280</span><span>210</span><span>140</span><span>70</span><span>0</span>
              </div>
              <div className="absolute left-8 right-0 top-0 bottom-6 border-b border-gray-100 overflow-hidden">
                 <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                    <path d="M0,70 Q10,40 25,50 T50,20 T75,40 T100,10 L100,100 L0,100 Z" fill="#EBF7F6" opacity="0.8"/>
                    <path d="M0,70 Q10,40 25,50 T50,20 T75,40 T100,10" fill="none" stroke="#149984" strokeWidth="2"/>
                 </svg>
              </div>
              <div className="absolute left-8 right-0 bottom-0 h-6 flex justify-between items-end text-[10px] text-gray-400 font-medium px-2">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>
          </div>

          {/* Recent Activity List */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-[#23262f]">Recent Activity</h3>
            <p className="text-xs text-gray-500 font-medium mb-6">Latest platform events</p>
            
            <div className="space-y-6">
              {activities.map((activity, index) => (
                <div key={index} className="flex gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${activity.iconBg} ${activity.iconColor}`}>
                    <activity.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-bold text-[#23262f]">{activity.title}</h4>
                      <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap ml-2">{activity.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">{activity.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full text-center text-xs font-bold text-[#149984] mt-6 hover:text-[#0f7d6d] transition-colors">
              View All Activity →
            </button>
          </div>
          
        </div>
      </main>
    </div>
  );
}