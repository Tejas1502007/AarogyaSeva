
"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Star, MessageCircle, Hospital, Award, Stethoscope, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import BookAppointment from "./book-appointment";
import { Skeleton } from "../ui/skeleton";
import { Timestamp } from "firebase/firestore";

interface Doctor {
    id: string;
    name: string;
    specialty: string;
    experience: string;
    hospital: string;
    fee: string;
    notes: string | null;
    source: string;
    rating: number;
    photoUrl: string;
    bio: string;
    education: string[];
    services: string[];
}

type Availability = {
    slotDuration: number;
    workingDays: Record<string, { enabled: boolean; start: string; end: string }>;
    bookedSlots: Date[];
}

// Mock data for static details
const mockDoctorDetails: Omit<Doctor, 'id' | 'name'> = {
    specialty: "General Physician",
    experience: "16 years",
    hospital: "Ashoka Medicover Hospital, Nashik",
    fee: "₹600",
    notes: "86% patient satisfaction rate with 7 reviews.",
    source: "Practo",
    rating: 4.3,
    photoUrl: "https://placehold.co/150x150/008080/FFFFFF?text=MP",
    bio: "A renowned General Physician with over 16 years of experience in providing comprehensive medical care. Known for a patient-centric approach and accurate diagnoses.",
    education: ["MBBS from B.J. Medical College, Pune", "MD in General Medicine from Topiwala National Medical College, Mumbai"],
    services: ["General Health Checkup", "Diabetes Management", "Hypertension Treatment", "Infectious Diseases"]
};

const defaultAvailability: Availability = {
    slotDuration: 30,
    workingDays: {
        'Monday': { enabled: true, start: '10:00', end: '18:00'},
        'Tuesday': { enabled: true, start: '10:00', end: '18:00'},
        'Wednesday': { enabled: true, start: '10:00', end: '18:00'},
        'Thursday': { enabled: true, start: '10:00', end: '18:00'},
        'Friday': { enabled: true, start: '10:00', end: '18:00'},
        'Saturday': { enabled: false, start: '10:00', end: '14:00'},
        'Sunday': { enabled: false, start: '10:00', end: '18:00'},
    },
    bookedSlots: [],
};


