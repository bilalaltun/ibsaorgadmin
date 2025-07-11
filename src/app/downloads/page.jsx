"use client";
import Layout from "@/components/Layout";
import DownloadsTable from "../../components/DownloadsTable/DownloadsTable";

export default function Page() {
  return (
    <Layout>
      <div>
        <h2>Download Files</h2>
        <div className="grid">
          <DownloadsTable />
        </div>
      </div>
    </Layout>
  );
}
