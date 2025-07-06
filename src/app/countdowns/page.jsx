"use client";
import Layout from "@/components/Layout";
import CountdownTable from "../../components/CountDownsTable/CountDownsTable";

export default function Page() {
  return (
    <Layout>
      <div>
        <h2>CountDowns</h2>
        <div className="grid">
          <CountdownTable />
        </div>
      </div>
    </Layout>
  );
}
