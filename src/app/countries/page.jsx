"use client";
import Layout from "@/components/Layout";
import CountriesTable from "../../components/CountriesTable/CountriesTable";

export default function Page() {
  return (
    <Layout>
      <div>
        <h2>Countries</h2>
        <div className="grid">
          <CountriesTable />
        </div>
      </div>
    </Layout>
  );
}
