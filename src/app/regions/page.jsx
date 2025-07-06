"use client";
import Layout from "@/components/Layout";
import RegionsTable from "../../components/RegionsTable/RegionsTable";

export default function Page() {
  return (
    <Layout>
      <div>
        <h2>Regions</h2>
        <div className="grid">
          <RegionsTable />
        </div>
      </div>
    </Layout>
  );
}
