
"use client";

import { useAuth } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Share2, Eye, Bell, UploadCloud, Search, Loader2, MessageCircle, Mic, Shield, Banknote, Calendar, Megaphone, Flower2, Apple, TrendingUp, Settings, User } from "lucide-react";
import { VoiceInput, TextToSpeech } from "@/components/ui/voice-input";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HealthModal } from "@/components/ui/health-modal";
import { HealthTracker } from "@/components/patient/health-tracker";
import { ProfileEditModal } from "@/components/ui/profile-edit-modal";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";


const bpChartData = [
    { date: "2023-11-01", systolic: 120, diastolic: 80 },
    { date: "2023-11-02", systolic: 122, diastolic: 81 },
    { date: "2023-11-03", systolic: 118, diastolic: 79 },
    { date: "2023-11-04", systolic: 125, diastolic: 82 },
    { date: "2023-11-05", systolic: 121, diastolic: 80 },
    { date: "2023-11-06", systolic: 130, diastolic: 85 },
    { date: "2023-11-07", systolic: 128, diastolic: 84 },
];
const glucoseChartData = [
    { date: "2023-11-01", level: 95 },
    { date: "2023-11-02", level: 100 },
    { date: "2023-11-03", level: 98 },
    { date: "2023-11-04", level: 105 },
    { date: "2023-11-05", level: 110 },
    { date: "2023-11-06", level: 108 },
    { date: "2023-11-07", level: 102 },
]

