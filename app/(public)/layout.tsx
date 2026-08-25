import { PublicNavbar } from '../../components/layout/PublicNavbar';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-400 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} KerayeGo. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
