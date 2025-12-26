
"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { add, format, eachDayOfInterval, startOfWeek, startOfMonth, endOfMonth, endOfWeek, isSameDay, isBefore, startOfToday, getDay } from 'date-fns';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, Clock, Video, Hospital, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { useToast } from "@/hooks/use-toast";

type Availability = {
    slotDuration: number;
    workingDays: Record<string, { enabled: boolean; start: string; end: string }>;
    bookedSlots: Date[];
}

interface Doctor {
  id: string;
  name: string;
}

const dayMapping: Record<number, string> = {
    0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 
    4: 'Thursday', 5: 'Friday', 6: 'Saturday'
};

export default function BookAppointment({ 
    doctor,
    availability,
    onBookAppointment 
}: { 
    doctor: Doctor,
    availability: Availability,
    onBookAppointment: (slot: Date, mode: 'online' | 'in-person') => void 
}) {
    const { toast } = useToast();
    const { user } = useAuth();
    const today = startOfToday();
    const [selectedDate, setSelectedDate] = useState<Date>(today);
    const [currentMonth, setCurrentMonth] = useState(format(today, 'MMM-yyyy'));
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [consultationMode, setConsultationMode] = useState<"online" | "in-person">("in-person");
    const [isBooking, setIsBooking] = useState(false);

    let firstDayCurrentMonth = new Date(currentMonth);

    const days = eachDayOfInterval({
        start: startOfWeek(startOfMonth(firstDayCurrentMonth)),
        end: endOfWeek(endOfMonth(firstDayCurrentMonth)),
    });

    const nextMonth = () => {
        const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
        setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
    }
    
    const prevMonth = () => {
        const firstDayPrevMonth = add(firstDayCurrentMonth, { months: -1 });
        setCurrentMonth(format(firstDayPrevMonth, 'MMM-yyyy'));
    }

    const getTimeSlots = (date: Date) => {
        const dayName = dayMapping[getDay(date)];
        const { workingDays, slotDuration, bookedSlots } = availability;
        
        const dayConfig = workingDays[dayName];
        if (!dayConfig || !dayConfig.enabled) {
            return [];
        }

        const slots = [];
        let currentTime = new Date(date);
        const [startHour, startMinute] = dayConfig.start.split(':').map(Number);
        currentTime.setHours(startHour, startMinute, 0, 0);

        const [endHour, endMinute] = dayConfig.end.split(':').map(Number);
        const endTime = new Date(date);
        endTime.setHours(endHour, endMinute, 0, 0);

        while (currentTime < endTime) {
            const isBooked = bookedSlots.some(bookedSlot => 
                isSameDay(bookedSlot, date) && 
                bookedSlot.getHours() === currentTime.getHours() && 
                bookedSlot.getMinutes() === currentTime.getMinutes()
            );
            
            if (!isBooked && !isBefore(currentTime, new Date())) {
                slots.push(format(currentTime, 'h:mm a'));
            }
            currentTime = add(currentTime, { minutes: slotDuration });
        }
        return slots;
    }
    
    const timeSlots = getTimeSlots(selectedDate);
    const isDayDisabled = (day: Date) => {
        const dayName = dayMapping[getDay(day)];
        const dayConfig = availability.workingDays[dayName];
        return isBefore(day, today) || !dayConfig || !dayConfig.enabled;
    }


    const handleBook = async () => {
        if (!selectedTime) {
            toast({ variant: "destructive", title: "Uh oh!", description: "Please select a time slot."});
            return;
        }
        if (!user) {
            toast({ variant: "destructive", title: "Not Logged In", description: "You must be logged in to book an appointment."});
            return;
        }
        setIsBooking(true);
        const timeDate = new Date(`1970-01-01 ${selectedTime}`);
        const hour = timeDate.getHours();
        const minute = timeDate.getMinutes();
        const bookedSlotDate = new Date(selectedDate);
        bookedSlotDate.setHours(hour, minute);
        
        try {
            // Create the appointment
            await addDoc(collection(db, "appointments"), {
                patientId: user.uid,
                patientName: user.displayName,
                doctorId: doctor.id,
                doctorName: doctor.name,
                appointmentTime: bookedSlotDate,
                mode: consultationMode,
                status: "Pending",
                createdAt: serverTimestamp(),
            });

            // Also create a record for the patient
            await addDoc(collection(db, "records"), {
              ownerId: user.uid,
              name: `Appointment with ${doctor.name}`,
              type: 'Appointment Request',
              createdAt: serverTimestamp(),
              details: {
                doctorName: doctor.name,
                doctorId: doctor.id,
                appointmentTime: bookedSlotDate,
                mode: consultationMode,
                status: "Pending",
              }
            });

            onBookAppointment(bookedSlotDate, consultationMode as 'online' | 'in-person');
            toast({ title: "Appointment Requested!", description: `Your appointment request with ${doctor.name} on ${format(selectedDate, 'PPP')} at ${selectedTime} has been sent and saved to your records.`});
            setSelectedTime(null);
        } catch (error) {
            console.error("Error booking appointment: ", error);
            toast({ variant: "destructive", title: "Booking Failed", description: "Could not book the appointment. Please try again."});
        } finally {
            setIsBooking(false);
        }
    }

    return (
    <Card>
      <CardHeader>
        <CardTitle>Book an Appointment</CardTitle>
        <CardDescription>Select a date and time to schedule your consultation.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={prevMonth} disabled={isSameDay(firstDayCurrentMonth, startOfMonth(today))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="font-semibold">{format(firstDayCurrentMonth, 'MMMM yyyy')}</h3>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 mt-4 text-center text-xs text-muted-foreground">
            <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
          </div>
          <div className="grid grid-cols-7 gap-1 mt-2">
            {days.map(day => (
              <Button
                key={day.toString()}
                variant="ghost"
                size="icon"
                onClick={() => {setSelectedDate(day); setSelectedTime(null)}}
                disabled={isDayDisabled(day)}
                className={cn(
                  "h-8 w-8 rounded-full",
                  isSameDay(day, selectedDate) && "bg-primary text-primary-foreground",
                  isSameDay(day, today) && "text-primary",
                  !isSameDay(startOfMonth(firstDayCurrentMonth), startOfMonth(day)) && "text-muted-foreground",
                  format(firstDayCurrentMonth, 'M') !== format(day, 'M') && "text-muted-foreground/50"
                )}
              >
                {format(day, 'd')}
              </Button>
            ))}
          </div>
        </div>
        
        {!isDayDisabled(selectedDate) ? (
            <div>
                <h4 className="font-semibold mb-2 text-sm">Available Slots for {format(selectedDate, 'PPP')}</h4>
                <div className="grid grid-cols-3 gap-2">
                    {timeSlots.length > 0 ? timeSlots.map(slot => (
                        <Button 
                            key={slot} 
                            variant={selectedTime === slot ? 'default' : 'outline'}
                            onClick={() => setSelectedTime(slot)}
                            className="text-xs"
                        >
                           <Clock className="mr-2 h-3 w-3" /> {slot}
                        </Button>
                    )) : <p className="col-span-3 text-sm text-muted-foreground">No available slots for this day.</p>}
                </div>
            </div>
        ) : null }

        <div>
            <h4 className="font-semibold mb-2 text-sm">Consultation Mode</h4>
            <RadioGroup value={consultationMode} onValueChange={(v) => setConsultationMode(v as any)} className="flex gap-4">
                <Label htmlFor="in-person" className="flex items-center gap-2 border rounded-md p-3 flex-1 has-[:checked]:bg-accent has-[:checked]:border-primary">
                    <RadioGroupItem value="in-person" id="in-person" />
                    <Hospital className="h-5 w-5 mr-1" />
                    In-Person
                </Label>
                <Label htmlFor="online" className="flex items-center gap-2 border rounded-md p-3 flex-1 has-[:checked]:bg-accent has-[:checked]:border-primary">
                    <RadioGroupItem value="online" id="online" />
                    <Video className="h-5 w-5 mr-1" />
                    Online
                </Label>
            </RadioGroup>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleBook} disabled={!selectedTime || isBooking}>
            {isBooking ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Booking...</> : `Book for ${selectedTime || '...'}`}
        </Button>
      </CardFooter>
    </Card>
  );
}
