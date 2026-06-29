"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Poppins } from 'next/font/google';
import AdminSidebar from '@/app/components/layout/AdminSidebar';
import {
  LogOut,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  MessageSquare,
  AlertTriangle,
  Loader2,
  Star,
  Trash2,
  Check,
  ShieldCheck,
  Calendar,
  Filter
} from 'lucide-react';

const poppins = Poppins({ subsets: ['latin'], weight: ['500', '600', '700'] });

type Review = {
  feedback_id: string;
  buyer_id: string;
  recipe_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  status: 'reported' | 'under review' | 'resolved' | 'approved' | 'removed';
  buyers?: {
    display_name?: string;
    profile_picture?: string;
  };
  recipes?: {
    title?: string;
  };
};

type Stats = {
  totalReported: number;
  pendingReview: number;
  resolvedReviews: number;
};

export default function ReportedReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalReported: 0,
    pendingReview: 0,
    resolvedReviews: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  // Search & Filter state
  const [recipeSearch, setRecipeSearch] = useState('');
  const [reviewerSearch, setReviewerSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState<'All' | '1' | '2' | '3' | '4' | '5'>('All');
  const [dateFilter, setDateFilter] = useState<'All' | 'today' | 'week' | 'month'>('All');

  // Load reviews and stats from backend
  const fetchReviewsAndStats = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/admin/reviews/reported', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        setReviews(resData.data.reviews || []);
        setStats(resData.data.stats || { totalReported: 0, pendingReview: 0, resolvedReviews: 0 });
      } else {
        console.error("API error fetching reviews:", resData.message);
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('adminToken');
          router.push('/admin/login');
        }
      }
    } catch (err) {
      console.error("Failed to fetch reported reviews:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewsAndStats();
  }, [router]);

  // Moderation Handler
  const handleModeration = async (id: string, action: 'approve' | 'remove') => {
    setActioningId(id);
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`http://localhost:4000/api/admin/reviews/${id}/${action}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        // Optimistically remove/update from list
        setReviews(prev => prev.filter(item => item.feedback_id !== id));
        // Recalculate stats counts locally
        setStats(prev => {
          const totalReported = prev.totalReported;
          let pendingReview = prev.pendingReview;
          let resolvedReviews = prev.resolvedReviews;

          // approving/removing deletes from reported queue completely
          pendingReview = Math.max(0, pendingReview - 1);

          return { totalReported, pendingReview, resolvedReviews };
        });
      } else {
        alert(resData.message || `Failed to ${action} review.`);
      }
    } catch (error) {
      console.error(`Failed to execute ${action} on review ${id}:`, error);
      alert(`An error occurred while trying to ${action} the review.`);
    } finally {
      setActioningId(null);
    }
  };

  // Filter Logic
  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      // Recipe Search
      const recipeTitle = (review.recipes?.title || '').toLowerCase();
      const matchesRecipe = !recipeSearch || recipeTitle.includes(recipeSearch.trim().toLowerCase());

      // Reviewer Search
      const reviewerName = (review.buyers?.display_name || '').toLowerCase();
      const matchesReviewer = !reviewerSearch || reviewerName.includes(reviewerSearch.trim().toLowerCase());

      // Rating Filter
      const matchesRating = ratingFilter === 'All' || review.rating === Number(ratingFilter);

      // Date Filter
      let matchesDate = true;
      if (dateFilter !== 'All') {
        const reviewDate = new Date(review.created_at);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - reviewDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (dateFilter === 'today') {
          matchesDate = diffDays <= 1;
        } else if (dateFilter === 'week') {
          matchesDate = diffDays <= 7;
        } else if (dateFilter === 'month') {
          matchesDate = diffDays <= 30;
        }
      }

      return matchesRecipe && matchesReviewer && matchesRating && matchesDate;
    });
  }, [reviews, recipeSearch, reviewerSearch, ratingFilter, dateFilter]);

  // Formats date into e.g., "February 8, 2026"
  const formatDate = (dateStr: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString('en-US', options);
    } catch {
      return dateStr;
    }
  };

  // Get initials for profile placeholder
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Stats definition for UI rendering
  const statCards = [
    { label: 'Total Reported Reviews', value: stats.totalReported, icon: MessageSquare, bg: 'bg-red-50', color: 'text-red-500' },
    { label: 'Pending Review', value: stats.pendingReview, icon: AlertTriangle, bg: 'bg-orange-50', color: 'text-orange-500' },
  ];

  return (
    <div className={`min-h-screen bg-[#F8FAFB] flex antialiased ${poppins.className}`}>
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">

        {/* Header Section */}
        <header className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="bg-[#149984] p-3 rounded-xl shadow-md shadow-[#149984]/20">
              <MessageSquare className="text-white h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#23262f]">Reported Reviews</h1>
              <p className="text-gray-500 text-sm font-medium">Monitor and moderate reported user reviews</p>
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

        {/* Live Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm flex items-center justify-between transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <span className="text-gray-500 text-sm font-semibold">{stat.label}</span>
              </div>
              <span className="text-3xl font-bold text-[#23262f]">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Search & Filters Card */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-10">
          <div className="flex items-center gap-2 mb-4 text-[#23262f] font-bold text-sm">
            <Filter className="h-4 w-4 text-[#149984]" />
            <span>Filters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Search by Recipe */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by recipe name..."
                value={recipeSearch}
                onChange={(e) => setRecipeSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-[#149984] transition-all text-[#23262f] shadow-sm placeholder:text-gray-400"
              />
            </div>

            {/* Search by Reviewer */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by reviewer name..."
                value={reviewerSearch}
                onChange={(e) => setReviewerSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-[#149984] transition-all text-[#23262f] shadow-sm placeholder:text-gray-400"
              />
            </div>

            {/* Rating Filter */}
            <div className="relative">
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-[#149984] transition-all text-[#23262f] shadow-sm appearance-none cursor-pointer"
              >
                <option value="All">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>

            {/* Date Filter */}
            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-[#149984] transition-all text-[#23262f] shadow-sm appearance-none cursor-pointer"
              >
                <option value="All">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>

          </div>
        </section>

        {/* Reported Review Cards List */}
        <section className="space-y-6">
          {isLoading ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex flex-col items-center justify-center text-[#149984]">
              <Loader2 className="animate-spin h-10 w-10 mb-4" />
              <span className="font-bold text-sm">Loading reported reviews...</span>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex flex-col items-center justify-center text-center">
              <div className="bg-green-50 p-4 rounded-full mb-4 text-[#149984]">
                <ShieldCheck className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold text-[#23262f] mb-2">No reported reviews found</h3>
              <p className="text-gray-400 text-sm max-w-sm font-medium">All reviews are currently moderated and in good standing.</p>
            </div>
          ) : (
            filteredReviews.map((review) => {
              const reviewerName = review.buyers?.display_name || 'Anonymous User';
              const reviewerPhoto = review.buyers?.profile_picture;
              const recipeTitle = review.recipes?.title || 'Unknown Recipe';
              const isActioning = actioningId === review.feedback_id;

              return (
                <div
                  key={review.feedback_id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row gap-6 transition-all duration-200 hover:shadow-md"
                >
                  {/* Left Column: Reviewer Profile & Metadata */}
                  <div className="flex-shrink-0 flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-gradient-to-tr from-[#149984] to-[#149984]/60 border border-gray-100 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                      {reviewerPhoto ? (
                        <img src={reviewerPhoto} alt={reviewerName} className="h-full w-full object-cover" />
                      ) : (
                        getInitials(reviewerName)
                      )}
                    </div>

                    <div className="md:hidden flex-1">
                      <h4 className="font-bold text-[#23262f] text-base">{reviewerName}</h4>
                      <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5 mt-0.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(review.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Middle Column: Review Content & Info */}
                  <div className="flex-grow space-y-4">
                    <div className="hidden md:block">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-[#23262f] text-base leading-tight">{reviewerName}</h4>
                        <span className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Recipe name and Rating */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <div className="text-sm font-semibold text-gray-500 flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-lg">
                        <span className="text-xs font-bold text-gray-400">Recipe:</span>
                        <span className="text-[#149984]">{recipeTitle}</span>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4.5 w-4.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                              }`}
                          />
                        ))}
                      </div>

                      {/* Badge */}
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${review.status === 'resolved'
                            ? 'bg-green-50 text-green-600'
                            : review.status === 'under review'
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-red-50 text-red-600'
                          }`}
                      >
                        {review.status}
                      </span>
                    </div>

                    {/* Feedback content */}
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Feedback</p>
                      <blockquote className="text-sm font-medium text-gray-600 italic bg-gray-50/50 p-4 rounded-xl border-l-4 border-gray-200 leading-relaxed">
                        {review.comment ? `"${review.comment}"` : "No comment text provided."}
                      </blockquote>
                    </div>

                    {/* Report Reason Flag */}
                    <div className="flex items-center gap-2 bg-red-50/50 text-red-700 px-4 py-3 rounded-xl border border-red-100 text-sm">
                      <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-500" />
                      <div className="font-semibold">
                        <span className="font-bold text-red-800">Report Reason:</span> Inappropriate content flagged by community system
                      </div>
                    </div>
                  </div>

                  {/* Right Column / Actions Section */}
                  <div className="flex-shrink-0 flex md:flex-col justify-end gap-3 mt-4 md:mt-0 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">

                    {/* Approve button */}
                    <button
                      onClick={() => handleModeration(review.feedback_id, 'approve')}
                      disabled={isActioning}
                      className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-[#149984] hover:bg-[#0f7a69] text-white rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isActioning ? (
                        <Loader2 className="animate-spin h-3.5 w-3.5" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      Approve
                    </button>

                    {/* Remove button */}
                    <button
                      onClick={() => handleModeration(review.feedback_id, 'remove')}
                      disabled={isActioning}
                      className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors border border-red-100 disabled:opacity-50"
                    >
                      {isActioning ? (
                        <Loader2 className="animate-spin h-3.5 w-3.5" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      Remove
                    </button>

                  </div>

                </div>
              );
            })
          )}
        </section>

      </main>
    </div>
  );
}
