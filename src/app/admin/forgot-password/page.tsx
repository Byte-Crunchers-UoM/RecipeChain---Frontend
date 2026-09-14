"use client";

import { useState, useEffect, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Arimo } from "next/font/google";
import { supabase } from "@/lib/supabase";

const customFont = Arimo({ subsets: ["latin"], weight: ["400"] });

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

  // Pre-fill email from query parameters if present
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });

      if (error) {
        console.error("Reset password error:", error);
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Forgot password error:", error);
      setErrorMessage("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[480px] bg-white p-8 sm:p-12 rounded-[16px] shadow-2xl shadow-gray-100 border border-gray-100 mb-20">
      {isSubmitted ? (
        <div className="text-center">
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 bg-[#e8f6f4] rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-[#149984]" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-[#23262f] mb-3">
            Check Your Email
          </h2>

          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            If an account with that email exists, we&apos;ve sent a password
            reset link. Please check your inbox and spam folder.
          </p>

          <p className="text-xs text-gray-400 mb-8">
            The link will expire in 5 minutes.
          </p>

          <button
            onClick={() => router.push("/admin/login")}
            className="w-full bg-[#149984] hover:bg-[#0f7d6d] text-white py-4 rounded-[12px] font-bold text-base flex items-center justify-center gap-3 transition-colors shadow-lg shadow-[#149984]/20"
          >
            Back to Login
          </button>

          <button
            onClick={() => {
              setIsSubmitted(false);
              setEmail("");
            }}
            className="w-full mt-3 text-[#149984] hover:text-[#0f7d6d] py-3 rounded-[12px] font-medium text-sm transition-colors"
          >
            Try a different email
          </button>
        </div>
      ) : (
        <>
          {errorMessage && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm text-center font-medium border border-red-100">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#23262f] mb-2.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  placeholder="admin@recipechain.com"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-[12px] text-gray-900 focus:border-[#149984] focus:ring-2 focus:ring-[#149984]/20 transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#149984] hover:bg-[#0f7d6d] text-white py-4 rounded-[12px] font-bold text-base flex items-center justify-center gap-3 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg shadow-[#149984]/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sending Reset Link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          <button
            onClick={() => router.push("/admin/login")}
            className="w-full mt-4 flex items-center justify-center gap-2 text-gray-500 hover:text-[#149984] py-3 rounded-[12px] font-medium text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </button>
        </>
      )}
    </div>
  );
}

export default function ForgotPassword() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#F8FAFB] to-[#E0F2F1] px-4">
      <div className="text-center mb-10 mt-10">
        <img
          src="/images/logo.svg"
          alt="RecipeChain Logo"
          className="w-[380px] h-[150px] mx-auto mb-4 object-contain"
        />
        <h1 className="text-4xl font-bold text-[#23262f] mb-2 tracking-tight">
          RecipeChain
        </h1>
        <p className="text-xl font-semibold text-[#141416]">Reset Password</p>
        <p className="text-sm text-gray-500">
          Enter your email to receive a password reset link
        </p>
      </div>

      <Suspense
        fallback={
          <div className="w-full max-w-[480px] bg-white p-8 sm:p-12 rounded-[16px] shadow-2xl shadow-gray-100 border border-gray-100 mb-20 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#149984] mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Loading...</p>
          </div>
        }
      >
        <ForgotPasswordForm />
      </Suspense>

      <footer className="w-full max-w-[480px] text-center text-xs text-gray-400 pb-10">
        <div className="flex items-center justify-center gap-2 mb-3 font-medium">
          <a href="#" className="hover:text-gray-600">
            Privacy Policy
          </a>
          <span className="text-gray-300">•</span>
          <a href="#" className="hover:text-gray-600">
            Terms of Service
          </a>
        </div>
        <p>&copy; 2026 RecipeChain. All rights reserved.</p>
      </footer>
    </div>
  );
}
