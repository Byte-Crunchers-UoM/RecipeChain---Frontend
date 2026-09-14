"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Arimo } from "next/font/google";
import { supabase } from "@/lib/supabase";

const customFont = Arimo({ subsets: ["latin"], weight: ["400"] });

type PageState = "loading" | "form" | "success" | "error";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageState, setPageState] = useState<PageState>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();

  useEffect(() => {
    /**
     * Supabase redirects back with auth tokens in the URL hash after the user
     * clicks the email reset link. The onAuthStateChange listener picks up the
     * PASSWORD_RECOVERY event and lets us show the reset form.
     */
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          setPageState("form");
        }
      }
    );

    /**
     * Also check if there is already a valid session (in case the event fired
     * before this component mounted). Supabase client auto-detects hash params.
     */
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setPageState("form");
      } else {
        /**
         * Give Supabase a moment to process hash fragments before declaring
         * the token invalid. The auth state change event may still fire.
         */
        setTimeout(async () => {
          const {
            data: { session: retrySession },
          } = await supabase.auth.getSession();

          if (retrySession) {
            setPageState("form");
          } else {
            setPageState("error");
            setErrorMessage(
              "This reset link is invalid or has expired. Please request a new one."
            );
          }
        }, 2000);
      }
    };

    checkSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const validatePassword = (): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }

    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    const validationError = validatePassword();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        if (error.message.includes("same")) {
          setErrorMessage(
            "New password must be different from your current password."
          );
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      /**
       * Sign out after successful password reset so the admin must log in
       * fresh with the new password. This also clears the recovery session.
       */
      await supabase.auth.signOut();
      setPageState("success");
    } catch (error) {
      console.error("Reset password error:", error);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (pageState) {
      case "loading":
        return (
          <div className="text-center py-8">
            <Loader2 className="h-10 w-10 animate-spin text-[#149984] mx-auto mb-4" />
            <p className="text-gray-500 text-sm">
              Verifying your reset link...
            </p>
          </div>
        );

      case "error":
        return (
          <div className="text-center">
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-[#23262f] mb-3">
              Invalid Reset Link
            </h2>

            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              {errorMessage}
            </p>

            <button
              onClick={() => router.push("/admin/forgot-password")}
              className="w-full bg-[#149984] hover:bg-[#0f7d6d] text-white py-4 rounded-[12px] font-bold text-base flex items-center justify-center gap-3 transition-colors shadow-lg shadow-[#149984]/20"
            >
              Request New Reset Link
            </button>

            <button
              onClick={() => router.push("/admin/login")}
              className="w-full mt-3 text-gray-500 hover:text-[#149984] py-3 rounded-[12px] font-medium text-sm transition-colors"
            >
              Back to Login
            </button>
          </div>
        );

      case "success":
        return (
          <div className="text-center">
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 bg-[#e8f6f4] rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-[#149984]" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-[#23262f] mb-3">
              Password Updated!
            </h2>

            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Your password has been successfully reset. You can now log in with
              your new password.
            </p>

            <button
              onClick={() => router.push("/admin/login")}
              className="w-full bg-[#149984] hover:bg-[#0f7d6d] text-white py-4 rounded-[12px] font-bold text-base flex items-center justify-center gap-3 transition-colors shadow-lg shadow-[#149984]/20"
            >
              Go to Login
            </button>
          </div>
        );

      case "form":
        return (
          <>
            {errorMessage && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm text-center font-medium border border-red-100">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#23262f] mb-2.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    placeholder="Enter new password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-[12px] text-gray-900 focus:border-[#149984] focus:ring-2 focus:ring-[#149984]/20 transition-all placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1.5 ml-1">
                  Must be at least 8 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#23262f] mb-2.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    placeholder="Confirm new password"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-[12px] text-gray-900 focus:border-[#149984] focus:ring-2 focus:ring-[#149984]/20 transition-all placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#149984] hover:bg-[#0f7d6d] text-white py-4 rounded-[12px] font-bold text-base flex items-center justify-center gap-3 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed mt-4 shadow-lg shadow-[#149984]/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          </>
        );
    }
  };

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
        <p className="text-xl font-semibold text-[#141416]">
          {pageState === "success" ? "Password Reset" : "Set New Password"}
        </p>
        {pageState === "form" && (
          <p className="text-sm text-gray-500">
            Choose a strong password for your admin account
          </p>
        )}
      </div>

      <div className="w-full max-w-[480px] bg-white p-8 sm:p-12 rounded-[16px] shadow-2xl shadow-gray-100 border border-gray-100 mb-20">
        {renderContent()}
      </div>

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
