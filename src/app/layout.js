import './globals.css';

export const metadata = {
  title: 'SuperAdmin Portal | Master Control Dashboard',
  description: 'Super Admin Control Panel for School ERP Institutions',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-slate-900 text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
