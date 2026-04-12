"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/stores";
import { useRouter } from "next/navigation";
import { Database, Loader2 } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register, isLoading, error } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({ name, email, password });
      router.push("/home");
    } catch (err) {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: '#1b1b1f' }}>
      <div className="max-w-sm w-full relative z-10 animate-fade-up">
        <div className="text-center mb-6">
          <div 
            className="w-10 h-10 rounded-md flex items-center justify-center mx-auto mb-4"
            style={{ background: '#0078D4' }}
          >
            <Database className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-[#f3f3f3] tracking-tight">Create your account</h2>
          <p className="text-[#9d9d9d] text-[14px] mt-1">Start building AI-driven data pipelines.</p>
        </div>

        <div className="rounded-lg p-6" style={{ background: '#252529', border: '1px solid rgba(255,255,255,0.08)' }}>
          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-md text-[13px] font-medium" style={{ background: 'rgba(209,52,56,0.10)', border: '1px solid rgba(209,52,56,0.20)', color: '#d13438' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[13px] font-medium text-[#cccccc] mb-1.5 block">Full Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name"
                className="w-full bg-[#17171b] border border-white/[0.08] text-[#f3f3f3] rounded-md px-3 py-2 text-[14px] focus:outline-none focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] transition-all placeholder-[#6d6d6d]"
                placeholder="Ada Lovelace" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-[#cccccc] mb-1.5 block">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username"
                className="w-full bg-[#17171b] border border-white/[0.08] text-[#f3f3f3] rounded-md px-3 py-2 text-[14px] focus:outline-none focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] transition-all placeholder-[#6d6d6d]"
                placeholder="ada@example.com" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-[#cccccc] mb-1.5 block">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password"
                className="w-full bg-[#17171b] border border-white/[0.08] text-[#f3f3f3] rounded-md px-3 py-2 text-[14px] focus:outline-none focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4] transition-all placeholder-[#6d6d6d]"
                placeholder="Min 8 characters" />
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full btn-primary py-2.5 text-[14px] mt-1">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
            </button>
          </form>
          <div className="mt-4 text-center text-[13px] text-[#9d9d9d] border-t border-white/[0.06] pt-4">
            Already have an account?{" "}
            <a href="/login" className="text-[#0078D4] hover:text-[#2b88d8] font-semibold transition-colors">Sign in</a>
          </div>
        </div>
      </div>
    </div>
  );
}
