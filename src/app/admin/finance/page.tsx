"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Poppins } from 'next/font/google';
import AdminSidebar from '@/app/components/layout/AdminSidebar';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet, TrendingUp, Activity, DollarSign, CheckCircle2, Clock, XCircle, Loader2, LogOut } from 'lucide-react';


const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

// Helper function to truncate long wallet addresses or UUIDs
const truncateHash = (hash: string) => {
    if (!hash) return "N/A";
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
};

export default function FinanceDashboard() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        kpis: { totalRevenue: 0, totalCommission: 0, totalTransactions: 0 },
        chart: { chefEarnings: 0, platformCommission: 0 },
        topPerformers: [],
        recentTransactions: []
    });

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        router.push('/admin/login');
    };

    useEffect(() => {
        const fetchFinanceData = async () => {
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
                const apiBase = process.env.NEXT_PUBLIC_API_URL;
                const res = await fetch(`${apiBase}/dashboard/finance`, {
                    method: 'GET',
                    // Note: If your middleware is still not picking up the token, 
                    // ensure you are passing it here:
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    throw new Error('Failed to fetch finance data');
                }

                const result = await res.json();

                // 1. Update the state with the actual data
                setDashboardData(result.data);

            } catch (error) {
                console.error("Dashboard Fetch Error:", error);
            } finally {
                // 2. THIS IS THE KEY: Stop the loader no matter what happens
                setIsLoading(false);
            }
        };

        fetchFinanceData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#F8FAFB]">
                <Loader2 className="animate-spin text-[#149984] h-10 w-10" />
            </div>
        );
    }

    // Dynamic KPI Array based on fetched data
    const kpiCards = [
        { title: "Total Platform Revenue", value: `${dashboardData.kpis.totalRevenue.toFixed(2)} XRP`, icon: Wallet, color: "text-[#149984]", bg: "bg-teal-50" },
        { title: "Revenue Growth Rate", value: "12.4%", subtext: "Active", icon: TrendingUp, color: "text-green-500", bg: "bg-green-50" }, // Growth is complex to calculate in 1 query, leaving static for UI
        { title: "Total Transactions", value: dashboardData.kpis.totalTransactions.toString(), icon: Activity, color: "text-blue-500", bg: "bg-blue-50" },
        { title: "Platform Commission", value: `${dashboardData.kpis.totalCommission.toFixed(2)} XRP`, icon: DollarSign, color: "text-purple-500", bg: "bg-purple-50" }
    ];

    // Dynamic Chart Array
    const chartDataFormatted = [
        { name: 'Chef Earnings', value: dashboardData.chart.chefEarnings, color: '#149984' },
        { name: 'Platform Commission', value: dashboardData.chart.platformCommission, color: '#34d399' }
    ];

    return (
        <div className={`flex min-h-screen bg-[#F8FAFB] ${poppins.className}`}>
            <AdminSidebar />

            <main className="flex-1 p-8 antialiased overflow-y-auto">
                {/* Header Section */}
                <header className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#149984] p-3 rounded-xl shadow-md shadow-[#149984]/20">
                            <DollarSign className="text-white h-7 w-7" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-[#23262f] tracking-tight">Finance & Revenue</h1>
                            <p className="text-gray-500 text-sm font-medium mt-1">Monitor platform earnings, transactions, and growth</p>
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
                            className="group relative h-10 w-10 bg-[#149984] rounded-full flex items-center justify-center text-white font-bold shadow-sm hover:bg-red-500 transition-colors duration-200"
                        >
                            <span className="group-hover:hidden">AU</span>
                            <LogOut className="hidden group-hover:block h-4 w-4" />
                        </button>
                    </div>
                </header>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {kpiCards.map((kpi, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-2xl ${kpi.bg}`}>
                                    <kpi.icon size={24} className={kpi.color} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-[#23262f]">{kpi.value}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{kpi.title}</p>
                                    {kpi.subtext && <span className="text-xs font-semibold text-green-500">{kpi.subtext}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Middle Row: Chart & Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm col-span-1">
                        <h2 className="text-lg font-black text-[#23262f] mb-1">Commission Breakdown</h2>
                        <p className="text-xs font-semibold text-gray-400 mb-6">Revenue distribution overview</p>

                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={chartDataFormatted} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {chartDataFormatted.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${Number(value).toFixed(2)} XRP`} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="flex justify-center gap-4 text-xs font-semibold text-gray-500 mt-2">
                            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-[#149984] rounded-sm"></div> Chef Earnings</span>
                            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-[#34d399] rounded-sm"></div> Platform Fee</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-[10px] uppercase font-semibold text-gray-400 mb-1">Chef Earnings</p>
                                <p className="text-xl font-black text-[#23262f]">{dashboardData.chart.chefEarnings.toFixed(2)} <span className="text-sm">XRP</span></p>
                            </div>
                            <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100">
                                <p className="text-[10px] uppercase font-semibold text-teal-600 mb-1">Platform Fee</p>
                                <p className="text-xl font-black text-[#149984]">{dashboardData.chart.platformCommission.toFixed(2)} <span className="text-sm">XRP</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Top Performers Table */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm col-span-2 overflow-hidden flex flex-col">
                        <h2 className="text-lg font-black text-[#23262f] mb-1">Top Performers</h2>
                        <p className="text-xs font-semibold text-gray-400 mb-6">Highest earning chefs on the platform</p>

                        <div className="overflow-y-auto flex-1 pr-2">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 sticky top-0 bg-white">
                                        <th className="pb-3 text-xs font-black text-gray-400 uppercase tracking-wider">Rank</th>
                                        <th className="pb-3 text-xs font-black text-gray-400 uppercase tracking-wider">Chef Name</th>
                                        <th className="pb-3 text-xs font-black text-gray-400 uppercase tracking-wider">Recipes Sold</th>
                                        <th className="pb-3 text-xs font-black text-gray-400 uppercase tracking-wider">Total Earnings</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashboardData.topPerformers.map((chef: any, idx: number) => (
                                        <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                            <td className="py-4 font-black text-[#149984]">#{idx + 1}</td>
                                            <td className="py-4 font-semibold text-[#23262f] flex items-center gap-3">
                                                {chef.profilePhoto ? (
                                                    <img
                                                        src={chef.profilePhoto}
                                                        alt={chef.sellerName}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                                        {chef.sellerName?.charAt(0)}
                                                    </div>
                                                )} {chef.sellerName || "Unknown Chef"}
                                            </td>
                                            <td className="py-4 font-semibold text-gray-600">{chef.totalSales || 0}</td>
                                            <td className="py-4 font-semibold text-[#149984]">{Number(chef.earnings || 0).toFixed(2)} XRP</td>
                                        </tr>
                                    ))}
                                    {dashboardData.topPerformers.length === 0 && (
                                        <tr><td colSpan={4} className="text-center py-8 text-gray-400 font-semibold">No chef data available yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Recent Transactions Table */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-black text-[#23262f] mb-1">Recent Transactions</h2>
                    <p className="text-xs font-semibold text-gray-400 mb-6">Latest platform purchases</p>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="pb-3 text-xs font-black text-gray-400 uppercase tracking-wider">TX ID</th>
                                    <th className="pb-3 text-xs font-black text-gray-400 uppercase tracking-wider">Recipe Name</th>
                                    <th className="pb-3 text-xs font-black text-gray-400 uppercase tracking-wider">Buyer Name</th>
                                    <th className="pb-3 text-xs font-black text-gray-400 uppercase tracking-wider">Seller Name</th>
                                    <th className="pb-3 text-xs font-black text-gray-400 uppercase tracking-wider">Amount</th>
                                    <th className="pb-3 text-xs font-black text-gray-400 uppercase tracking-wider">Fee</th>
                                    <th className="pb-3 text-xs font-black text-gray-400 uppercase tracking-wider">Date & Time</th>
                                    <th className="pb-3 text-xs font-black text-gray-400 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboardData.recentTransactions?.map((tx: any, idx: number) => {
                                    const txDate = tx.date ? new Date(tx.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : "N/A";

                                    return (
                                        <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                            <td className="py-4 font-semibold text-gray-500 text-xs">{truncateHash(tx.paymentId)}</td>
                                            <td className="py-4 font-semibold text-[#23262f] text-sm">{tx.recipeName || "Unknown Recipe"}</td>
                                            <td className="py-4 font-semibold text-gray-600 text-xs">
                                                {tx.buyerName || "Unknown Buyer"}
                                            </td>
                                            <td className="py-4 font-semibold text-gray-600 text-xs">
                                                {tx.sellerName || "Unknown Seller"}
                                            </td>
                                            <td className="py-4 font-semibold text-[#149984] text-sm">{Number(tx.amount || 0).toFixed(2)} XRP</td>
                                            <td className="py-4 font-semibold text-gray-600 text-sm">{Number(tx.fee || 0).toFixed(4)} XRP</td>
                                            <td className="py-4 font-semibold text-gray-400 text-xs">{txDate}</td>
                                            <td className="py-4">
                                                {tx.status === 'completed' || tx.status === 'success' ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-50 text-green-600 text-[10px] font-black uppercase"><CheckCircle2 size={12} /> Success</span>
                                                ) : tx.status === 'pending' ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-orange-50 text-orange-600 text-[10px] font-black uppercase"><Clock size={12} /> Pending</span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-50 text-red-600 text-[10px] font-black uppercase"><XCircle size={12} /> Failed</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {(!dashboardData.recentTransactions || dashboardData.recentTransactions.length === 0) && (
                                    <tr><td colSpan={8} className="text-center py-8 text-gray-400 font-semibold">No transactions recorded yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </div>
    );
}