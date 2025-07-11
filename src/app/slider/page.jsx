"use client";

import { useEffect, useState } from "react";
import SliderTable from "@/components/SliderTable/SliderTable";
import Layout from "@/components/Layout";

export default function SliderPage() {
  const [sliders, setSliders] = useState([]);

  useEffect(() => {
    async function fetchSliders() {
      try {
        const res = await fetch("/api/sliders");
        if (!res.ok) throw new Error("Veri alınamadı");
        const data = await res.json();
        setSliders(data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchSliders();
  }, []);

  return (
    <div>
      <Layout>
        <h1>Slider Management</h1>
        <SliderTable sliders={sliders} />
      </Layout>
    </div>
  );
}
