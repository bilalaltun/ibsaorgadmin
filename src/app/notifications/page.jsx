"use client";
import Layout from "@/components/Layout";
import NotificationsTable from "../../components/NotificationsTable/NotificationsTable";

export default function Page() {
  return (
    <Layout>
      <div>
        <h2>Notifications</h2>
        <div className="grid">
          <NotificationsTable />
        </div>
      </div>
    </Layout>
  );
}
