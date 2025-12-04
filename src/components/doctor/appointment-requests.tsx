"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, Calendar, Video, Hospital, User, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface AppointmentRequest {
  id: string;
  patientId: string;
  patientName: string;
  appointmentTime: { seconds: number; nanoseconds: number };
  mode: "Online" | "In-Person";
  appointmentType: string;
  symptoms: string;
  notes?: string;
  status: "Pending";
  createdAt: { seconds: number; nanoseconds: number };
}

export function AppointmentRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "appointments"),
      where("doctorId", "==", user.uid),
      where("status", "==", "Pending")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const appointmentRequests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppointmentRequest[];

      appointmentRequests.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
      setRequests(appointmentRequests);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching appointment requests:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch appointment requests."
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  const handleRequestAction = async (requestId: string, action: "approve" | "reject", patientId: string, patientName: string, appointmentTime: Date) => {
    if (!user) return;

    setProcessingId(requestId);
    try {
      const newStatus = action === "approve" ? "Confirmed" : "Cancelled";
      const appointmentRef = doc(db, "appointments", requestId);
      
      await updateDoc(appointmentRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      const notificationMessage = action === "approve" 
        ? `Your appointment with Dr. ${user.displayName} on ${format(appointmentTime, 'PPP p')} has been confirmed.`
        : `Your appointment request with Dr. ${user.displayName} on ${format(appointmentTime, 'PPP p')} has been declined.`;

      await addDoc(collection(db, "notifications"), {
        userId: patientId,
        title: `Appointment ${action === "approve" ? "Confirmed" : "Declined"}`,
        description: notificationMessage,
        type: action === "approve" ? "info" : "urgent",
        read: false,
        createdAt: serverTimestamp(),
      });

      toast({
        title: `Appointment ${action === "approve" ? "Approved" : "Rejected"}`,
        description: `The appointment request from ${patientName} has been ${action === "approve" ? "confirmed" : "declined"}.`,
      });
    } catch (error) {
      console.error(`Error ${action}ing appointment:`, error);
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: `Could not ${action} the appointment request.`
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2">Loading appointment requests...</span>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Appointment Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No pending appointment requests</p>
            <p className="text-sm">New requests will appear here for your review</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pending Appointment Requests
          <Badge variant="secondary" className="ml-2">
            {requests.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request) => {
            const appointmentDate = new Date(request.appointmentTime.seconds * 1000);
            const isProcessing = processingId === request.id;
            
            return (
              <div key={request.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-sky-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{request.patientName}</h4>
                      <p className="text-sm text-muted-foreground">
                        Requested {format(new Date(request.createdAt.seconds * 1000), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    Pending Review
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(appointmentDate, 'PPP p')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {request.mode === "Online" ? (
                      <Video className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Hospital className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{request.mode} Consultation</span>
                  </div>
                </div>

                <div>
                  <Badge variant="outline" className="text-xs">
                    {request.appointmentType}
                  </Badge>
                </div>

                <div>
                  <h5 className="font-medium text-sm mb-1">Symptoms/Reason:</h5>
                  <p className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                    {request.symptoms}
                  </p>
                </div>

                {request.notes && (
                  <div>
                    <h5 className="font-medium text-sm mb-1">Additional Notes:</h5>
                    <p className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                      {request.notes}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleRequestAction(request.id, "approve", request.patientId, request.patientName, appointmentDate)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => handleRequestAction(request.id, "reject", request.patientId, request.patientName, appointmentDate)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <X className="mr-2 h-4 w-4" />
                    )}
                    Decline
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}