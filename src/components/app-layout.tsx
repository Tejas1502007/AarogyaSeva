
"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarNav } from "./sidebar-nav";
import { UserNav } from "./user-nav";
import { Button } from "./ui/button";
import { Bell, AlertTriangle, Info, BarChart2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Alert = {
  id: string;
  title: string;
  description: string;
  type: "urgent" | "important" | "info" | "general";
  read: boolean;
  createdAt: { seconds: number };
};

const alertConfig = {
  urgent: { icon: AlertTriangle, color: "text-red-500", bgColor: "bg-red-50" },
  important: { icon: Bell, color: "text-yellow-500", bgColor: "bg-yellow-50" },
  info: { icon: Info, color: "text-blue-500", bgColor: "bg-blue-50" },
  general: { icon: BarChart2, color: "text-green-500", bgColor: "bg-green-50" },
};


export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, userRole } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedAlerts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Alert[];

      // Sort on the client side
      fetchedAlerts.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

      setAlerts(fetchedAlerts);
    });

    return () => unsubscribe();
  }, [user]);

  if (pathname === "/") {
    return <>{children}</>;
  }

  const unreadCount = alerts.filter(alert => !alert.read).length;

  const markAsRead = async (alertId: string) => {
    const alertRef = doc(db, "notifications", alertId);
    await updateDoc(alertRef, { read: true });
  };


  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar className={cn(
          "border-r-0 shadow-lg",
          userRole === 'patient' 
            ? "bg-[#F5F5F5]" 
            : "bg-[#E0F2FE]"
        )}>
          <SidebarContent>
            <SidebarHeader className="p-6 border-b border-white/10">
              <Link href={userRole === 'patient' ? '/patient' : '/doctor'} className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-xl shadow-md",
                  userRole === 'patient'
                    ? "bg-gradient-to-r from-[#00796B] to-[#004D40]"
                    : "bg-gradient-to-r from-[#0284C7] to-[#0E7490]"
                )}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-white"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h1 className={cn(
                  "text-2xl font-black tracking-tight",
                  userRole === 'patient' ? "text-[#263238]" : "text-[#0F172A]"
                )}>
                  Arogya Seva
                </h1>
              </Link>
            </SidebarHeader>
            <SidebarNav />
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
            <header className={cn(
              "sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 backdrop-blur-md sm:px-6",
              userRole === 'patient'
                ? "bg-[#F5F5F5]/90 border-[#26A69A]"
                : "bg-[#F0F9FF]/90 border-[#06B6D4]"
            )}>
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="sm:hidden" />
                  {userRole === 'doctor' && (
                    <Badge variant="outline" className="hidden items-center gap-2 border-green-500 bg-green-50 text-green-700 sm:flex">
                      <CheckCircle className="h-4 w-4" />
                      Doctor (Verified)
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative" id="notifications-trigger">
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                        )}
                        <span className="sr-only">Notifications</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 md:w-96" align="end">
                        <DropdownMenuLabel className="flex items-center justify-between">
                            <span>Notifications</span>
                            {unreadCount > 0 && <Badge variant="secondary">{unreadCount} Unread</Badge>}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="max-h-80 overflow-y-auto">
                        {alerts.length === 0 ? (
                           <DropdownMenuItem disabled>
                             <p className="text-sm text-center text-muted-foreground w-full py-4">No notifications yet.</p>
                           </DropdownMenuItem>
                        ) : alerts.map(alert => {
                            const config = alertConfig[alert.type] || alertConfig.info;
                            const Icon = config.icon;
                            return (
                                <DropdownMenuItem key={alert.id} className={cn("flex items-start gap-3 p-3", !alert.read && config.bgColor)} onClick={() => markAsRead(alert.id)}>
                                    <Icon className={cn("mt-1 h-5 w-5 shrink-0", config.color)} />
                                    <div className="flex flex-col">
                                        <p className="font-semibold">{alert.title}</p>
                                        <p className="text-xs text-muted-foreground">{alert.description}</p>
                                    </div>
                                    {!alert.read && <div className="h-2 w-2 rounded-full bg-primary ml-auto mt-1 shrink-0"></div>}
                                </DropdownMenuItem>
                            );
                        })}
                        </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <UserNav />
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