export default function DoctorProfile({ doctorId }: { doctorId: string }) {
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchDoctorData = async () => {
          if (!doctorId) return;
          setLoading(true);
          try {
              // Fetch doctor's main profile
              const docRef = doc(db, "users", doctorId);
              const docSnap = await getDoc(docRef);

              if (docSnap.exists()) {
                  const userData = docSnap.data();
                  setDoctor({
                      id: docSnap.id,
                      name: userData.name,
                      ...mockDoctorDetails, // Merging with mock details
                  });
              } else {
                  console.log("No such doctor!");
                  setLoading(false);
                  return;
              }

              // Fetch doctor's availability
              const availabilityRef = doc(db, "availability", doctorId);
              const availabilitySnap = await getDoc(availabilityRef);
              
              let fetchedAvailability = defaultAvailability;
              if (availabilitySnap.exists()) {
                  const data = availabilitySnap.data();
                  fetchedAvailability = {
                      ...defaultAvailability,
                      slotDuration: data.slotDuration ? parseInt(data.slotDuration) : 30,
                      workingDays: data.workingDays,
                  };
              }
              
              // Fetch doctor's booked appointments
              const appointmentsQuery = query(
                collection(db, "appointments"),
                where("doctorId", "==", doctorId),
                where("status", "in", ["Confirmed", "Pending"])
              );
              const appointmentsSnapshot = await getDocs(appointmentsQuery);
              const bookedSlots = appointmentsSnapshot.docs.map(doc => {
                  const data = doc.data();
                  return (data.appointmentTime as Timestamp).toDate();
              });

              setAvailability({ ...fetchedAvailability, bookedSlots });

          } catch (error) {
              console.error("Error fetching doctor data:", error);
          } finally {
              setLoading(false);
          }
      };

      fetchDoctorData();
  }, [doctorId]);

  const handleBookAppointment = (slot: Date, mode: 'online' | 'in-person') => {
    // Optimistically update the UI
    setAvailability(prev => prev ? ({
        ...prev,
        bookedSlots: [...prev.bookedSlots, slot]
    }) : null);
  };

  if (loading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-40" />
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardContent className="p-6 grid md:grid-cols-3 gap-6">
                            <div className="flex flex-col items-center text-center md:col-span-1">
                                <Skeleton className="h-32 w-32 rounded-full mb-4" />
                                <Skeleton className="h-8 w-48 mb-2" />
                                <Skeleton className="h-6 w-32" />
                            </div>
                            <div className="md:col-span-2 space-y-4">
                                <Skeleton className="h-6 w-1/3" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <Skeleton className="h-[500px] w-full" />
                </div>
            </div>
        </div>
    );
  }

  if (!doctor) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <p className="text-2xl font-bold">Doctor not found.</p>
            <p className="text-muted-foreground">The profile you are looking for does not exist.</p>
            <Button onClick={() => router.back()} className="mt-4">
                <ArrowLeft className="mr-2" /> Go Back
            </Button>
        </div>
    );
  }

  return (
    <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2" /> Back to Search Results
        </Button>
        
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                 <Card>
                    <CardContent className="p-6 grid md:grid-cols-3 gap-6">
                    <div className="flex flex-col items-center text-center md:col-span-1">
                        <Avatar className="h-32 w-32 mb-4 ring-2 ring-primary ring-offset-2">
                            <AvatarImage src={doctor.photoUrl} alt={doctor.name} data-ai-hint="doctor portrait" />
                            <AvatarFallback>{doctor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                        {doctor.name} <CheckCircle className="h-6 w-6 text-primary" title="Verified" />
                        </h2>
                        <div className="flex items-center gap-2 text-lg text-primary font-medium">
                            <Stethoscope className="h-5 w-5" />
                            <p>{doctor.specialty}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-md">
                                <Star className="h-4 w-4 mr-1 text-yellow-500" /> {doctor.rating} / 5.0
                            </Badge>
                            <Badge variant={doctor.source === 'Practo' ? 'default' : 'outline'}>
                                Source: {doctor.source}
                            </Badge>
                        </div>
                        
                    </div>

                    <div className="md:col-span-2 space-y-6">
                        <div>
                        <h3 className="font-semibold text-lg border-b pb-2 mb-2">Professional Summary</h3>
                        <p className="text-muted-foreground">{doctor.bio}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2" title="Experience">
                                <Award className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="font-semibold">Experience</p>
                                    <p className="text-muted-foreground">{doctor.experience}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2" title="Consultation Fee">
                                <span className="font-bold text-primary text-lg">₹</span>
                                <div>
                                    <p className="font-semibold">Consultation Fee</p>
                                    <p className="text-muted-foreground">{doctor.fee}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-2 text-sm" title="Hospital Affiliation">
                            <Hospital className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                                <p className="font-semibold">Hospital Affiliation</p>
                                <p className="text-muted-foreground">{doctor.hospital}</p>
                            </div>
                        </div>

                        {doctor.notes && (
                            <div className="mt-4 p-3 rounded-md bg-accent/50 border border-accent">
                                <p className="text-sm text-accent-foreground flex items-start gap-2">
                                <MessageCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                <span className="flex-1">{doctor.notes}</span>
                                </p>
                            </div>
                        )}
                    </div>
                    </CardContent>
                </Card>
                 <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Education & Qualifications</CardTitle>
                            <CardDescription>The doctor's academic and professional credentials.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                {doctor.education.map((edu, i) => <li key={i}>{edu}</li>)}
                            </ul>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Services Offered</CardTitle>
                            <CardDescription>Key services and treatments provided.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                {doctor.services.map((service, i) => <li key={i}>{service}</li>)}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-6">
                    {availability ? (
                        <BookAppointment 
                            doctor={doctor}
                            availability={availability}
                            onBookAppointment={handleBookAppointment}
                        />
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>Book an Appointment</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center h-64">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                <p className="mt-2 text-muted-foreground">Loading availability...</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}
