"use client";

import { LogIn, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) console.error("Login Error:", error.message);
  };

  return (
    <div className="min-h-screen bg-[#fcfaf7] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-600/20">
            <Sparkles size={32} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Clone.AI</h1>
          <p className="text-gray-500 font-medium">Welcome back!</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Sign in to Clone.AI</h2>
          
          <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-3 w-full py-3 px-4 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-100"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400">Or</span>
            </div>
          </div>

          <button
            disabled
            className="w-full py-3 px-4 bg-gray-50 text-gray-400 rounded-xl font-medium cursor-not-allowed border border-gray-100"
          >
            Continue with email
          </button>
        </div>

        <p className="text-xs text-gray-400 px-8">
          By continuing, you agree to Clone.AI's <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
