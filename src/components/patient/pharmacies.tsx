
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Navigation } from "lucide-react";
import { Button } from "../ui/button";

const mockPharmacies = [
    { name: "Apollo Pharmacy – Datta Mandir Road (Cidco)", address: "Datta Mandir Road, Nashik", image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=200&fit=crop&crop=center", placeLink: "https://www.google.com/maps/search/?api=1&query=Apollo+Pharmacy+Datta+Mandir+Road+Nashik", directionsLink: "https://www.google.com/maps/dir/?api=1&destination=Apollo+Pharmacy+Datta+Mandir+Road+Nashik" },
    { name: "Apollo Pharmacy – Ashoka Marg / Dwarka", address: "Ashoka Marg, Nashik", image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=200&fit=crop&crop=center", placeLink: "https://www.google.com/maps/search/?api=1&query=Apollo+Pharmacy+Ashoka+Marg+Nashik", directionsLink: "https://www.google.com/maps/dir/?api=1&destination=Apollo+Pharmacy+Ashoka+Marg+Nashik" },
    { name: "Apollo Pharmacy – College Road", address: "College Road, Nashik", image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400&h=200&fit=crop&crop=center", placeLink: "https://www.google.com/maps/search/?api=1&query=Apollo+Pharmacy+College+Road+Nashik", directionsLink: "https://www.google.com/maps/dir/?api=1&destination=Apollo+Pharmacy+College+Road+Nashik" },
    { name: "Wellness Forever – Ashoka Marg", address: "Ashoka Marg, Nashik", image: "https://images.unsplash.com/photo-1585435557343-3b092031d4c1?w=400&h=200&fit=crop&crop=center", placeLink: "https://www.google.com/maps/search/?api=1&query=Wellness+Forever+Ashoka+Marg+Nashik", directionsLink: "https://www.google.com/maps/dir/?api=1&destination=Wellness+Forever+Ashoka+Marg+Nashik" },
    { name: "MedPlus – College Road", address: "College Road, Nashik", image: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=400&h=200&fit=crop&crop=center", placeLink: "https://www.google.com/maps/search/?api=1&query=MedPlus+College+Road+Nashik", directionsLink: "https://www.google.com/maps/dir/?api=1&destination=MedPlus+College+Road+Nashik" },
    { name: "MedPlus – Panchavati", address: "Panchavati, Nashik", image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400&h=200&fit=crop&crop=center", placeLink: "https://www.google.com/maps/search/?api=1&query=MedPlus+Panchavati+Nashik", directionsLink: "https://www.google.com/maps/dir/?api=1&destination=MedPlus+Panchavati+Nashik" },
    { name: "Tata 1mg Pharmacy Store", address: "Dwarka/Ashoka Marg, Nashik", image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=200&fit=crop&crop=center", placeLink: "https://www.google.com/maps/search/?api=1&query=Tata+1mg+Store+Nashik", directionsLink: "https://www.google.com/maps/dir/?api=1&destination=Tata+1mg+Store+Nashik" },
    { name: "Noble Medical & General Stores", address: "College Road, Nashik", image: "https://images.unsplash.com/photo-1585435557343-3b092031d4c1?w=400&h=200&fit=crop&crop=center", placeLink: "https://www.google.com/maps/search/?api=1&query=Noble+Medical+College+Road+Nashik", directionsLink: "https://www.google.com/maps/dir/?api=1&destination=Noble+Medical+College+Road+Nashik" },
    { name: "Shree Ganesh Medical Store", address: "Dwarka, Nashik", image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=200&fit=crop&crop=center", placeLink: "https://www.google.com/maps/search/?api=1&query=Shree+Ganesh+Medical+Dwarka+Nashik", directionsLink: "https://www.google.com/maps/dir/?api=1&destination=Shree+Ganesh+Medical+Dwarka+Nashik" },
    { name: "Om Sai Medical", address: "Gangapur Road, Nashik", image: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=400&h=200&fit=crop&crop=center", placeLink: "https://www.google.com/maps/search/?api=1&query=Om+Sai+Medical+Gangapur+Road+Nashik", directionsLink: "https://www.google.com/maps/dir/?api=1&destination=Om+Sai+Medical+Gangapur+Road+Nashik" },
    { name: "Wellcare Medical", address: "Gangapur Road, Nashik", image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400&h=200&fit=crop&crop=center", placeLink: "https://www.google.com/maps/search/?api=1&query=Wellcare+Medical+Gangapur+Road+Nashik", directionsLink: "https://www.google.com/maps/dir/?api=1&destination=Wellcare+Medical+Gangapur+Road+Nashik" },
    { name: "Shree Siddhivinayak Medical", address: "Panchavati, Nashik", image: "https://images.unsplash.com/photo-1585435557343-3b092031d4c1?w=400&h=200&fit=crop&crop=center", placeLink: "https://www.google.com/maps/search/?api=1&query=Siddhivinayak+Medical+Panchavati+Nashik", directionsLink: "https://www.google.com/maps/dir/?api=1&destination=Siddhivinayak+Medical+Panchavati+Nashik" }
];

export default function Pharmacies() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredPharmacies = mockPharmacies.filter(pharmacy =>
        pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pharmacy.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <header className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">Find Pharmacies</h1>
                <p className="text-muted-foreground">Search for pharmacies and get directions.</p>
            </header>

             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Search by pharmacy name or address..." 
                    className="pl-10" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredPharmacies.map((pharmacy, index) => (
                    <Card key={index} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300">
                        {/* Pharmacy Image */}
                        <div className="relative h-48 overflow-hidden">
                            <img 
                                src={pharmacy.image} 
                                alt={pharmacy.name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"

                            />
                            <div className="absolute top-4 right-4">
                                <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                                    💊 Pharmacy
                                </div>
                            </div>
                        </div>
                        
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg leading-tight">{pharmacy.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2 pt-1">
                                <MapPin className="h-4 w-4 text-[#26A69A]" /> 
                                <span className="text-sm">{pharmacy.address}</span>
                            </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="flex-grow flex items-end pt-0">
                            <div className="flex gap-2 w-full">
                                <a href={pharmacy.placeLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                                    <Button variant="outline" className="w-full border-[#26A69A] text-[#00796B] hover:bg-[#E0F2F1]">
                                        <MapPin className="mr-2 h-4 w-4" /> View on Map
                                    </Button>
                                </a>
                                <a href={pharmacy.directionsLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                                    <Button className="w-full bg-[#009688] hover:bg-[#00796B] text-white">
                                        <Navigation className="mr-2 h-4 w-4" /> Directions
                                    </Button>
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {filteredPharmacies.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground col-span-full">
                        <p>No pharmacies found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
}