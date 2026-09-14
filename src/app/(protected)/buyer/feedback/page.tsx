"use client";

export default function FeedbackPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Submit Feedback</h1>
      <p className="text-sm text-gray-500 mt-1">
        Share your review about a recipe.
      </p>

      <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <label className="text-sm font-medium text-gray-700">Your feedback</label>
        <textarea
          className="mt-2 w-full min-h-[140px] rounded-xl border border-gray-200 p-4 outline-none focus:ring-2 focus:ring-teal-200"
          placeholder="Write your feedback..."
        />
        <button className="mt-4 rounded-xl bg-teal-600 text-white px-5 py-3 text-sm font-medium hover:bg-teal-700 transition">
          Submit
        </button>
      </div>
    </div>
  );
}