import { cookies } from 'next/headers';
import './globals.css';

export const metadata = {
  title: 'Vidyadmin SuperAdmin | Simplifying Education, Empowering Admins',
  description: 'Vidyadmin: The Smart Choice for School Administration. Streamline, Manage, Succeed.',
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('theme')?.value || 'dark';
  const isLight = themeCookie === 'light';

  return (
    <html lang="en" className={isLight ? 'light' : 'dark'} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                var localTheme = localStorage.getItem('theme');
                var match = document.cookie.match(/(?:^|; )theme=([^;]*)/);
                var cookieTheme = match ? decodeURIComponent(match[1]) : null;
                var theme = localTheme || cookieTheme || 'dark';
                if (theme === 'light') {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                }
              } catch (e) {}
            })();`
          }}
        />
      </head>
      <body className="antialiased selection:bg-primary-600 selection:text-white font-sans bg-slate-950 text-slate-100" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