const bpChartConfig = {
  systolic: {
    label: "Systolic",
    color: "hsl(var(--chart-2))",
  },
  diastolic: {
    label: "Diastolic",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const glucoseChartConfig = {
    level: {
        label: "Glucose",
        color: "hsl(var(--chart-3))",
    },
} satisfies ChartConfig;


export default function PatientDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalRecords: 0,
    activeShares: 0,
    lastAccess: null,
    notifications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [symptomText, setSymptomText] = useState('');
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'insurance' | 'subsidies' | 'camps' | 'events' | 'yoga' | 'nutrition' | null;
    title: string;
  }>({ isOpen: false, type: null, title: '' });
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [patientProfile, setPatientProfile] = useState({
    name: user?.displayName || 'John Doe',
    phone: '+91 9876543210',
    email: user?.email || 'john.doe@example.com',
    age: '28',
    bloodGroup: 'O+',
    emergencyContact: '+91 9876543211',
    address: '123 Health Street, Medical City, MC 12345',
    image: ''
  });

  const openModal = (type: 'insurance' | 'subsidies' | 'camps' | 'events' | 'yoga' | 'nutrition', title: string) => {
    setModalState({ isOpen: true, type, title });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: null, title: '' });
  };

  const healthSections = [
    { 
      id: 'insurance', 
      title: 'Medical Insurance', 
      icon: Shield, 
      description: 'Government health schemes & insurance plans', 
      color: 'from-[#00BFA6] to-[#26A69A]',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop&crop=center'
    },
    { 
      id: 'subsidies', 
      title: 'Government Subsidies', 
      icon: Banknote, 
      description: 'Health subsidies & financial assistance', 
      color: 'from-[#26A69A] to-[#00796B]',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop&crop=center'
    },
    { 
      id: 'camps', 
      title: 'Medical Camps', 
      icon: Calendar, 
      description: 'Upcoming free health check-up camps', 
      color: 'from-[#00796B] to-[#004D40]',
      image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&h=200&fit=crop&crop=center'
    },
    { 
      id: 'events', 
      title: 'Health Events', 
      icon: Megaphone, 
      description: 'Health awareness programs & workshops', 
      color: 'from-[#4DB6AC] to-[#26A69A]',
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=200&fit=crop&crop=center'
    },
    { 
      id: 'yoga', 
      title: 'Yoga & Wellness', 
      icon: Flower2, 
      description: 'Yoga tips & wellness practices', 
      color: 'from-[#80CBC4] to-[#4DB6AC]',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=200&fit=crop&crop=center'
    },
    { 
      id: 'nutrition', 
      title: 'Diet & Nutrition', 
      icon: Apple, 
      description: 'Healthy eating tips & nutrition guides', 
      color: 'from-[#A7FFEB] to-[#80CBC4]',
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=200&fit=crop&crop=center'
    }
  ];

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    // Load patient profile from Firebase
    const loadProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setPatientProfile({
            name: userData.displayName || userData.name || user.displayName || 'John Doe',
            phone: userData.phone || '+91 9876543210',
            email: userData.email || user.email || 'john.doe@example.com',
            age: userData.age || '28',
            bloodGroup: userData.bloodGroup || 'O+',
            emergencyContact: userData.emergencyContact || '+91 9876543211',
            address: userData.address || '123 Health Street, Medical City, MC 12345',
            image: userData.image || ''
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    loadProfile();

    const recordsQuery = query(collection(db, "records"), where("ownerId", "==", user.uid));
    const unsubscribeRecords = onSnapshot(recordsQuery, (snapshot) => {
        setStats(prev => ({ ...prev, totalRecords: snapshot.size }));
        setLoading(false);
    });

    const notificationsQuery = query(collection(db, "notifications"), where("userId", "==", user.uid), where("read", "==", false));
    const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
        setStats(prev => ({ ...prev, notifications: snapshot.size }));
    });
    
    // Placeholder for active shares and last access as the data model doesn't support this yet.
    // In a real scenario, you'd have listeners for 'shares' and 'access_logs' collections.
    setStats(prev => ({ ...prev, activeShares: 0, lastAccess: null }));


    return () => {
        unsubscribeRecords();
        unsubscribeNotifications();
    };
  }, [user]);
  
  const StatCard = ({ title, value, footer, icon, isLoading, delay }: { title: string, value: string | number | React.ReactNode, footer: string, icon: React.ReactNode, isLoading: boolean, delay?: string }) => (
    <Card className={`rounded-3xl shadow-xl bg-white border-0 transition-all duration-300 hover:shadow-2xl hover:scale-105 animate-slide-up ${delay || ''} p-8`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-bold text-[#263238]">{title}</CardTitle>
        <div className="p-3 bg-gradient-to-r from-[#009688] to-[#00796B] rounded-2xl shadow-lg">
          <div className="text-white">{icon}</div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? <Loader2 className="h-10 w-10 animate-spin text-[#26A69A]" /> : <div className="text-4xl font-black text-[#263238] mb-2">{value}</div>}
        <p className="text-sm font-medium text-[#263238]/70">{footer}</p>
      </CardContent>
    </Card>
  );


  return (
    <div className="space-y-10 p-6 md:p-8">
       {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#00796B] to-[#004D40] p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent animate-pulse" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white/30">
                {patientProfile.image ? (
                  <img src={patientProfile.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/20 flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight">Welcome back, {patientProfile.name}!</h1>
                <p className="text-white/80 font-medium">{patientProfile.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setProfileEditOpen(true)}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 font-semibold"
                size="sm"
              >
                <Settings className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
              <TextToSpeech 
                text={`Welcome back, ${patientProfile.name}! Health Tip: Stay hydrated! Drinking enough water can improve energy levels and brain function.`}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              />
            </div>
          </div>
          <p className="text-white/90 text-lg font-medium">
            <span className="font-bold text-white">💡 Health Tip:</span> Stay hydrated! Drinking enough water can improve energy levels and brain function.
          </p>
           <div className="flex flex-wrap gap-3 pt-4">
              <Button 
                onClick={() => router.push('/patient/records')}
                className="bg-white text-[#00796B] hover:bg-gray-100 font-bold shadow-lg"
              >
                <UploadCloud className="mr-2 h-4 w-4" /> Upload New Record
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/patient/find-doctors')}
                className="border-white text-white hover:bg-white hover:text-[#00796B] font-bold"
              >
                <Search className="mr-2 h-4 w-4" /> Find Doctors
              </Button>
              <Button 
                onClick={() => window.open('https://wa.me/9373835103?text=Hello, I need medical assistance from MedSeva', '_blank')}
                className="bg-[#25D366] hover:bg-[#128C7E] text-white font-bold shadow-lg"
              >
                <MessageCircle className="mr-2 h-4 w-4" /> Connect WhatsApp
              </Button>
          </div>
        </div>
      </div>
      
      {/* WhatsApp Connect Card */}
      <Card 
        className="bg-[#25D366] hover:bg-[#128C7E] text-white cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-lg"
        onClick={() => window.open('https://wa.me/9373835103?text=Hello, I need medical assistance from MedSeva', '_blank')}
      >
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <h3 className="text-xl font-bold mb-2">Connect with WhatsApp</h3>
            <p className="text-white/90">Get instant medical support and consultation</p>
          </div>
          <div className="p-3 bg-white/20 rounded-full">
            <MessageCircle className="h-8 w-8" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Records"
          value={stats.totalRecords}
          footer="All your health documents"
          icon={<FileText className="h-6 w-6" />}
          isLoading={loading}
          delay="animate-delay-100"
        />
        <StatCard
          title="Active Shares"
          value={stats.activeShares}
          footer="Records shared with doctors"
          icon={<Share2 className="h-6 w-6" />}
          isLoading={loading}
          delay="animate-delay-200"
        />
        <StatCard
          title="Last Access"
          value={stats.lastAccess || "N/A"}
          footer="Last viewed by a doctor"
          icon={<Eye className="h-6 w-6" />}
          isLoading={loading}
          delay="animate-delay-300"
        />
        <StatCard
          title="Notifications"
          value={stats.notifications}
          footer={`${stats.notifications} unread messages`}
          icon={<Bell className="h-6 w-6" />}
          isLoading={loading}
          delay="animate-delay-400"
        />
      </div>

       {/* Health Insights */}
      <Card className="bg-white border-[#26A69A]/30 shadow-xl">
        <CardHeader className="bg-[#009688] text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">Health Insights</CardTitle>
                <CardDescription className="text-white/90 font-medium">Track your vital signs over time.</CardDescription>
              </div>
              <TextToSpeech 
                text="Health Insights: Track your vital signs over time. Your blood pressure and glucose levels are shown in the charts below."
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              />
            </div>
        </CardHeader>
        <CardContent className="grid gap-8 md:grid-cols-2">
            <div>
                <h3 className="font-semibold mb-4">Blood Pressure (mmHg)</h3>
                <ChartContainer config={bpChartConfig} className="h-[200px] w-full">
                    <AreaChart accessibilityLayer data={bpChartData} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} />
                        <YAxis tickLine={false} axisLine={false} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                        <defs>
                            <linearGradient id="fillSystolic" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-systolic)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-systolic)" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="fillDiastolic" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-diastolic)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-diastolic)" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <Area dataKey="systolic" type="natural" fill="url(#fillSystolic)" stroke="var(--color-systolic)" stackId="a" />
                        <Area dataKey="diastolic" type="natural" fill="url(#fillDiastolic)" stroke="var(--color-diastolic)" stackId="a" />
                    </AreaChart>
                </ChartContainer>
            </div>
             <div>
                <h3 className="font-semibold mb-4">Glucose Levels (mg/dL)</h3>
                <ChartContainer config={glucoseChartConfig} className="h-[200px] w-full">
                    <AreaChart accessibilityLayer data={glucoseChartData} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} />
                         <YAxis tickLine={false} axisLine={false} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                        <defs>
                            <linearGradient id="fillGlucose" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-level)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-level)" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <Area dataKey="level" type="natural" fill="url(#fillGlucose)" stroke="var(--color-level)" />
                    </AreaChart>
                </ChartContainer>
            </div>
        </CardContent>
      </Card>

      {/* Interactive Health Sections */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#263238]">Health Services & Information</h2>
          <TrendingUp className="h-6 w-6 text-[#26A69A]" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {healthSections.map((section) => {
            const IconComponent = section.icon;
            return (
              <Card 
                key={section.id}
                className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] bg-white border-[#26A69A]/20 overflow-hidden"
                onClick={() => openModal(section.id as any, section.title)}
              >
                {/* Image Header */}
                <div className="relative h-40 overflow-hidden">
                  <img 
                    src={section.image} 
                    alt={section.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center">
                      <IconComponent className={`h-5 w-5 text-[#00796B]`} />
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="font-bold text-[#263238] mb-2 group-hover:text-[#00796B] transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-[#263238]/70 text-sm leading-relaxed mb-4">
                    {section.description}
                  </p>
                  <div className="flex items-center text-[#26A69A] text-sm font-medium group-hover:text-[#00796B] transition-colors">
                    <span>View Details</span>
                    <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Health Modal */}
      {modalState.type && (
        <HealthModal 
          isOpen={modalState.isOpen}
          onClose={closeModal}
          type={modalState.type}
          title={modalState.title}
        />
      )}

      {/* Health Tracker Section */}
      <HealthTracker />

      {/* Profile Edit Modal */}
      <ProfileEditModal 
        isOpen={profileEditOpen}
        onClose={() => setProfileEditOpen(false)}
        userType="patient"
        currentProfile={patientProfile}
        onSave={(profile) => setPatientProfile(profile)}
      />
    </div>
  );
}
