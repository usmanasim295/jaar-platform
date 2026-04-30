import { AdminPageLayout } from '@/components/admin/AdminPageLayout';
import { AdminRouteProtection } from '@/components/admin/AdminRouteProtection';
import { SummaryCards } from '@/features/admin/dashboard/components/SummaryCards';
import { TopProvidersTable } from '@/features/admin/dashboard/components/TopProvidersTable';
import { ServiceProviderChart } from '@/features/admin/dashboard/components/ServiceProviderChart';
import { UserStatsCard } from '@/features/admin/dashboard/components/UserStatsCard';
export default function AdminDashboardPage() {
  return (
    <AdminRouteProtection>
      <AdminPageLayout
        title="Dashboard"
        subtitle="Monitor activity across homeowners, leaders, and providers"
      >
        <SummaryCards />
        <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
          <ServiceProviderChart />
          <UserStatsCard />
        </div>
        <TopProvidersTable />
      </AdminPageLayout>
    </AdminRouteProtection>
  );
}
