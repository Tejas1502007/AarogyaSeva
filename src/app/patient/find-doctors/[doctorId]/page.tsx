
import DoctorProfile from "@/components/patient/doctor-profile";

export default function DoctorProfilePage({ params }: { params: { doctorId: string } }) {
  return <DoctorProfile doctorId={params.doctorId} />;
}
