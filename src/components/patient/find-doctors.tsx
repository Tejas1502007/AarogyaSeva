"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  Search, MapPin, Star, Clock, Phone, Calendar, 
  Stethoscope, Heart, Brain, Eye, Bone, Baby, Users, Loader2
} from "lucide-react";
import { DoctorProfile } from "@/components/doctor/doctor-profile";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";



const specializations = [
  { name: "Cardiology", icon: Heart, count: 0 },
  { name: "Neurology", icon: Brain, count: 0 },
  { name: "Pediatrics", icon: Baby, count: 0 },
  { name: "Orthopedics", icon: Bone, count: 0 },
  { name: "Ophthalmology", icon: Eye, count: 0 },
  { name: "General Medicine", icon: Stethoscope, count: 0 }
];

export function FindDoctors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const doctorsQuery = query(collection(db, "users"), where("role", "==", "doctor"));
    const unsubscribe = onSnapshot(doctorsQuery, (snapshot) => {
      const doctorsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        name: doc.data().displayName || doc.data().name || "Dr. Unknown",
        specialization: doc.data().specialization || "General Medicine",
        hospital: doc.data().hospital || "Hospital",
        location: doc.data().location || "Location",
        rating: doc.data().rating || 4.5,
        reviews: doc.data().reviews || 0,
        experience: doc.data().experience || 5,
        consultationFee: doc.data().consultationFee || 500,
        image: doc.data().image || "",
        availability: "Available Today"
      }));
      setDoctors(doctorsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = !selectedSpecialization || doctor.specialization === selectedSpecialization;
    const matchesLocation = !selectedLocation || doctor.location === selectedLocation;
    
    return matchesSearch && matchesSpecialization && matchesLocation;
  });

  const getSpecializationIcon = (specialization: string) => {
    const spec = specializations.find(s => s.name === specialization);
    return spec ? spec.icon : Stethoscope;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#00796B] to-[#004D40] rounded-3xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-4">Find Doctors</h1>
        <p className="text-white/90 text-lg">Connect with qualified healthcare professionals</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search doctors, specializations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2 border-[#26A69A]/30 focus:border-[#00796B]"
                />
              </div>
            </div>
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="px-3 py-2 border-2 border-[#26A69A]/30 rounded-md focus:border-[#00796B] focus:outline-none"
            >
              <option value="">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec.name} value={spec.name}>{spec.name}</option>
              ))}
            </select>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-3 py-2 border-2 border-[#26A69A]/30 rounded-md focus:border-[#00796B] focus:outline-none"
            >
              <option value="">All Locations</option>
              <option value="Delhi">Delhi</option>
              <option value="Noida">Noida</option>
              <option value="Gurgaon">Gurgaon</option>
              <option value="Chennai">Chennai</option>
              <option value="Hyderabad">Hyderabad</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Specializations Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {specializations.map((spec) => {
          const IconComponent = spec.icon;
          return (
            <Card 
              key={spec.name}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                selectedSpecialization === spec.name ? 'border-[#00796B] bg-[#E0F2F1]' : 'border-[#26A69A]/30'
              }`}
              onClick={() => setSelectedSpecialization(selectedSpecialization === spec.name ? "" : spec.name)}
            >
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-[#009688] rounded-full flex items-center justify-center">
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-sm text-[#263238]">{spec.name}</h3>
                <p className="text-xs text-[#263238]/70">{spec.count} doctors</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Results Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#263238]">
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-[#26A69A]" />
              Loading Doctors...
            </div>
          ) : (
            `${filteredDoctors.length} Doctors Found`
          )}
        </h2>
        <select className="px-3 py-2 border border-gray-300 rounded-md">
          <option>Sort by Rating</option>
          <option>Sort by Experience</option>
          <option>Sort by Fee (Low to High)</option>
          <option>Sort by Fee (High to Low)</option>
        </select>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-20 h-20 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-6 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-8 bg-gray-200 rounded" />
                    <div className="h-8 bg-gray-200 rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredDoctors.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Stethoscope className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Doctors Found</h3>
            <p className="text-gray-500">No registered doctors match your search criteria.</p>
          </div>
        ) : (
          filteredDoctors.map((doctor) => {
          const IconComponent = getSpecializationIcon(doctor.specialization);
          return (
            <Card 
              key={doctor.id}
              className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-[#26A69A]/30"
              onClick={() => setSelectedDoctor(doctor.id)}
            >
              <CardContent className="p-6">
                {/* Doctor Header - LinkedIn Style */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-[#26A69A]/40 shadow-lg">
                    {doctor.image ? (
                      <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#009688] to-[#00796B] flex items-center justify-center">
                        <Stethoscope className="h-10 w-10 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[#263238] text-xl mb-1">{doctor.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <IconComponent className="h-4 w-4 text-[#26A69A]" />
                      <span className="text-[#00796B] font-semibold text-lg">{doctor.specialization}</span>
                    </div>
                    <p className="text-sm text-[#263238]/70 font-medium">{doctor.experience} years experience • {doctor.hospital}</p>
                  </div>
                </div>

                {/* Professional Details */}
                <div className="space-y-3 mb-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#26A69A]" />
                      <span className="text-sm font-medium">{doctor.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-bold">{doctor.rating}</span>
                      <span className="text-xs text-[#263238]/60">({doctor.reviews})</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge 
                      className={`${
                        doctor.availability.includes('Today') 
                          ? 'bg-green-100 text-green-700 border-green-200' 
                          : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                      } font-semibold`}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {doctor.availability}
                    </Badge>
                    <div className="text-right">
                      <p className="text-xs text-[#263238]/60">Consultation Fee</p>
                      <p className="font-bold text-[#00796B] text-lg">₹{doctor.consultationFee}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Professional Style */}
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="border-2 border-[#26A69A] text-[#00796B] hover:bg-[#E0F2F1] font-semibold py-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                  <Button 
                    className="bg-[#009688] hover:bg-[#00796B] text-white font-semibold py-2 shadow-md"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })
        )}
      </div>

      {/* Doctor Profile Modal */}
      <Dialog open={!!selectedDoctor} onOpenChange={() => setSelectedDoctor(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
          {selectedDoctor && (
            <div className="p-6">
              <DoctorProfile doctorId={selectedDoctor} isOwnProfile={false} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}