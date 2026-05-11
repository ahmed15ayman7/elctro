import { Suspense } from "react";
import AdminDashboard from "@/components/admin/AdminDashboard";

function AdminDashboardFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminDashboardFallback />}>
      <AdminDashboard />
    </Suspense>
  );
}
