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
              } catch (e) {}
            `
          }}
        />
      </head>
      <body suppressHydrationWarning className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
