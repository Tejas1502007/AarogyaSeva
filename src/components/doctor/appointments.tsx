
"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, getDoc, doc, updateDoc, setDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Video, Hospital, Check, X, Search, Clock, Save, Sun, Moon, MessageSquare, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useToast } from "@/hooks/use-toast";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import ChatBox from "../chat-box";
import { format, isToday, isFuture, isPast } from 'date-fns';
import { User } from 'lucide-react';

type AppointmentWithPatient = {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientPhone: string;
  patientImage: string;
  appointmentTime: { seconds: number; nanoseconds: number };
  mode: "Online" | "In-Person";
  status: "Confirmed" | "Completed" | "Cancelled" | "Pending";
  appointmentType?: string;
  symptoms?: string;
};

const daysOfWeek = [
    { id: 1, name: 'Monday', label: 'Mon' },
    { id: 2, name: 'Tuesday', label: 'Tue' },
    { id: 3, name: 'Wednesday', label: 'Wed' },
    { id: 4, name: 'Thursday', label: 'Thu' },
    { id: 5, name: 'Friday', label: 'Fri' },
    { id: 6, name: 'Saturday', label: 'Sat' },
    { id: 0, name: 'Sunday', label: 'Sun' },
];

export default function Appointments() {
  const [activeTab, setActiveTab] = useState("schedule");

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Schedule & Availability</h1>
        <p className="text-muted-foreground">Review appointments and configure your working hours.</p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="schedule">
        <TabsList className="grid w-full grid-cols-2 max-w-sm">
            <TabsTrigger value="schedule">Appointment Schedule</TabsTrigger>
            <TabsTrigger value="availability">Set Availability</TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule">
          <AppointmentSchedule />
        </TabsContent>
        <TabsContent value="availability">
          <SetAvailability />
        </TabsContent>
      </Tabs>
    </div>
  );
}


const AppointmentSchedule = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("today");

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, "appointments"),
            where("doctorId", "==", user.uid)
        );

        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            setLoading(true);
            const appointmentsPromises = querySnapshot.docs.map(async (appointmentDoc) => {
                const appointmentData = appointmentDoc.data();
                const patientId = appointmentData.patientId;
                
                let patientData = { name: "Unknown Patient", age: 0, sex: "N/A", phone: "", image: "" };
                if (patientId) {
                    const patientRef = doc(db, "users", patientId);
                    const patientSnap = await getDoc(patientRef);
                    if (patientSnap.exists()) {
                        const data = patientSnap.data();
                        patientData = {
                            name: data.displayName || data.name || "Unknown Patient",
                            age: data.age || 0,
                            sex: data.sex || data.gender || "N/A",
                            phone: data.phone || "",
                            image: data.image || ""
                        };
                    }
                }
                
                return {
                    id: appointmentDoc.id,
                    patientId,
                    patientName: patientData.name,
                    patientAge: patientData.age,
                    patientGender: patientData.sex,
                    patientPhone: patientData.phone,
                    patientImage: patientData.image,
                    ...appointmentData,
                } as AppointmentWithPatient;
            });

            try {
                const fetchedAppointments = await Promise.all(appointmentsPromises);
                fetchedAppointments.sort((a, b) => b.appointmentTime.seconds - a.appointmentTime.seconds);
                setAppointments(fetchedAppointments);
            } catch (error) {
                console.error("Error fetching appointments with patient data:", error);
                toast({ variant: "destructive", title: "Error", description: "Could not fetch appointment details." });
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

    const todayAppointments = appointments.filter(a => a.appointmentTime && isToday(new Date(a.appointmentTime.seconds * 1000)));
    const upcomingAppointments = appointments.filter(a => a.appointmentTime && isFuture(new Date(a.appointmentTime.seconds * 1000)));
    const pastAppointments = appointments.filter(a => a.appointmentTime && isPast(new Date(a.appointmentTime.seconds * 1000)));

    return (
        <Card>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <CardHeader>
                    <div className="flex justify-between items-center">
                    <CardTitle>Appointments</CardTitle>
                    <TabsList className="grid w-full grid-cols-3 max-w-md">
                        <TabsTrigger value="today">Today</TabsTrigger>
                        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                        <TabsTrigger value="past">Past</TabsTrigger>
                    </TabsList>
                    </div>
                    <div className="flex items-center gap-4 pt-4">
                        <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="Search by patient name..." className="pl-10" />
                        </div>
                        <Select>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                         <div className="flex justify-center items-center p-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            <span className="ml-2">Loading appointments...</span>
                        </div>
                    ) : (
                        <>
                            <TabsContent value="today">
                                <AppointmentsTable appointments={todayAppointments} />
                            </TabsContent>
                            <TabsContent value="upcoming">
                                <AppointmentsTable appointments={upcomingAppointments} />
                            </TabsContent>
                            <TabsContent value="past">
                                <AppointmentsTable appointments={pastAppointments} />
                            </TabsContent>
                        </>
                    )}
                </CardContent>
            </Tabs>
      </Card>
    )
}

