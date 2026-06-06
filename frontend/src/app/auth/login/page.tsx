"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f14] flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7c3aed] opacity-5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#627eea] opacity-5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#7c3aed] flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
            K
          </div>
          <h1 className="text-2xl font-bold text-[#e2e8f0]">Welcome back</h1>
          <p className="text-[13px] text-[#4a5568] mt-1">Sign in to Closhr</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1f0505] border border-[#ef4444]/20 rounded-lg px-4 py-3 text-[12px] text-[#ef4444]"
            >
              {error}
            </motion.div>
          )}

          <div>
            <label className="block text-[11px] text-[#94a3b8] mb-1.5">Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3a4058]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#111320] border border-[#1e2130] rounded-lg pl-9 pr-4 py-2.5 text-[13px] text-[#e2e8f0] placeholder:text-[#3a4058] focus:outline-none focus:border-[#7c3aed] transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-[#94a3b8] mb-1.5">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3a4058]" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#111320] border border-[#1e2130] rounded-lg pl-9 pr-10 py-2.5 text-[13px] text-[#e2e8f0] placeholder:text-[#3a4058] focus:outline-none focus:border-[#7c3aed] transition-colors"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3a4058] hover:text-[#94a3b8]"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-3.5 h-3.5 rounded border-[#1e2130] bg-[#111320] accent-[#7c3aed]"
              />
              <span className="text-[11px] text-[#4a5568]">Remember me</span>
            </label>
            <button type="button" className="text-[11px] text-[#a78bfa] hover:text-[#c4b5fd]">
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white text-[13px] font-medium hover:from-[#6d28d9] hover:to-[#5b21b6] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="text-center text-[12px] text-[#4a5568] mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-[#a78bfa] hover:text-[#c4b5fd]">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
