"use client";
import Layout from "@/components/Layout";
import LanguagesTable from "../../components/LanguagesTable/LanguagesTable";

export default function Page() {
  return (
    <Layout>
      <div>
        <h2>Diller</h2>
        <div className="grid">
          <LanguagesTable />
        </div>
      </div>
    </Layout>
  );
}
