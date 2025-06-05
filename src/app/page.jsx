"use client";
import { useEffect } from "react";
import Layout from "@/components/Layout";
export default function Home() {
  useEffect(() => {
    window.location.href = "/users";
  }, []);

  return <Layout></Layout>;
}
