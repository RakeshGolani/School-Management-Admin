import { cookies } from 'next/headers';
import { encryptCookieKey } from '@/lib/cryptoHelper';
import ClientLayout from '@/components/layout/ClientLayout';

export default async function DashboardLayout({ children }) {
  const cookieStore = await cookies();
  const encKey = encryptCookieKey('sidebar_collapsed');
  const initialCollapsed = (cookieStore.get(encKey)?.value || cookieStore.get('sidebar_collapsed')?.value) === 'true';

  return (
    <ClientLayout initialCollapsed={initialCollapsed}>
      {children}
    </ClientLayout>
  );
}
