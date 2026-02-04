"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/common/Header";
import Loading from "@/components/common/Loading";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) return <Loading />;

  return (
    <>
      <Header />
      <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>{children}</main>
    </>
  );
}
