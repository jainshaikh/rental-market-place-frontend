import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { MobileSidebarBar } from '../../components/layout/MobileSidebarBar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <MobileSidebarBar brand="RentalMarket Admin">
        <AdminSidebar />
      </MobileSidebarBar>

      <div className="flex">
        {/* Dark sidebar — desktop only, MobileSidebarBar covers the same content below md */}
        <div className="hidden md:flex">
          <AdminSidebar />
        </div>

        {/* Main content area */}
        <div className="flex min-w-0 flex-1 flex-col bg-page">
          <main className="min-h-screen flex-1 p-6 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
