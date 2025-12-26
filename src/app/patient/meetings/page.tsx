"use client";

import PatientMeetings from "@/components/patient/meetings";
import EmbeddedMeeting from "@/components/embedded-meeting";
import ScheduledMeeting from "@/components/scheduled-meeting";
import { useAuth } from "@/lib/auth";

export default function PatientMeetingsPage() {
  const { user } = useAuth();
  const patientName = user?.displayName || 'Patient';
  
  return (
    <div className="space-y-6">
      <ScheduledMeeting />
      <EmbeddedMeeting userType="patient" userName={patientName} />
      <PatientMeetings />
    </div>
  );
}