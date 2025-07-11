"use client";
import Layout from "@/components/Layout";
import DownloadsTable from "../../components/DownloadsTable/DownloadsTable";
import MembersPageList from "../../components/MembersTable/MembersTable";

export default function Page() {
  return (
    <Layout>
      <div>
        <h2>Commitee & Referees</h2>
        <div className="grid">
          <MembersPageList />
        </div>
      </div>
    </Layout>
  );
}
