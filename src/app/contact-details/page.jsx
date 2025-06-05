"use client";
import ContactTable from "@/components/ContactTable/ContactTable";
import Layout from "@/components/Layout";

export default function Page() {
  return (
    <Layout>
      <div>
        <h2>İletişim Bilgileri</h2>
        <div className="grid">
          <ContactTable />
        </div>
      </div>
    </Layout>
  );
}
