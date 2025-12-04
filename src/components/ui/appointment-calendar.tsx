"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isTomorrow, addDays, isWithinInterval } from "date-fns";

interface Appointment {
  id: string;
  appointmentTime: { seconds: number; nanoseconds: number };
  status: "Confirmed" | "Completed" | "Cancelled" | "Pending";
  doctorName?: string;
  patientName?: string;
}

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
}

export function AppointmentCalendar({ appointments, onDateSelect, selectedDate }: AppointmentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => 
      apt.appointmentTime && isSameDay(new Date(apt.appointmentTime.seconds * 1000), date)
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed": return "bg-green-500";
      case "Pending": return "bg-yellow-500";
      case "Completed": return "bg-blue-500";
      case "Cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getDateHighlight = (date: Date) => {
    if (isToday(date)) return "bg-teal-100 border-teal-500 text-teal-800";
    if (isTomorrow(date)) return "bg-blue-100 border-blue-500 text-blue-800";
    
    const nextWeek = addDays(new Date(), 7);
    if (isWithinInterval(date, { start: new Date(), end: nextWeek })) {
      return "bg-purple-50 border-purple-300 text-purple-700";
    }
    
    return "";
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {format(currentMonth, 'MMMM yyyy')}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-teal-500 rounded"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Tomorrow</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span>This Week</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map(date => {
            const dayAppointments = getAppointmentsForDate(date);
            const highlightClass = getDateHighlight(date);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            
            return (
              <div
                key={date.toISOString()}
                className={`
                  relative p-2 min-h-[60px] border rounded-lg cursor-pointer transition-all
                  hover:bg-gray-50 hover:shadow-sm
                  ${highlightClass}
                  ${isSelected ? 'ring-2 ring-blue-500' : ''}
                `}
                onClick={() => onDateSelect?.(date)}
              >
                <div className="text-sm font-medium mb-1">
                  {format(date, 'd')}
                </div>
                
                {/* Appointment badges */}
                <div className="space-y-1">
                  {dayAppointments.slice(0, 2).map((apt, index) => (
                    <div
                      key={apt.id}
                      className={`
                        w-full h-1.5 rounded-full ${getStatusColor(apt.status)}
                      `}
                      title={`${apt.status} - ${apt.doctorName || apt.patientName || 'Appointment'}`}
                    />
                  ))}
                  
                  {dayAppointments.length > 2 && (
                    <div className="text-xs text-center text-muted-foreground">
                      +{dayAppointments.length - 2} more
                    </div>
                  )}
                </div>
                
                {/* Appointment count badge */}
                {dayAppointments.length > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                  >
                    {dayAppointments.length}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Status Legend */}
        <div className="mt-6 pt-4 border-t">
          <div className="text-sm font-medium mb-2">Appointment Status:</div>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Cancelled</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}