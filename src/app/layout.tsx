import type {Metadata} from 'next';
import './globals.css';
import { AppLayout } from '@/components/app-layout';
import { AuthProvider } from '@/lib/auth';
import { Toaster } from '@/components/ui/toaster';
import MeetingInvitationListener from '@/components/meeting-invitation';

export const metadata: Metadata = {
  title: 'AROGYA SEVA',
  description: 'Arogya Seva - Securely manage and share your health records.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script src="https://meet.jit.si/external_api.js"></script>
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
          <MeetingInvitationListener />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
