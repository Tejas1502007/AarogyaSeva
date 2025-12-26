"use client";

import { useParams } from 'next/navigation';
import PatientJoin from '@/components/patient/patient-join';

export default function PatientJoinPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  return <PatientJoin roomId={roomId} />;
}