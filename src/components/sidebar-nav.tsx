
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  FileText,
  Users,
  Pill,
  ShieldCheck,
  QrCode,
  Calendar,
  Search,
  Clock,
  ScanLine,
  Activity,
  HeartPulse,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  matchExact?: boolean;
};

const navLinks: { [key: string]: NavItem[] } = {
  patient: [
    { href: "/patient/dashboard", label: "Dashboard", icon: <LayoutDashboard />, matchExact: true },
    { href: "/patient/records", label: "My Records", icon: <FileText />, matchExact: true },
    { href: "/patient/scan-report", label: "Scan Report", icon: <ScanLine />, matchExact: true },
    { href: "/patient/disease-predictor", label: "Disease Predictor", icon: <Activity />, matchExact: true },
    { href: "/patient/find-doctors", label: "Find Doctors", icon: <Search />, matchExact: true },
    { href: "/patient/appointments", label: "Appointments", icon: <Calendar />, matchExact: true },
    { href: "/patient/pharmacies", label: "Pharmacies", icon: <HeartPulse />, matchExact: true },
  ],
  doctor: [
    { href: "/doctor/dashboard", label: "Dashboard", icon: <LayoutDashboard />, matchExact: false },
    { href: "/doctor/scan", label: "Scan QR / Enter Token", icon: <QrCode />, matchExact: true },
    { href: "/doctor/my-patients", label: "My Patients", icon: <Users />, matchExact: true },
    { href: "/doctor/records", label: "Records", icon: <FileText />, matchExact: true },
    { href: "/doctor/appointments", label: "Schedule & Availability", icon: <Calendar />, matchExact: true },
  ],
  pharmacist: [
    { href: "/pharmacist", label: "Prescriptions", icon: <Pill /> },
  ],
  admin: [
    { href: "/admin", label: "User Management", icon: <ShieldCheck /> },
  ],
};


export function SidebarNav() {
  const pathname = usePathname();
  const { userRole } = useAuth();
  
  const currentNavs = userRole ? navLinks[userRole] : [];

  return (
    <SidebarMenu className="px-3 py-4">
      <div className={cn(
        "px-3 mb-4 text-xs font-bold uppercase tracking-wider",
        userRole === 'patient' ? "text-[#00796B]" : "text-[#0284C7]"
      )}>
        Navigation
      </div>
      {currentNavs.map((item) => {
        const isActive = item.matchExact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <SidebarMenuItem key={item.href} className="mb-1">
            <SidebarMenuButton
              asChild
              className={cn(
                "group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02]",
                isActive
                  ? userRole === 'patient'
                    ? "bg-[#009688] text-white shadow-lg"
                    : "bg-[#0284C7] text-white shadow-lg"
                  : userRole === 'patient'
                    ? "hover:bg-white text-[#263238] hover:text-[#00796B]"
                    : "hover:bg-[#F0F9FF] text-[#0F172A] hover:text-[#0284C7]"
              )}
            >
              <Link href={item.href} className="flex items-center gap-3 px-3 py-3 font-semibold">
                <div className={cn(
                  "transition-transform duration-300 group-hover:scale-110",
                  isActive ? "text-white" : ""
                )}>
                  {item.icon}
                </div>
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <div className="absolute inset-0 bg-white/10 rounded-xl" />
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
