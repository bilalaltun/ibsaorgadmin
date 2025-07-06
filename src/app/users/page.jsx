"use client";

import Layout from "@/components/Layout";
import UserTable from "../../components/UserTable/UserTable";

export default function ProductsPage() {
  return (
    <Layout>
      <div className="content">
        <h2>Users</h2>
        <UserTable />
      </div>
    </Layout>
  );
}
