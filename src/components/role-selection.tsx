"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Stethoscope, Heart, Shield, Activity } from "lucide-react";

interface RoleSelectionProps {
  onRoleSelect: (role: "patient" | "doctor") => void;
}

export function RoleSelection({ onRoleSelect }: RoleSelectionProps) {
  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-r from-teal-600 to-teal-700 rounded-full shadow-lg">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-5xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent">AROGYA</span>
            <span className="text-gray-800 ml-2">SEVA</span>
          </h1>
        </div>
        <p className="text-2xl font-medium text-gray-700 max-w-3xl mx-auto leading-relaxed">
          Advanced Healthcare Management System
        </p>
        <p className="text-lg text-gray-500 mt-4 max-w-2xl mx-auto">
          Secure • Reliable • Professional Healthcare Solutions
        </p>
      </div>

      {/* Role Cards */}
      <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
        {/* Patient Card */}
        <Card 
          className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] border-2 hover:border-[#26A69A] bg-white backdrop-blur-md min-h-[400px] flex flex-col"
          onClick={() => onRoleSelect("patient")}
        >
          <CardHeader className="text-center pb-6 flex-shrink-0">
            <div className="mx-auto mb-6 p-5 bg-gradient-to-br from-[#00796B] to-[#004D40] rounded-2xl w-24 h-24 flex items-center justify-center group-hover:from-[#004D40] group-hover:to-[#00796B] transition-all duration-500 shadow-lg">
              <User className="h-12 w-12 text-white" />
            </div>
            <CardTitle className="text-3xl font-black text-[#263238] group-hover:text-[#00796B] transition-colors mb-3">
              Patient Portal
            </CardTitle>
            <CardDescription className="text-lg font-semibold text-[#263238] leading-relaxed">
              Comprehensive health record management and medical care coordination
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 flex-grow flex flex-col justify-between">
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 text-[#263238] font-semibold">
                <Shield className="h-6 w-6 text-[#26A69A] flex-shrink-0" />
                <span>HIPAA-Compliant Record Storage</span>
              </div>
              <div className="flex items-center gap-4 text-[#263238] font-semibold">
                <Heart className="h-6 w-6 text-[#26A69A] flex-shrink-0" />
                <span>Instant Appointment Booking</span>
              </div>
              <div className="flex items-center gap-4 text-[#263238] font-semibold">
                <Activity className="h-6 w-6 text-[#26A69A] flex-shrink-0" />
                <span>Real-time Health Monitoring</span>
              </div>
            </div>
            <Button 
              className="w-full bg-[#009688] hover:bg-[#00796B] text-white font-bold py-4 text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              size="lg"
            >
              Continue as Patient
            </Button>
          </CardContent>
        </Card>

        {/* Doctor Card */}
        <Card 
          className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] border-2 hover:border-[#06B6D4] bg-[#E0F2FE] backdrop-blur-md min-h-[400px] flex flex-col"
          onClick={() => onRoleSelect("doctor")}
        >
          <CardHeader className="text-center pb-6 flex-shrink-0">
            <div className="mx-auto mb-6 p-5 bg-gradient-to-br from-[#0284C7] to-[#0E7490] rounded-2xl w-24 h-24 flex items-center justify-center group-hover:from-[#0E7490] group-hover:to-[#0284C7] transition-all duration-500 shadow-lg">
              <Stethoscope className="h-12 w-12 text-white" />
            </div>
            <CardTitle className="text-3xl font-black text-[#0F172A] group-hover:text-[#0284C7] transition-colors mb-3">
              Doctor Portal
            </CardTitle>
            <CardDescription className="text-lg font-semibold text-[#0F172A] leading-relaxed">
              Comprehensive health record management and medical care coordination
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 flex-grow flex flex-col justify-between">
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 text-[#0F172A] font-semibold">
                <Stethoscope className="h-6 w-6 text-[#06B6D4] flex-shrink-0" />
                <span>HIPAA-Compliant Record Storage</span>
              </div>
              <div className="flex items-center gap-4 text-[#0F172A] font-semibold">
                <Shield className="h-6 w-6 text-[#06B6D4] flex-shrink-0" />
                <span>Instant Appointment Booking</span>
              </div>
              <div className="flex items-center gap-4 text-[#0F172A] font-semibold">
                <Activity className="h-6 w-6 text-[#06B6D4] flex-shrink-0" />
                <span>Real-time Health Monitoring</span>
              </div>
            </div>
            <Button 
              className="w-full bg-[#0284C7] hover:bg-[#0E7490] text-white font-bold py-4 text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              size="lg"
            >
              Continue as Doctor
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}