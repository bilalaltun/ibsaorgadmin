"use client";
import Layout from "@/components/Layout";
import ContactFormSubmissionsTable from "@/components/ContactData/ContactData";


export default function Page() {
  return (
    <Layout>
      <div>
        <h2>Iletisim Basvurulari</h2>
        <div className="grid">
          <ContactFormSubmissionsTable />
        </div>
      </div>
    </Layout>
  );
}
