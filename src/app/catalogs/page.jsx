"use client";
import Layout from "@/components/Layout";
import CatalogTable from "../../components/CatalogTable/CatalogTable";

export default function Page() {
  return (
    <Layout>
      <div>
        <h2>Kataloglar</h2>
        <div className="grid">
          <CatalogTable />
        </div>
      </div>
    </Layout>
  );
}
