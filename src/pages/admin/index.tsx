import Head from "next/head";
import AdminLayout from "@/layouts/AdminLayout";

export default function AdminHome() {
  return (
    <>
      <Head>
        <title>Admin · Wedding Invitation</title>
        <meta name="robots" content="noindex" />
      </Head>
      <AdminLayout title="Dashboard">
        <p className="text-ink/60">
          Admin dashboard placeholder. Features will be added in later steps.
        </p>
      </AdminLayout>
    </>
  );
}
