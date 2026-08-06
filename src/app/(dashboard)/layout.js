import { cookies } from 'next/headers';
import ClientLayout from '@/components/layout/ClientLayout';

export default async function DashboardLayout({ children }) {
  const cookieStore = await cookies();
  const initialCollapsed = cookieStore.get('sidebar_collapsed')?.value === 'true';

  return (
    <ClientLayout initialCollapsed={initialCollapsed}>
      {children}
    </ClientLayout>
  );
}
