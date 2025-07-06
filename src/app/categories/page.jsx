"use client";
import Layout from "@/components/Layout";
import CategoryTable from "../../components/CategoryTable/CategoryTable";

export default function Page() {
  return (
    <Layout>
      <div>
        <h2>Categories</h2>
        <div className="grid">
          <CategoryTable />
        </div>
      </div>
    </Layout>
  );
}