const AppointmentsTable = ({ appointments }: { appointments: AppointmentWithPatient[] }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Confirmed": return "bg-blue-100 text-blue-800";
            case "Completed": return "bg-green-100 text-green-800";
            case "Cancelled": return "bg-red-100 text-red-800";
            case "Pending": return "bg-yellow-100 text-yellow-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };
    
    const createNotification = async (userId: string, title: string, description: string, type: "info" | "urgent" | "general" = "info") => {
        if (!userId) return;
        try {
            await addDoc(collection(db, "notifications"), {
                userId,
                title,
                description,
                type,
                read: false,
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            console.error("Error creating notification: ", error);
        }
    };


    const handleUpdateAppointment = async (appointment: AppointmentWithPatient, newStatus: "Confirmed" | "Cancelled" | "Completed") => {
        if (!user) return;
        
        const appointmentRef = doc(db, "appointments", appointment.id);
        try {
            await updateDoc(appointmentRef, { status: newStatus });
            
            // Create notifications for patient and doctor
            const aptDate = format(new Date(appointment.appointmentTime.seconds * 1000), 'PPP p');
            const patientMessage = `Your appointment with ${user.displayName} on ${aptDate} has been ${newStatus.toLowerCase()}.`;
            const doctorMessage = `Appointment with ${appointment.patientName} on ${aptDate} has been ${newStatus.toLowerCase()}.`;

            await createNotification(appointment.patientId, `Appointment ${newStatus}`, patientMessage, newStatus === 'Cancelled' ? 'urgent' : 'info');
            await createNotification(user.uid, `Appointment ${newStatus}`, doctorMessage);

            toast({
                title: `Appointment ${newStatus}`,
                description: `The appointment has been successfully ${newStatus.toLowerCase()}.`,
            });
        } catch (error) {
            console.error("Error updating appointment: ", error);
            toast({ variant: "destructive", title: "Update Failed", description: `Could not update the appointment status.` });
        }
    };


    if (appointments.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <p>No appointments found for this period.</p>
            </div>
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Patient</TableHead>
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
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-sky-200">
                                {apt.patientImage ? (
                                    <img src={apt.patientImage} alt={apt.patientName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-sky-100 flex items-center justify-center">
                                        <User className="h-5 w-5 text-sky-600" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="font-medium">{apt.patientName}</div>
                                <div className="text-sm text-muted-foreground">
                                    {apt.patientAge ? `${apt.patientAge} years` : ''} {apt.patientAge && apt.patientGender ? '•' : ''} {apt.patientGender}
                                </div>
                                {apt.patientPhone && (
                                    <div className="text-xs text-muted-foreground">{apt.patientPhone}</div>
                                )}
                            </div>
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
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
                        {apt.status === "Confirmed" && (
                            <div className="flex gap-2 justify-end">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <MessageSquare className="mr-2 h-4 w-4" /> Chat
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Chat with {apt.patientName}</DialogTitle>
                                        </DialogHeader>
                                        <ChatBox chatId={`appointment-${apt.id}`} />
                                    </DialogContent>
                                </Dialog>

                                <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50" onClick={() => handleUpdateAppointment(apt, 'Completed')}>
                                    <Check className="mr-2 h-4 w-4" /> Mark as Completed
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => handleUpdateAppointment(apt, 'Cancelled')}>
                                    <X className="mr-2 h-4 w-4" /> Cancel
                                </Button>
                            </div>
                        )}
                        {apt.status === "Pending" && (
                             <div className="flex gap-2 justify-end">
                                <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50" onClick={() => handleUpdateAppointment(apt, 'Confirmed')}>
                                    <Check className="mr-2 h-4 w-4" /> Confirm
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => handleUpdateAppointment(apt, 'Cancelled')}>
                                    <X className="mr-2 h-4 w-4" /> Decline
                                </Button>
                            </div>
                        )}
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

const SetAvailability = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [slotDuration, setSlotDuration] = useState("30");
    const [workingDays, setWorkingDays] = useState<Record<string, { enabled: boolean; start: string; end: string }>>({
        'Monday': { enabled: true, start: '10:00', end: '18:00'},
        'Tuesday': { enabled: true, start: '10:00', end: '18:00'},
        'Wednesday': { enabled: true, start: '10:00', end: '18:00'},
        'Thursday': { enabled: true, start: '10:00', end: '18:00'},
        'Friday': { enabled: true, start: '10:00', end: '18:00'},
        'Saturday': { enabled: false, start: '10:00', end: '14:00'},
        'Sunday': { enabled: false, start: '10:00', end: '18:00'},
    });

    useEffect(() => {
        const fetchAvailability = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const availabilityRef = doc(db, "availability", user.uid);
                const docSnap = await getDoc(availabilityRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setSlotDuration(data.slotDuration || "30");
                    setWorkingDays(data.workingDays);
                }
            } catch (error) {
                console.error("Error fetching availability:", error);
                toast({ variant: "destructive", title: "Error", description: "Could not load your availability settings." });
            } finally {
                setLoading(false);
            }
        };

        fetchAvailability();
    }, [user, toast]);

    const handleDayChange = (dayName: string, field: 'enabled' | 'start' | 'end', value: string | boolean) => {
        setWorkingDays(prev => ({
            ...prev,
            [dayName]: { ...prev[dayName], [field]: value }
        }));
    };

    const handleSaveChanges = async () => {
        if (!user) {
            toast({ variant: "destructive", title: "Error", description: "You must be logged in to save settings." });
            return;
        }
        setIsSaving(true);
        try {
            const availabilityRef = doc(db, "availability", user.uid);
            await setDoc(availabilityRef, {
                slotDuration,
                workingDays,
            }, { merge: true });

            toast({
                title: "Settings Saved!",
                description: "Your availability has been updated successfully.",
            });
        } catch (error) {
            console.error("Error saving availability:", error);
            toast({ variant: "destructive", title: "Save Failed", description: "Could not save your availability settings." });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2">Loading availability...</span>
            </div>
        )
    }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Appointment Settings</CardTitle>
          <CardDescription>
            Configure the duration of your appointment slots.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-2 max-w-xs">
                <Label htmlFor="slot-duration" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Slot Duration (minutes)
                </Label>
                 <Select value={slotDuration} onValueChange={setSlotDuration}>
                    <SelectTrigger id="slot-duration">
                        <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="20">20 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>
      
      <Card className="mt-6">
        <CardHeader>
            <CardTitle>Weekly Working Hours</CardTitle>
            <CardDescription>
                Define the days and times you are available for consultations.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {daysOfWeek.map(day => (
                <div key={day.id} className="grid grid-cols-4 items-center gap-4 p-4 border rounded-lg">
                    <div className="col-span-1 flex items-center">
                         <Checkbox 
                            id={`check-${day.name}`} 
                            checked={workingDays[day.name]?.enabled}
                            onCheckedChange={(checked) => handleDayChange(day.name, 'enabled', !!checked)}
                            className="mr-3"
                        />
                        <Label htmlFor={`check-${day.name}`} className="font-semibold text-lg">{day.name}</Label>
                    </div>
                    <div className="col-span-3 grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor={`start-${day.name}`} className="flex items-center gap-2 text-sm text-muted-foreground"><Sun className="h-4 w-4"/> Start Time</Label>
                            <Input 
                                type="time" 
                                id={`start-${day.name}`} 
                                value={workingDays[day.name]?.start}
                                onChange={(e) => handleDayChange(day.name, 'start', e.target.value)}
                                disabled={!workingDays[day.name]?.enabled}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`end-${day.name}`} className="flex items-center gap-2 text-sm text-muted-foreground"><Moon className="h-4 w-4" /> End Time</Label>
                             <Input 
                                type="time" 
                                id={`end-${day.name}`}
                                value={workingDays[day.name]?.end}
                                onChange={(e) => handleDayChange(day.name, 'end', e.target.value)}
                                disabled={!workingDays[day.name]?.enabled}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </CardContent>
        <CardFooter className="border-t pt-6">
            <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
        </CardFooter>
      </Card>
    </>
  )
}

    