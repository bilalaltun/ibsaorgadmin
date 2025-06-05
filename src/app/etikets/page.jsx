"use client";
import TitleListTable from "@/components/TitleListTable/TitleListTable";
import Layout from "@/components/Layout";

export default function Page() {

  return (
    <Layout>
      <div>
        <h2>Site Etiketleri</h2>
        <div className="grid">
          <TitleListTable />
        </div>
      </div>
    </Layout>
  );
}
