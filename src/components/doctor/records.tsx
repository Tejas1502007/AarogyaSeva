
"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2 } from "lucide-react";
import RecordSummarizer from "../record-summarizer";
import { format } from "date-fns";

type Appointment = {
  id: string;
  patientName: string;
  mode: "Online" | "In-Person";
  appointmentTime: { seconds: number; nanoseconds: number };
};

export default function Records() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

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
      const appointmentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Appointment[];
      
      appointmentsData.sort((a, b) => b.appointmentTime.seconds - a.appointmentTime.seconds);
      setAppointments(appointmentsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching appointments:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Patient Records</h1>
          <p className="text-muted-foreground">Access all available patient records and documents.</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Accessed Records</CardTitle>
            <CardDescription>Browse patient health records from the current session.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Record Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      <div className="flex justify-center items-center p-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <span className="ml-2">Loading records...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : appointments.length > 0 ? (
                  appointments.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">Appointment with {record.patientName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          <FileText className="h-3 w-3" />
                          Appointment
                        </Badge>
                      </TableCell>
                      <TableCell>{record.appointmentTime ? format(new Date(record.appointmentTime.seconds * 1000), 'PPP') : 'N/A'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No appointment records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-1">
        <div className="sticky top-6">
          <RecordSummarizer />
        </div>
      </div>
    </div>
  );
}
