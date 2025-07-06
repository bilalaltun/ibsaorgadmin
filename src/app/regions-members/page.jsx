"use client";
import Layout from "@/components/Layout";
import RegionsMemberTable from "../../components/RegionsMemberTable/RegionsMemberTable";

export default function Page() {
  return (
    <Layout>
      <div>
        <h2>Region Members</h2>
        <div className="grid">
          <RegionsMemberTable />
        </div>
      </div>
    </Layout>
  );
}
