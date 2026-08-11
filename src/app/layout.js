// Trigger dev hot-reload cache invalidation
import './globals.css';

export const metadata = {
  title: 'SuperAdmin Portal | Master Control Dashboard',
  description: 'Super Admin Control Panel for School ERP Institutions',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'light') {
                  document.documentElement.classList.add('light');
                } else {
                  document.documentElement.classList.remove('light');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="antialiased selection:bg-amber-500 selection:text-slate-950 font-sans">
        {children}
      </body>
    </html>
  );
}
