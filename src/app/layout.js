// Trigger dev hot-reload cache invalidation
import './globals.css';

export const metadata = {
  title: 'Vidyadmin SuperAdmin | Simplifying Education, Empowering Admins',
  description: 'Vidyadmin: The Smart Choice for School Administration. Streamline, Manage, Succeed.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="antialiased selection:bg-primary-600 selection:text-white font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
