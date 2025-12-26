"use client";

import DoctorMeetings from "@/components/doctor/meetings";
import EmbeddedMeeting from "@/components/embedded-meeting";
import ScheduledMeeting from "@/components/scheduled-meeting";
import { useAuth } from "@/lib/auth";

export default function DoctorMeetingsPage() {
  const { user } = useAuth();
  const doctorName = user?.displayName || 'Doctor';
  
  return (
    <div className="space-y-6">
      <ScheduledMeeting />
      <EmbeddedMeeting userType="doctor" userName={doctorName} />
      <DoctorMeetings />
    </div>
  );
}