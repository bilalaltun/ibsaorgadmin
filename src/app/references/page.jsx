"use client";
import Layout from "@/components/Layout";
import ReferenceTable from "@/components/ReferenceTable/ReferenceTable";

export default function Page() {
  return (
    <Layout>
      <div>
        <h2>Partners</h2>
        <div className="grid">
          <ReferenceTable />
        </div>
      </div>
    </Layout>
  );
}
