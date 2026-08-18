import { ProviderSidebar } from '../../components/provider/ProviderSidebar';

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-page">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <ProviderSidebar />
      </div>

      {/* Main content */}
      <main className="min-w-0 flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
    </div>
  );
}
