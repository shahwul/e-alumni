import DashboardLayout from "@/components/layout/DashboardLayout";

export default function InternalLayout({ children }) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}