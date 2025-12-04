"use client";

import { DoctorProfile } from "@/components/doctor/doctor-profile";

export default function DoctorProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <DoctorProfile isOwnProfile={true} />
    </div>
  );
}