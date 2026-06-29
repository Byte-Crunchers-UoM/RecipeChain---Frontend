"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Poppins } from 'next/font/google';
import AdminSidebar from '@/app/components/layout/AdminSidebar';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Bell, LayoutGrid, Users, FileText, UserCheck,
  Clock, DollarSign, CheckCircle2, FilePlus,
  UserX,
  XCircle
} from 'lucide-react';

const customFont = Poppins({ subsets: ['latin'], weight: ['500', '600', '700'] });

export default function AdminDashboard() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('Admin User');
  const [isAuthorizing, setIsAuthorizing] = useState(true);

  //This holds the live data from your Express backend
  const [liveStats, setLiveStats] = useState<any>(null);

  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartView, setChartView] = useState<'revenue' | 'transactions'>('revenue');

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
        console.log("API Response:", data);

        if (response.ok) {
          setLiveStats(data.data);
          setRecentActivities(data.data.activities || []);
          setChartData(data.data.chartData || []);
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
  const getIconProps = (type: string) => {
    switch (type) {
      case 'PURCHASE':
        return { icon: FileText, iconBg: "bg-[#EBF7F6]", iconColor: "text-[#149984]" };
      case 'APPROVAL':
        return { icon: CheckCircle2, iconBg: "bg-green-50", iconColor: "text-green-500" };
      case 'REGISTRATION':
        return { icon: Users, iconBg: "bg-purple-50", iconColor: "text-purple-500" };
      case 'SELLER_VERIFICATION':
        return { icon: UserCheck, iconBg: "bg-blue-50", iconColor: "text-blue-500" };
      case 'SELLER_REJECTION':
        return { icon: UserX, iconBg: "bg-orange-50", iconColor: "text-orange-500" };
      case 'USER_BLOCK':
        return { icon: XCircle, iconBg: "bg-red-50", iconColor: "text-red-600" };

      default:
        return { icon: FilePlus, iconBg: "bg-blue-50", iconColor: "text-blue-500" };
    }
  };


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

          {/* Live Dual-Line Chart */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#23262f]">Platform Growth</h3>
                <p className="text-xs text-gray-500 font-medium">Revenue (XRP) &amp; Transactions per month</p>
              </div>
              <div className="flex bg-gray-50 p-1 rounded-lg">
                <button
                  onClick={() => setChartView('revenue')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${chartView === 'revenue'
                      ? 'bg-[#149984] text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Revenue
                </button>
                <button
                  onClick={() => setChartView('transactions')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${chartView === 'transactions'
                      ? 'bg-[#149984] text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Transactions
                </button>
              </div>
            </div>

            {chartData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm font-medium min-h-[200px]">
                No chart data available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                      fontSize: 12,
                      fontWeight: 600
                    }}
                    formatter={(value: any, name: any) =>
                      name === 'revenue'
                        ? [`${value} XRP`, 'Platform Revenue']
                        : [value, 'Transactions']
                    }
                  />
                  <Legend
                    formatter={(value) =>
                      value === 'revenue' ? 'Platform Revenue (XRP)' : 'Transactions'
                    }
                    wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingTop: 8 }}
                  />
                  {(chartView === 'revenue' || chartView === 'transactions') && (
                    <Line
                      type="monotone"
                      dataKey={chartView}
                      stroke={chartView === 'revenue' ? '#149984' : '#6366f1'}
                      strokeWidth={2.5}
                      dot={{ r: 5, fill: chartView === 'revenue' ? '#149984' : '#6366f1', strokeWidth: 0 }}
                      activeDot={{ r: 7 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>


          {/* Recent Activity List */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-[#23262f]">Recent Activity</h3>
            <p className="text-xs text-gray-500 font-medium mb-6">Latest platform events</p>


            <div className="space-y-6">
              {recentActivities.map((activity, index) => {
                const { icon: Icon, iconBg, iconColor } = getIconProps(activity.activity_type); // Note: Use 'activity_type' here

                return (
                  <div key={index} className="flex gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg} ${iconColor}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-bold text-[#23262f]">{activity.title}</h4>
                        {/* Format the date to look nice */}
                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap ml-2">
                          {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {/* Use 'description' instead of 'desc' */}
                      <p className="text-xs text-gray-500 font-medium mt-0.5">{activity.description}</p>
                    </div>
                  </div>
                );
              })}

              <button className="w-full text-center text-xs font-bold text-[#149984] mt-6 hover:text-[#0f7d6d] transition-colors">
                View All Activity →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}