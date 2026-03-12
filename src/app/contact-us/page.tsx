export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFB] px-6 py-16">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">Contact Support</h1>
        <p className="mt-4 text-slate-600">
          Need help with your seller verification or account review? Reach out to our support team.
        </p>

        <div className="mt-8 space-y-4 rounded-2xl bg-slate-50 p-6">
          <div>
            <p className="text-sm font-semibold text-slate-500">Email</p>
            <p className="mt-1 text-slate-900">support@recipechain.com</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-500">Response time</p>
            <p className="mt-1 text-slate-900">Usually within 24–48 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
}