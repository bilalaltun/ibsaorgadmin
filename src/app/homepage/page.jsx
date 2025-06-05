"use client";
import Layout from "@/components/Layout";
import ContactFormSubmissionsTable from "@/components/HomepageTable/HomepageTable";


export default function Page() {
  return (
    <Layout>
      <div>
        <h2>Anasayfa Sabit Alanlar</h2>
        <div className="grid">
          <ContactFormSubmissionsTable />
        </div>
      </div>
    </Layout>
  );
}
