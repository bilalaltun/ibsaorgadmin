"use client";
import Layout from "@/components/Layout";
import TeamMemberTable from "../../components/TeamMembers/TeamMembersTable";

export default function Page() {
  return (
    <Layout>
      <div>
        <h2>Team Members</h2>
        <div className="grid">
          <TeamMemberTable />
        </div>
      </div>
    </Layout>
  );
}