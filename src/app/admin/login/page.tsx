"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Arimo}from 'next/font/google';

const customFont = Arimo({ subsets: ['latin'], weight: ['400'] });

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const router = useRouter();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      // 1. Send the POST request to your Express server
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/admin-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // 2. Parse the exact JSON response your controller sends back
      const data = await response.json();

      // 3. If the backend sends a 401, 403, or 500 status code...
      if (!response.ok) {
        // This will grab "Email or Password wrong" or "You are not an Admin" directly from your backend!
        throw new Error(data.message || 'Login failed'); 
      }

      // 4. Success! Save the token AND the user data to browser memory
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user)); 
      
      // 5. Send them to the dashboard!
      router.push('/admin/dashboard');

    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#F8FAFB] to-[#E0F2F1] px-4">
      
      <div className="text-center mb-10 mt-10">
       <img src="/images/logo.svg" alt="RecipeChain Logo" className="w-[380px] h-[150px] mx-auto mb-4 object-contain" />
        <h1 className="text-4xl font-bold text-[#23262f] mb-2 tracking-tight">RecipeChain</h1>
        <p className="text-xl font-semibold text-[#141416]">Admin Login</p>
        <p className="text-sm text-gray-500">Access the RecipeChain administration panel</p>
      </div>

      <form onSubmit={handleLogin} className="w-full max-w-[480px] bg-white p-8 sm:p-12 rounded-[16px] shadow-2xl shadow-gray-100 border border-gray-100 mb-20">
        
        {errorMessage && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm text-center font-medium border border-red-100">
            {errorMessage}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#23262f] mb-2.5">Email Address</label>
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

          <div>
            <label className="block text-sm font-semibold text-[#23262f] mb-2.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-[12px] text-gray-900 focus:border-[#149984] focus:ring-2 focus:ring-[#149984]/20 transition-all placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 accent-[#149984] cursor-pointer"
            />
            <label htmlFor="remember" className="text-gray-500 font-medium cursor-pointer select-none">Remember me</label>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#149984] hover:bg-[#0f7d6d] text-white py-4 rounded-[12px] font-bold text-base flex items-center justify-center gap-3 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed mt-4 shadow-lg shadow-[#149984]/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </div>

        <div className="mt-8 bg-[#e8f6f4] text-[#149984] p-4 rounded-[12px] flex items-center gap-3 border border-[#149984]/10 text-xs font-medium">
          <Lock className="h-4 w-4 flex-shrink-0" />
          <span>This portal is restricted to authorized administrators only.</span>
        </div>
      </form>

      <footer className="w-full max-w-[480px] text-center text-xs text-gray-400 pb-10">
        <div className="flex items-center justify-center gap-2 mb-3 font-medium">
          <a href="#" className="hover:text-gray-600">Privacy Policy</a>
          <span className="text-gray-300">•</span>
          <a href="#" className="hover:text-gray-600">Terms of Service</a>
        </div>
        <p>&copy; 2026 RecipeChain. All rights reserved.</p>
      </footer>
      
    </div>
  );
}