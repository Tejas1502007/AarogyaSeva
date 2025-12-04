
"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye, Search, Phone, MapPin, Calendar, FileText, Video, StickyNote, Filter } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface Patient {
  id: string;
  name: string;
  age: number;
  sex: string;
  photoURL?: string;
  phone?: string;
  location?: string;
  condition?: string;
  referredBy?: string;
  lastVisit?: Date;
}

export default function MyPatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const router = useRouter();

  const startVideoCall = (platform: string, patientName: string) => {
    const meetingUrl = platform === 'zoom' 
      ? `https://zoom.us/start/videomeeting`
      : `https://meet.google.com/new`;
    window.open(meetingUrl, '_blank');
  };

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const q = query(collection(db, "users"), where("role", "==", "patient"));
        const querySnapshot = await getDocs(q);
        const patientsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Patient[];
        setPatients(patientsData);
      } catch (error) {
        console.error("Error fetching patients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.phone && patient.phone.includes(searchTerm)) ||
      (patient.condition && patient.condition.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterBy === "all" || 
      (patient.condition && patient.condition.toLowerCase().includes(filterBy.toLowerCase()));
    
    const matchesLocation = locationFilter === "all" || 
      (patient.location && patient.location.toLowerCase().includes(locationFilter.toLowerCase()));
    
    return matchesSearch && matchesFilter && matchesLocation;
  });


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#0F172A]">My Patients</h1>
        <Badge className="bg-[#0284C7] text-white">{patients.length} Total Patients</Badge>
      </div>

      {/* Filters */}
      <Card className="border-[#06B6D4]/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-[#06B6D4]" />
              <Input
                placeholder="Search by name, phone, condition..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 border-[#06B6D4]/30 focus:border-[#0284C7]"
              />
            </div>
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-48 border-[#06B6D4]/30">
                <Filter className="h-4 w-4 mr-2 text-[#06B6D4]" />
                <SelectValue placeholder="Filter by condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                <SelectItem value="cardiology">Cardiology</SelectItem>
                <SelectItem value="diabetes">Diabetes</SelectItem>
                <SelectItem value="hypertension">Hypertension</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-48 border-[#06B6D4]/30">
                <MapPin className="h-4 w-4 mr-2 text-[#06B6D4]" />
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="mumbai">Mumbai</SelectItem>
                <SelectItem value="delhi">Delhi</SelectItem>
                <SelectItem value="bangalore">Bangalore</SelectItem>
                <SelectItem value="pune">Pune</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <CardContent className="p-4 flex items-center gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-[150px]" />
                            <Skeleton className="h-4 w-[100px]" />
                        </div>
                        <Skeleton className="h-10 w-10 rounded-md" />
                    </CardContent>
                </Card>
            ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="border-[#06B6D4]/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={patient.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${patient.name}`} />
                    <AvatarFallback className="bg-[#F0F9FF] text-[#0284C7] font-bold">
                      {patient.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-[#0F172A] mb-1">{patient.name}</h3>
                    <div className="space-y-1 text-sm text-[#0F172A]/70">
                      <p>{patient.age} years, {patient.sex}</p>
                      {patient.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{patient.phone || '+91 98765 43210'}</span>
                        </div>
                      )}
                      {patient.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{patient.location || 'Mumbai, India'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <Badge className="bg-[#F0F9FF] text-[#0284C7] border-[#06B6D4]/30 mb-4">
                  {patient.condition || 'General Consultation'}
                </Badge>
                
                <div className="flex items-center gap-1 text-sm text-[#0F172A]/70 mb-4">
                  <Calendar className="h-3 w-3" />
                  <span>Last visit: {patient.lastVisit ? patient.lastVisit.toLocaleDateString() : 'Jan 15, 2024'}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-[#0284C7] hover:bg-[#0E7490]" onClick={() => router.push('/doctor/records')}>
                      <FileText className="h-4 w-4 mr-2" />
                      View Record
                    </Button>
                    <Button size="sm" variant="outline" className="border-[#06B6D4] text-[#0284C7] hover:bg-[#F0F9FF]">
                      <StickyNote className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 border-[#06B6D4] text-[#0284C7] hover:bg-[#F0F9FF]"
                      onClick={() => startVideoCall('zoom', patient.name)}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Zoom Call
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 border-[#06B6D4] text-[#0284C7] hover:bg-[#F0F9FF]"
                      onClick={() => startVideoCall('meet', patient.name)}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Meet Call
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
       {!loading && filteredPatients.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No patients found.</p>
          </div>
        )}
    </div>
  );
}
