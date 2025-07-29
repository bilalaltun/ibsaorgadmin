"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Use Next.js router for proper navigation
    router.replace("/users");
  }, [router]);

  return <Layout></Layout>;
}
