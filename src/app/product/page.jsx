"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import ProductTable from "@/components/ProductTable/ProductTable";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchProducts() {
    try {
      const res = await fetch("/api/products", {
        method: "GET",
      });
      if (!res.ok) throw new Error("Veri alınamadı");
      const data = await res.json();
      setProducts(data.data);
    } catch (err) {
      console.error("Ürün verisi alınamadı:", err);
      setError("Ürün verisi alınamadı.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {

    fetchProducts();
  }, []);

  return (
    <Layout>
      <div className="content">
        <h2>Ürünler</h2>
        {!loading && !error && (
          <ProductTable
            products={products}
            fetchProducts={fetchProducts}
            //  onDelete={handleDelete}
          />
        )}
      </div>
    </Layout>
  );
}
