"use client";

import { useEffect, useState } from "react";
import SliderTable from "@/components/SliderTable/SliderTable";
import Layout from "@/components/Layout";

export default function SliderPage() {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSliders() {
      try {
        const res = await fetch("/api/sliders");
        if (!res.ok) throw new Error("Veri alınamadı");
        const data = await res.json();
        setSliders(data);
      } catch (err) {
        console.error(err);
        setError("Slider verileri alınamadı.");
      } finally {
        setLoading(false);
      }
    }

    fetchSliders();
  }, []);

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <Layout>
        <h1>Slider Yönetimi</h1>
        {loading ? (
          <div className={"loadingSpinner"}>
            <div className={"spinner"} />
            <p>İçerikler yükleniyor...</p>
          </div>
        ) : (
          <SliderTable sliders={sliders} />
        )}
      </Layout>
    </div>
  );
}
