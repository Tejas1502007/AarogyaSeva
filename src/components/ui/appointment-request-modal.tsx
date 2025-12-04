"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Video, Hospital, Loader2, AlertCircle } from "lucide-react";
import { collection, addDoc, serverTimestamp, doc, getDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { format, parse, addMinutes } from "date-fns";

interface AppointmentRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string;
  doctorName: string;
}

export function AppointmentRequestModal({ isOpen, onClose, doctorId, doctorName }: AppointmentRequestModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [doctorAvailability, setDoctorAvailability] = useState<any>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    mode: "",
    appointmentType: "",
    symptoms: "",
    notes: ""
  });

  useEffect(() => {
    if (isOpen && doctorId) {
      loadDoctorAvailability();
    }
  }, [isOpen, doctorId]);

  useEffect(() => {
    if (formData.date && doctorAvailability) {
      generateAvailableSlots();
    }
  }, [formData.date, doctorAvailability]);

  const loadDoctorAvailability = async () => {
    setAvailabilityLoading(true);
    try {
      const availabilityRef = doc(db, "availability", doctorId);
      const docSnap = await getDoc(availabilityRef);
      if (docSnap.exists()) {
        setDoctorAvailability(docSnap.data());
      } else {
        toast({
          variant: "destructive",
          title: "No Availability Set",
          description: "This doctor hasn't set their availability yet."
        });
      }
    } catch (error) {
      console.error("Error loading availability:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load doctor's availability."
      });
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const generateAvailableSlots = () => {
    if (!formData.date || !doctorAvailability?.workingDays) return;
    
    const selectedDate = new Date(formData.date);
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
    const dayAvailability = doctorAvailability.workingDays[dayName];
    
    if (!dayAvailability?.enabled) {
      setAvailableSlots([]);
      return;
    }
    
    const slots: string[] = [];
    const slotDuration = parseInt(doctorAvailability.slotDuration || "30");
    const startTime = parse(dayAvailability.start, 'HH:mm', new Date());
    const endTime = parse(dayAvailability.end, 'HH:mm', new Date());
    
    let currentSlot = startTime;
    while (currentSlot < endTime) {
      slots.push(format(currentSlot, 'HH:mm'));
      currentSlot = addMinutes(currentSlot, slotDuration);
    }
    
    setAvailableSlots(slots);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const appointmentDateTime = new Date(`${formData.date}T${formData.time}`);
      
      // Check if slot is already booked
      const existingAppointments = await getDocs(
        query(
          collection(db, "appointments"),
          where("doctorId", "==", doctorId),
          where("appointmentTime", "==", appointmentDateTime),
          where("status", "in", ["Pending", "Confirmed"])
        )
      );
      
      if (!existingAppointments.empty) {
        toast({
          variant: "destructive",
          title: "Slot Unavailable",
          description: "This time slot has already been booked. Please select another time."
        });
        return;
      }
      
      // Get patient profile data
      const patientRef = doc(db, "users", user.uid);
      const patientSnap = await getDoc(patientRef);
      const patientData = patientSnap.exists() ? patientSnap.data() : {};
      
      await addDoc(collection(db, "appointments"), {
        patientId: user.uid,
        doctorId,
        doctorName,
        patientName: patientData.displayName || patientData.name || user.displayName || "Unknown Patient",
        patientPhone: patientData.phone || "",
        patientAge: patientData.age || 0,
        patientGender: patientData.sex || patientData.gender || "",
        appointmentTime: appointmentDateTime,
        mode: formData.mode,
        appointmentType: formData.appointmentType,
        symptoms: formData.symptoms,
        notes: formData.notes,
        status: "Pending",
        createdAt: serverTimestamp(),
      });

      // Create notification for doctor
      await addDoc(collection(db, "notifications"), {
        userId: doctorId,
        title: "New Appointment Request",
        description: `${patientData.displayName || patientData.name || user.displayName || "A patient"} has requested an appointment for ${format(appointmentDateTime, 'PPP p')}`,
        type: "info",
        read: false,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Request Sent Successfully!",
        description: `Your appointment request has been sent to Dr. ${doctorName}. You will be notified once it's reviewed.`,
      });

      onClose();
      setFormData({
        date: "",
        time: "",
        mode: "",
        appointmentType: "",
        symptoms: "",
        notes: ""
      });
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: "Could not send appointment request. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-teal-50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-teal-800">
            Book Appointment
          </DialogTitle>
          <p className="text-teal-600">Request an appointment with Dr. {doctorName}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!availabilityLoading && doctorAvailability && (
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
              <p className="text-sm text-teal-700">
                <strong>Doctor's Schedule:</strong> Available {Object.entries(doctorAvailability.workingDays || {})
                  .filter(([_, day]: [string, any]) => day.enabled)
                  .map(([dayName, day]: [string, any]) => `${dayName} (${day.start}-${day.end})`)
                  .join(", ")}
              </p>
            </div>
          )}

          {availabilityLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
              <span className="ml-2">Loading availability...</span>
            </div>
          ) : !doctorAvailability ? (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-700">Doctor availability not set. Please try again later.</span>
            </div>
          ) : (
            <>
              {/* Date Selection */}
              <div>
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Select Date
                </Label>
                <Input
                  type="date"
                  min={today}
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value, time: "" })}
                  className="border-2 border-teal-200"
                  required
                />
              </div>

              {/* Time Slots */}
              {formData.date && (
                <div>
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Available Time Slots
                  </Label>
                  {availableSlots.length === 0 ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-700">No slots available for selected date</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot}
                          type="button"
                          variant={formData.time === slot ? "default" : "outline"}
                          className={`text-sm ${
                            formData.time === slot 
                              ? "bg-teal-600 text-white" 
                              : "border-teal-200 text-teal-700 hover:bg-teal-50"
                          }`}
                          onClick={() => setFormData({ ...formData, time: slot })}
                        >
                          {slot}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Appointment Mode */}
          <div>
            <Label>Consultation Mode</Label>
            <Select value={formData.mode} onValueChange={(value) => setFormData({ ...formData, mode: value })}>
              <SelectTrigger className="border-2 border-teal-200">
                <SelectValue placeholder="Select consultation mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Online">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Online Video Call
                  </div>
                </SelectItem>
                <SelectItem value="In-Person">
                  <div className="flex items-center gap-2">
                    <Hospital className="h-4 w-4" />
                    In-Person Visit
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Appointment Type */}
          <div>
            <Label>Appointment Type</Label>
            <Select value={formData.appointmentType} onValueChange={(value) => setFormData({ ...formData, appointmentType: value })}>
              <SelectTrigger className="border-2 border-teal-200">
                <SelectValue placeholder="Select appointment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Consultation">General Consultation</SelectItem>
                <SelectItem value="Follow-up">Follow-up Visit</SelectItem>
                <SelectItem value="Check-up">Routine Check-up</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
                <SelectItem value="Second Opinion">Second Opinion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Symptoms */}
          <div>
            <Label>Symptoms/Reason for Visit</Label>
            <Textarea
              placeholder="Describe your symptoms or reason for the appointment..."
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              className="border-2 border-teal-200 min-h-[80px]"
              required
            />
          </div>

          {/* Additional Notes */}
          <div>
            <Label>Additional Notes (Optional)</Label>
            <Textarea
              placeholder="Any additional information for the doctor..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="border-2 border-teal-200 min-h-[60px]"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-teal-600 hover:bg-teal-700"
              disabled={loading || !formData.date || !formData.time || !formData.mode || !formData.symptoms || availabilityLoading || !doctorAvailability}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Requesting...
                </>
              ) : (
                "Request Appointment"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}