
"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Video, Hospital, MoreVertical, Pencil, X, PlusCircle, MessageSquare, Loader2, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import ChatBox from "../chat-box";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { AppointmentCalendar } from "@/components/ui/appointment-calendar";

type AppointmentWithDoctor = {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  doctorPhone: string;
  doctorImage: string;
  doctorQualifications: string;
  appointmentTime: { seconds: number; nanoseconds: number };
  mode: "Online" | "In-Person";
  status: "Confirmed" | "Completed" | "Cancelled" | "Pending";
  appointmentType?: string;
  symptoms?: string;
};




export default function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentWithDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    };

    const q = query(
        collection(db, "appointments"),
        where("patientId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        setLoading(true);
        const appointmentsPromises = querySnapshot.docs.map(async (appointmentDoc) => {
            const appointmentData = appointmentDoc.data();
            const doctorId = appointmentData.doctorId;
            
            let doctorData = { 
                name: appointmentData.doctorName || "Unknown Doctor", 
                specialization: "General Medicine",
                phone: "",
                image: "",
                qualifications: ""
            };
            
            if (doctorId) {
                const doctorRef = doc(db, "users", doctorId);
                const doctorSnap = await getDoc(doctorRef);
                if (doctorSnap.exists()) {
                    const data = doctorSnap.data();
                    doctorData = {
                        name: data.displayName || data.name || appointmentData.doctorName || "Unknown Doctor",
                        specialization: data.specialization || "General Medicine",
                        phone: data.phone || "",
                        image: data.image || "",
                        qualifications: data.qualifications || ""
                    };
                }
            }

            return {
                id: appointmentDoc.id,
                doctorId,
                doctorName: doctorData.name,
                specialty: doctorData.specialization,
                doctorPhone: doctorData.phone,
                doctorImage: doctorData.image,
                doctorQualifications: doctorData.qualifications,
                ...appointmentData,
            } as AppointmentWithDoctor;
        });

        try {
            const fetchedAppointments = await Promise.all(appointmentsPromises);
            fetchedAppointments.sort((a, b) => b.appointmentTime.seconds - a.appointmentTime.seconds);
            setAppointments(fetchedAppointments);
        } catch (error) {
            console.error("Error processing appointments:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not load appointment details." });
        } finally {
            setLoading(false);
        }
    }, (error) => {
        console.error("Error fetching appointments: ", error);
        toast({ variant: "destructive", title: "Error", description: "Could not fetch appointments."});
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);


  const handleCancelAppointment = (appointmentId: string) => {
    // Logic to update appointment status to 'Cancelled' in Firestore
    toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been successfully cancelled.",
    });
  };
  
  const upcomingAppointments = appointments.filter(a => a.status === 'Confirmed' || a.status === 'Pending');
  const pastAppointments = appointments.filter(a => a.status === 'Completed' || a.status === 'Cancelled');

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
            <p className="text-muted-foreground">Manage your upcoming and past appointments.</p>
        </div>
        <Button onClick={() => router.push('/patient/find-doctors')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Book New Appointment
        </Button>
      </header>

      <Card>
        <Tabs defaultValue="upcoming">
          <CardHeader>
            <CardTitle>Appointment History</CardTitle>
            <CardDescription>A list of all your scheduled consultations.</CardDescription>
            <TabsList className="grid w-full grid-cols-2 mt-4 max-w-sm">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            {loading ? (
                <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2">Loading appointments...</span>
                </div>
            ) : (
                <>
                    <TabsContent value="upcoming">
                    <AppointmentsTable appointments={upcomingAppointments} onCancel={handleCancelAppointment} />
                    </TabsContent>
                    <TabsContent value="past">
                    <AppointmentsTable appointments={pastAppointments} onCancel={handleCancelAppointment} />
                    </TabsContent>
                </>
            )}
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}

const AppointmentsTable = ({ appointments, onCancel }: { appointments: AppointmentWithDoctor[], onCancel: (id: string) => void }) => {
    
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Confirmed": return "bg-blue-100 text-blue-800";
            case "Completed": return "bg-green-100 text-green-800";
            case "Cancelled": return "bg-red-100 text-red-800";
            case "Pending": return "bg-yellow-100 text-yellow-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };
    
    if (appointments.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <p>No appointments in this category.</p>
            </div>
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {appointments.map((apt) => (
                <TableRow key={apt.id}>
                    <TableCell>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-teal-200">
                                {apt.doctorImage ? (
                                    <img src={apt.doctorImage} alt={apt.doctorName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-teal-100 flex items-center justify-center">
                                        <User className="h-5 w-5 text-teal-600" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="font-medium">{apt.doctorName}</div>
                                <div className="text-sm text-muted-foreground">{apt.specialty}</div>
                                {apt.doctorQualifications && (
                                    <div className="text-xs text-muted-foreground">{apt.doctorQualifications}</div>
                                )}
                                {apt.doctorPhone && (
                                    <div className="text-xs text-muted-foreground">{apt.doctorPhone}</div>
                                )}
                            </div>
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {apt.appointmentTime ? format(new Date(apt.appointmentTime.seconds * 1000), 'PPP p') : 'N/A'}
                        </div>
                    </TableCell>
                    <TableCell>
                         <Badge variant="outline" className="flex items-center gap-1.5 w-fit">
                            {apt.mode === 'Online' ? <Video className="h-4 w-4"/> : <Hospital className="h-4 w-4" />}
                            {apt.mode}
                        </Badge>
                    </TableCell>
                    <TableCell>
                        <Badge className={getStatusBadge(apt.status)}>{apt.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        {(apt.status === "Confirmed" || apt.status === "Pending") && (
                             <Dialog>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DialogTrigger asChild>
                                            <DropdownMenuItem>
                                                <MessageSquare className="mr-2 h-4 w-4" /> Chat with Doctor
                                            </DropdownMenuItem>
                                        </DialogTrigger>
                                        <DropdownMenuItem>
                                            <Pencil className="mr-2 h-4 w-4" /> Reschedule
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600" onClick={() => onCancel(apt.id)}>
                                            <X className="mr-2 h-4 w-4" /> Cancel
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Chat with {apt.doctorName}</DialogTitle>
                                    </DialogHeader>
                                    <ChatBox chatId={`appointment-${apt.id}`} />
                                </DialogContent>
                            </Dialog>
                        )}
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
