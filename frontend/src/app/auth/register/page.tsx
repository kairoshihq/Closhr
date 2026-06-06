"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Mail, Lock, User } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.detail ?? "Registration failed");
      }

      router.push("/auth/login?registered=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f14] flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-[#7c3aed] opacity-5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-[#00ffa3] opacity-5 rounded-full blur-[120px]" />
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
          <h1 className="text-2xl font-bold text-[#e2e8f0]">Create Account</h1>
          <p className="text-[13px] text-[#4a5568] mt-1">Join Closhr today</p>
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
            <label className="block text-[11px] text-[#94a3b8] mb-1.5">Full Name</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3a4058]" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#111320] border border-[#1e2130] rounded-lg pl-9 pr-4 py-2.5 text-[13px] text-[#e2e8f0] placeholder:text-[#3a4058] focus:outline-none focus:border-[#7c3aed] transition-colors"
                placeholder="Jason Smith"
              />
            </div>
          </div>

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
                placeholder="Minimum 8 characters"
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

          <div>
            <label className="block text-[11px] text-[#94a3b8] mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3a4058]" />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#111320] border border-[#1e2130] rounded-lg pl-9 pr-4 py-2.5 text-[13px] text-[#e2e8f0] placeholder:text-[#3a4058] focus:outline-none focus:border-[#7c3aed] transition-colors"
                placeholder="Re-enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white text-[13px] font-medium hover:from-[#6d28d9] hover:to-[#5b21b6] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="text-center text-[12px] text-[#4a5568] mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-[#a78bfa] hover:text-[#c4b5fd]">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
