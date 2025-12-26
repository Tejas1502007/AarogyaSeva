"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, MapPin, Phone, Mail, GraduationCap, Briefcase, 
  Award, Clock, Star, Calendar, Edit, Camera, Building2,
  BookOpen, Users, Stethoscope
} from "lucide-react";
import { ProfileEditModal } from "@/components/ui/profile-edit-modal";
import BookAppointment from "@/components/patient/book-appointment";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";

interface DoctorProfileProps {
  doctorId?: string;
  isOwnProfile?: boolean;
}

export function DoctorProfile({ doctorId, isOwnProfile = false }: DoctorProfileProps) {
  const { user, userRole } = useAuth();
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [availability, setAvailability] = useState<any>(null);
  const [doctorProfile, setDoctorProfile] = useState({
    name: "Dr. Rajesh Kumar Sharma",
    specialization: "Interventional Cardiology",
    qualifications: "MBBS, MD - Cardiology, DM - Interventional Cardiology",
    experience: "18",
    phone: "+91 9876543210",
    email: "dr.rajesh.sharma@medseva.com",
    address: "Apollo Hospital, Sector 26, Noida, UP 201301",
    image: "",
    about: "Senior Interventional Cardiologist with 18+ years of expertise in complex cardiac procedures. Specialized in coronary angioplasty, stent placement, and structural heart interventions. Published researcher with 50+ papers in international journals. Committed to delivering world-class cardiac care with compassionate patient approach.",
    hospital: "Apollo Hospital",
    rating: 4.9,
    totalReviews: 347,
    consultationFee: 1200,
    availability: "Mon-Sat: 8:00 AM - 7:00 PM"
  });

  useEffect(() => {
    if (doctorId) {
      loadDoctorData();
      loadAvailability();
    }
  }, [doctorId]);

  const loadDoctorData = async () => {
    if (!doctorId) return;
    try {
      const docRef = doc(db, "users", doctorId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDoctorProfile({
          name: data.displayName || data.name || "Dr. Unknown",
          specialization: data.specialization || "General Medicine",
          qualifications: data.qualifications || "MBBS",
          experience: data.experience || "5",
          phone: data.phone || "+91 9876543210",
          email: data.email || "doctor@medseva.com",
          address: data.address || "Hospital Address",
          image: data.image || "",
          about: data.about || "Experienced medical professional committed to providing quality healthcare.",
          hospital: data.hospital || "Hospital",
          rating: data.rating || 4.5,
          totalReviews: data.totalReviews || 0,
          consultationFee: data.consultationFee || 500,
          availability: data.availability || "Mon-Sat: 9:00 AM - 6:00 PM"
        });
      }
    } catch (error) {
      console.error("Error loading doctor data:", error);
    }
  };

  const loadAvailability = async () => {
    if (!doctorId) return;
    try {
      const availRef = doc(db, "availability", doctorId);
      const availSnap = await getDoc(availRef);
      if (availSnap.exists()) {
        setAvailability({
          ...availSnap.data(),
          bookedSlots: []
        });
      } else {
        setAvailability({
          slotDuration: 30,
          workingDays: {
            'Monday': { enabled: true, start: '10:00', end: '18:00' },
            'Tuesday': { enabled: true, start: '10:00', end: '18:00' },
            'Wednesday': { enabled: true, start: '10:00', end: '18:00' },
            'Thursday': { enabled: true, start: '10:00', end: '18:00' },
            'Friday': { enabled: true, start: '10:00', end: '18:00' },
            'Saturday': { enabled: false, start: '10:00', end: '14:00' },
            'Sunday': { enabled: false, start: '10:00', end: '18:00' }
          },
          bookedSlots: []
        });
      }
    } catch (error) {
      console.error("Error loading availability:", error);
    }
  };

  const handleBookAppointment = () => {
    setShowBooking(true);
    // Scroll to booking section after a short delay
    setTimeout(() => {
      const bookingElement = document.getElementById('booking-section');
      if (bookingElement) {
        bookingElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const onAppointmentBooked = (slot: Date, mode: 'online' | 'in-person') => {
    setShowBooking(false);
    // You could add additional logic here like showing a success message
  };

  const education = [
    { degree: "MBBS (Bachelor of Medicine & Surgery)", institution: "All India Institute of Medical Sciences (AIIMS), New Delhi", year: "2001-2006" },
    { degree: "MD - General Medicine", institution: "Post Graduate Institute of Medical Education & Research, Chandigarh", year: "2007-2010" },
    { degree: "DM - Cardiology", institution: "All India Institute of Medical Sciences (AIIMS), New Delhi", year: "2011-2014" },
    { degree: "Fellowship in Interventional Cardiology", institution: "Cleveland Clinic Foundation, Ohio, USA", year: "2015-2016" }
  ];

  const experience = [
    { position: "Senior Consultant & Head - Interventional Cardiology", hospital: "Apollo Hospital, Noida", duration: "2019 - Present (5+ years)" },
    { position: "Consultant Interventional Cardiologist", hospital: "Fortis Escorts Heart Institute, New Delhi", duration: "2017 - 2019 (2 years)" },
    { position: "Assistant Professor of Cardiology", hospital: "All India Institute of Medical Sciences (AIIMS), New Delhi", duration: "2014 - 2017 (3 years)" },
    { position: "Senior Resident - Cardiology", hospital: "AIIMS, New Delhi", duration: "2011 - 2014 (3 years)" }
  ];

  const skills = [
    "Complex Coronary Interventions", "Primary Angioplasty", "Chronic Total Occlusion (CTO)", 
    "Bifurcation Stenting", "IVUS & OCT Imaging", "Rotational Atherectomy", 
    "TAVI (Transcatheter Aortic Valve Implantation)", "Mitral Valve Interventions", 
    "Pacemaker & ICD Implantation", "Echocardiography", "Cardiac Catheterization", "Heart Failure Management"
  ];

  const publications = [
    { title: "Outcomes of Complex Coronary Interventions in Indian Population: A Multi-center Study", journal: "Journal of American College of Cardiology (JACC)", year: "2024" },
    { title: "TAVI in Bicuspid Aortic Stenosis: Indian Experience and Long-term Outcomes", journal: "EuroIntervention Journal", year: "2023" },
    { title: "Primary PCI in STEMI: Door-to-Balloon Time Optimization in Resource-Limited Settings", journal: "Circulation: Cardiovascular Interventions", year: "2023" },
    { title: "Chronic Total Occlusion Interventions: Contemporary Techniques and Outcomes", journal: "Indian Heart Journal", year: "2022" }
  ];

  const reviews = [
    { patient: "Suresh Gupta", rating: 5, comment: "Dr. Sharma performed emergency angioplasty on my father. His expertise and calm demeanor during the critical situation was remarkable. Highly recommended!", date: "1 week ago" },
    { patient: "Meera Patel", rating: 5, comment: "Excellent doctor with great bedside manner. Explained the complex procedure in simple terms. The TAVI procedure was successful and recovery was smooth.", date: "3 weeks ago" },
    { patient: "Vikram Singh", rating: 5, comment: "Dr. Sharma is truly a master of his craft. The complex coronary intervention he performed saved my life. Forever grateful!", date: "1 month ago" },
    { patient: "Anita Sharma", rating: 4, comment: "Very knowledgeable and experienced doctor. The consultation was thorough, though the waiting time was slightly longer than expected.", date: "2 months ago" },
    { patient: "Rohit Agarwal", rating: 5, comment: "Outstanding cardiologist! His precision during the CTO procedure was incredible. Highly professional team and excellent post-operative care.", date: "3 months ago" }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner - LinkedIn Style */}
      <Card className="overflow-hidden shadow-xl">
        <div className="h-40 bg-gradient-to-r from-[#0284C7] via-[#0369A1] to-[#0E7490] relative">
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
        </div>
        <CardContent className="relative -mt-20 pb-8 px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Profile Image - LinkedIn Style */}
            <div className="relative flex-shrink-0">
              <div className="w-40 h-40 rounded-full overflow-hidden border-6 border-white shadow-2xl bg-white">
                {doctorProfile.image ? (
                  <img src={doctorProfile.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#0284C7] to-[#0E7490] flex items-center justify-center">
                    <Stethoscope className="h-20 w-20 text-white" />
                  </div>
                )}
              </div>
              {isOwnProfile && (
                <button className="absolute bottom-2 right-2 p-3 bg-[#0284C7] rounded-full text-white shadow-xl hover:bg-[#0E7490] transition-colors">
                  <Camera className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Professional Info - LinkedIn Style */}
            <div className="flex-1 pt-6">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6">
                <div className="mb-4 lg:mb-0">
                  <h1 className="text-4xl font-bold text-[#0F172A] mb-2">{doctorProfile.name}</h1>
                  <p className="text-2xl text-[#0284C7] font-semibold mb-1">{doctorProfile.specialization}</p>
                  <p className="text-lg text-[#0F172A]/80 font-medium">{doctorProfile.qualifications}</p>
                  <p className="text-[#0F172A]/60 mt-1">{doctorProfile.hospital} • {doctorProfile.experience} years experience</p>
                </div>
                {isOwnProfile && (
                  <Button onClick={() => setProfileEditOpen(true)} className="bg-[#0284C7] hover:bg-[#0E7490] px-6 py-3 text-lg font-semibold">
                    <Edit className="mr-2 h-5 w-5" /> Edit Profile
                  </Button>
                )}
              </div>

              {/* Key Metrics - LinkedIn Style */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#F0F9FF] rounded-lg">
                    <Building2 className="h-5 w-5 text-[#0284C7]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#0F172A]/60">Hospital</p>
                    <p className="font-semibold text-[#0F172A]">{doctorProfile.hospital}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#F0F9FF] rounded-lg">
                    <Star className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm text-[#0F172A]/60">Rating</p>
                    <p className="font-semibold text-[#0F172A]">{doctorProfile.rating}/5 ({doctorProfile.totalReviews} reviews)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#F0F9FF] rounded-lg">
                    <MapPin className="h-5 w-5 text-[#0284C7]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#0F172A]/60">Location</p>
                    <p className="font-semibold text-[#0F172A]">Noida, UP</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#F0F9FF] rounded-lg">
                    <Clock className="h-5 w-5 text-[#0284C7]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#0F172A]/60">Consultation</p>
                    <p className="font-semibold text-[#0F172A]">₹{doctorProfile.consultationFee}</p>
                  </div>
                </div>
              </div>

              {/* Status Badges and Book Button */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-3">
                  <Badge className="bg-green-100 text-green-700 px-4 py-2 text-sm font-semibold">
                    Available Today
                  </Badge>
                  <Badge variant="secondary" className="bg-[#F0F9FF] text-[#0284C7] px-4 py-2 text-sm font-semibold">
                    {doctorProfile.availability}
                  </Badge>
                  <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 px-4 py-2 text-sm font-semibold">
                    Top Rated Doctor
                  </Badge>
                </div>
                {!isOwnProfile && userRole === 'patient' && (
                  <Button 
                    onClick={handleBookAppointment}
                    className="bg-[#009688] hover:bg-[#00796B] text-white px-6 py-3 text-lg font-semibold"
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    Book Appointment
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="about" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        {/* About Tab */}
        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-[#0284C7]" />
                About Me
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#0F172A]/80 leading-relaxed">{doctorProfile.about}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#06B6D4]" />
                    Contact Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>{doctorProfile.phone}</p>
                    <p>{doctorProfile.email}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#06B6D4]" />
                    Availability
                  </h4>
                  <p className="text-sm">{doctorProfile.availability}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-[#0284C7]" />
                Education & Qualifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {education.map((edu, index) => (
                <div key={index} className="border-l-4 border-[#06B6D4] pl-4 py-2">
                  <h4 className="font-semibold text-[#0F172A]">{edu.degree}</h4>
                  <p className="text-[#0284C7] font-medium">{edu.institution}</p>
                  <p className="text-sm text-[#0F172A]/70">{edu.year}</p>
                </div>
              ))}
              
              <div className="mt-6">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#06B6D4]" />
                  Publications
                </h4>
                {publications.map((pub, index) => (
                  <div key={index} className="bg-[#F0F9FF] p-3 rounded-lg mb-2">
                    <p className="font-medium">{pub.title}</p>
                    <p className="text-sm text-[#0284C7]">{pub.journal} • {pub.year}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Experience Tab */}
        <TabsContent value="experience">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-[#0284C7]" />
                Professional Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {experience.map((exp, index) => (
                <div key={index} className="border-l-4 border-[#06B6D4] pl-4 py-2">
                  <h4 className="font-semibold text-[#0F172A]">{exp.position}</h4>
                  <p className="text-[#0284C7] font-medium">{exp.hospital}</p>
                  <p className="text-sm text-[#0F172A]/70">{exp.duration}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-[#0284C7]" />
                Skills & Specializations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-[#F0F9FF] text-[#0284C7] px-3 py-1">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#0284C7]" />
                Patient Reviews ({doctorProfile.totalReviews})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviews.map((review, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{review.patient}</p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-[#0F172A]/70">{review.date}</span>
                  </div>
                  <p className="text-[#0F172A]/80">{review.comment}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Appointment Booking */}
      {showBooking && availability && (
        <Card id="booking-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#0284C7]" />
              Book Appointment with {doctorProfile.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BookAppointment 
              doctor={{ id: doctorId || '', name: doctorProfile.name }}
              availability={availability}
              onBookAppointment={onAppointmentBooked}
            />
          </CardContent>
        </Card>
      )}

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