"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Calendar, MapPin, X } from "lucide-react";
import { HealthDataItem, fetchHealthData } from "@/lib/health-data";

interface HealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'insurance' | 'subsidies' | 'camps' | 'events' | 'yoga' | 'nutrition';
  title: string;
}

export function HealthModal({ isOpen, onClose, type, title }: HealthModalProps) {
  const [data, setData] = useState<HealthDataItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchHealthData(type).then((result) => {
        setData(result);
        setLoading(false);
      });
    }
  }, [isOpen, type]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#263238] flex items-center justify-between">
            {title}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 border border-[#26A69A]/20 rounded-xl">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : data.length > 0 ? (
            data.map((item) => (
              <div key={item.id} className="overflow-hidden bg-white border border-[#26A69A]/20 rounded-xl hover:shadow-md transition-all duration-200">
                {item.image && (
                  <div className="h-40 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-[#263238] mb-2">{item.title}</h3>
                  <p className="text-[#263238]/80 mb-3">{item.description}</p>
                
                  <div className="flex flex-wrap gap-4 text-sm text-[#00796B]">
                    {item.date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {item.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{item.location}</span>
                      </div>
                    )}
                    {item.source && (
                      <div className="text-[#26A69A] font-medium">
                        Source: {item.source}
                      </div>
                    )}
                  </div>
                  
                  {item.url && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3 border-[#26A69A] text-[#00796B] hover:bg-[#26A69A]/10"
                      onClick={() => window.open(item.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Learn More
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-[#263238]/60">
              <p>No data available at the moment.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}