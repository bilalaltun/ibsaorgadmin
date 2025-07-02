"use client";
import Layout from "@/components/Layout";
import EventTable from "../../components/EventTable/EventTable";

export default function Page() {
  return (
    <Layout>
      <div>
        <h2>Events</h2>
        <div className="grid">
          <EventTable />
        </div>
      </div>
    </Layout>
  );
}
