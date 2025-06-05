"use client";
import Layout from "@/components/Layout";
import CertificateTable from '@/components/CertificateTable/CertificateTable'

export default function Page() {
  return (
    <Layout>
      <div>
        <h2>Sertifikalar</h2>
        <div className="grid">
          <CertificateTable  />
        </div>
      </div>
    </Layout>
  );
}
