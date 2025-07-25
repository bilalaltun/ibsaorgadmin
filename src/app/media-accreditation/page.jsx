"use client";
import Layout from "@/components/Layout";
import dynamic from "next/dynamic";

const MediaAccreditationTable = dynamic(
  () =>
    import("../../components/MediaAccreditationTable/MediaAccreditationTable"),
  { ssr: false }
);

export default function MediaAccreditationPage() {
  return (
    <Layout>
      <div style={{ padding: 24 }}>
        <h1>Form Submissions List</h1>
        <MediaAccreditationTable />
      </div>
    </Layout>
  );
}
