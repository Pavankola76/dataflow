"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isLoading && !user) {
      router.push("/login"); // or handle redirect
    }
  }, [user, isLoading, router, isMounted]);

  if (!isMounted || isLoading || !user) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#07090e]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="console-root">
      {/* Top Bar now spans the full width of the screen */}
      <Topbar />
      <div className="console-body">
        {/* Sidebar fits underneath Top Bar left-aligned */}
        <Sidebar />
        {/* Main Content Area */}
        <main className="console-main">
          {children}
        </main>
      </div>
    </div>
  );
}
