
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Activity, Eye, Bell, Calendar, Loader2, HeartPulse, Sparkles, Award, GraduationCap, Stethoscope, Settings, User, Video } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, Timestamp, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { isToday } from "date-fns";
import { ProfileEditModal } from "@/components/ui/profile-edit-modal";
import DoctorEmergencyCalls from "@/components/doctor/emergency-calls";
import ScheduledMeeting from "@/components/scheduled-meeting";

const motivationalQuotes = [
    { quote: "The good physician treats the disease; the great physician treats the patient who has the disease.", author: "William Osler" },
    { quote: "Wherever the art of medicine is loved, there is also a love of humanity.", author: "Hippocrates" },
    { quote: "The art of healing comes from nature, not from the physician. Therefore the physician must start from nature, with an open mind.", author: "Paracelsus" },
    { quote: "Observation, reason, human understanding, courage; these make the physician.", author: "Martin H. Fischer" },
];


export default function DoctorDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const doctorName = user?.displayName || "Doctor";

  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    totalPatients: 0,
    recordsViewed: 0, 
    notifications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState({
    name: user?.displayName || 'Dr. John Smith',
    phone: '+91 9876543210',
    email: user?.email || 'dr.smith@example.com',
    specialization: 'Cardiology',
    experience: '15',
    qualifications: 'MBBS, MD - Cardiology',
    address: '123 Medical Center, Healthcare District, HC 12345',
    image: ''
  });

  useEffect(() => {
    if (!user) return;

    // Load doctor profile from Firebase
    const loadProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setDoctorProfile({
            name: userData.displayName || userData.name || user.displayName || 'Dr. John Smith',
            phone: userData.phone || '+91 9876543210',
            email: userData.email || user.email || 'dr.smith@example.com',
            specialization: userData.specialization || 'Cardiology',
            experience: userData.experience || '15',
            qualifications: userData.qualifications || 'MBBS, MD - Cardiology',
            address: userData.address || '123 Medical Center, Healthcare District, HC 12345',
            image: userData.image || ''
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    loadProfile();

    // Listener for appointments
    const appointmentsQuery = query(collection(db, "appointments"), where("doctorId", "==", user.uid));
    const unsubscribeAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
        const appointments = snapshot.docs.map(doc => doc.data());
        const todayAppointments = appointments.filter(apt => apt.appointmentTime && isToday((apt.appointmentTime as Timestamp).toDate()));
        
        const uniquePatientIds = new Set(appointments.map(apt => apt.patientId));
        
        setStats(prev => ({
            ...prev,
            upcomingAppointments: todayAppointments.length,
            totalPatients: uniquePatientIds.size,
        }));
        setLoading(false);
    });

    // Listener for notifications
    const notificationsQuery = query(collection(db, "notifications"), where("userId", "==", user.uid), where("read", "==", false));
    const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
        setStats(prev => ({
            ...prev,
            notifications: snapshot.size,
        }));
    });

    return () => {
      unsubscribeAppointments();
      unsubscribeNotifications();
    };
  }, [user]);

  const StatCard = ({ title, value, icon, footer, isLoading, delay }: { title: string, value: number, icon: React.ReactNode, footer: string, isLoading: boolean, delay: string }) => (
      <Card className={`rounded-3xl shadow-xl bg-white border-0 transition-all duration-300 hover:shadow-2xl hover:scale-105 animate-slide-up ${delay} p-8`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-bold text-[#0F172A]">{title}</CardTitle>
          <div className="p-3 bg-gradient-to-r from-[#0284C7] to-[#0E7490] rounded-2xl shadow-lg">
            <div className="text-white">{icon}</div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? <Loader2 className="h-10 w-10 animate-spin text-[#06B6D4]" /> : <div className="text-4xl font-black text-[#0F172A] mb-2">{value}</div>}
          <p className="text-sm font-medium text-[#0F172A]/70">{footer}</p>
        </CardContent>
      </Card>
  )


  return (
    <div className="space-y-10 p-6 md:p-8">
      {/* Doctor Profile Card */}
      <Card className="rounded-3xl shadow-2xl bg-gradient-to-br from-white to-sky-50 border-0 animate-fade-in-up p-8">
        <CardContent className="p-0">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#06B6D4]/30">
              {doctorProfile.image ? (
                <img src={doctorProfile.image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#0284C7] to-[#0E7490] flex items-center justify-center">
                  <Stethoscope className="h-10 w-10 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-[#0F172A]">{doctorProfile.name}</h2>
                <Button 
                  onClick={() => setProfileEditOpen(true)}
                  className="bg-[#0284C7] hover:bg-[#0E7490] text-white font-semibold"
                  size="sm"
                >
                  <Settings className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
              </div>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-[#06B6D4]" />
                  <span className="text-[#0F172A] font-medium">{doctorProfile.qualifications}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-[#06B6D4]" />
                  <span className="text-[#0F172A] font-medium">{doctorProfile.experience}+ Years Experience</span>
                </div>
              </div>
              <p className="text-[#0F172A]/70 mb-4">Specialized in {doctorProfile.specialization} & Interventional Medicine</p>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-[#F0F9FF] text-[#0284C7] text-sm font-medium rounded-full">{doctorProfile.specialization}</span>
                <span className="px-3 py-1 bg-[#F0F9FF] text-[#0284C7] text-sm font-medium rounded-full">Surgery</span>
                <span className="px-3 py-1 bg-[#F0F9FF] text-[#0284C7] text-sm font-medium rounded-full">Emergency Care</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0284C7] to-[#0E7490] p-10 text-white shadow-2xl animate-slide-up">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent animate-pulse" />
        <div className="relative z-10 space-y-6">
            <h1 className="text-5xl font-black tracking-tight">Welcome back, {doctorName}</h1>
            <p className="text-white/90 text-xl font-medium">
            🩺 Ready to provide secure, compassionate care. You have {loading ? '...' : stats.upcomingAppointments} appointments today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button 
              className="px-8 py-4 rounded-2xl bg-white text-[#0284C7] hover:bg-gray-100 font-bold shadow-xl text-lg transition-all duration-300 hover:scale-105" 
              onClick={() => router.push('/doctor/appointments')}
            >
                <Calendar className="mr-3 h-5 w-5" />
                Today's Schedule
            </Button>
            <Button 
              variant="outline"
              className="px-8 py-4 rounded-2xl border-2 border-white text-white hover:bg-white hover:text-[#0284C7] font-bold shadow-xl text-lg transition-all duration-300 hover:scale-105" 
              onClick={() => router.push('/doctor/profile')}
            >
                <User className="mr-3 h-5 w-5" />
                View Full Profile
            </Button>
            </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Patients"
            value={stats.totalPatients}
            icon={<Users className="h-6 w-6 text-muted-foreground" />}
            footer="All unique patients"
            isLoading={loading}
            delay="animate-delay-100"
          />
          <StatCard 
            title="Upcoming Appointments"
            value={stats.upcomingAppointments}
            icon={<Activity className="h-6 w-6 text-muted-foreground" />}
            footer="Appointments scheduled today"
            isLoading={loading}
            delay="animate-delay-200"
          />
          <StatCard 
            title="Records Viewed"
            value={stats.recordsViewed}
            icon={<Eye className="h-6 w-6 text-muted-foreground" />}
            footer="In active sessions"
            isLoading={false}
            delay="animate-delay-300"
          />
          <StatCard 
            title="Unread Notifications"
            value={stats.notifications}
            icon={<Bell className="h-6 w-6 text-muted-foreground" />}
            footer={`${stats.notifications} new alerts`}
            isLoading={loading}
            delay="animate-delay-400"
          />
      </div>

      {/* Scheduled Meetings */}
      <ScheduledMeeting />

      {/* Emergency Calls */}
      <DoctorEmergencyCalls />

      {/* Motivational Quotes */}
      <Card className="bg-white border-[#06B6D4]/30 shadow-xl">
        <CardHeader className="bg-[#0284C7] text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <HeartPulse className="h-6 w-6" />
            Medical Motivation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
            {motivationalQuotes.slice(0, 2).map((q, index) => (
                <blockquote key={index} className="p-6 rounded-xl bg-[#F0F9FF] border-l-4 border-[#06B6D4] italic">
                    <p className="mb-3 text-[#0F172A] text-lg">"{q.quote}"</p>
                    <footer className="text-right font-bold text-[#0284C7]">- {q.author}</footer>
                </blockquote>
            ))}
        </CardContent>
      </Card>

      {/* Profile Edit Modal */}
      <ProfileEditModal 
        isOpen={profileEditOpen}
        onClose={() => setProfileEditOpen(false)}
        userType="doctor"
        currentProfile={doctorProfile}
        onSave={(profile) => setDoctorProfile(profile)}
      />
    </div>
  );
}
