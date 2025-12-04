
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PatientPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/patient/dashboard');
  }, [router]);

  return null;
}
