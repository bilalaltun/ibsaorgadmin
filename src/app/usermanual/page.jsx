"use client";
import Layout from "@/components/Layout";
import UserManualTable from "../../components/UserManualTable/UserManualTable";

export default function Page() {
  return (
    <Layout>
      <div>
        <h2>Kullanim Klavuzu</h2>
        <div className="grid">
          <UserManualTable />
        </div>
      </div>
    </Layout>
  );
}
