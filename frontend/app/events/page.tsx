"use client";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Calendar from "@/components/Calendar";
import { Event } from "@/types/event";
import { authenticatedFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getBackendUrl } from "@/lib/config";

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await authenticatedFetch("/events/");
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    };
    fetchEvents();
  }, []);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-app-gradient-from to-app-gradient-to">
      <Navigation />

      <main className="w-full mx-auto py-3 px-2 sm:py-6 sm:px-4 lg:px-8 max-w-screen-xl">
        <div className="py-3 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-app-text-primary mb-4 sm:mb-6">
            Events Calendar
          </h1>
          <div className="mb-4 sm:mb-6">
            <p className="text-sm sm:text-base text-app-text-secondary">
              Discover upcoming events, conferences, workshops, and networking
              opportunities in the tech industry.
            </p>
          </div>
          <Calendar events={events} onEventClick={handleEventClick} />
        </div>
      </main>
      <Dialog
        open={selectedEvent !== null}
        onOpenChange={() => setSelectedEvent(null)}
      >
        <DialogContent className="max-w-[60vw] w-full sm:max-w-[50vw] md:max-w-[40vw] lg:max-w-[40vw] xl:max-w-[40vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold text-app-text-primary mb-2 pr-8">
              {selectedEvent?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 lg:gap-6">
            {selectedEvent?.pictureURL && (
              <div className="lg:col-span-2 order-2 lg:order-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getBackendUrl() + selectedEvent.pictureURL}
                  alt={selectedEvent.name}
                  className="w-full h-auto rounded-lg object-cover "
                />
              </div>
            )}
            <div className="order-1 lg:order-2 space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2 sm:gap-3">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-app-text-primary">
                    Date
                  </p>
                  <p className="text-xs sm:text-sm text-app-text-secondary">
                    {selectedEvent?.dates}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-app-text-primary">
                    Location
                  </p>
                  <p className="text-xs sm:text-sm text-app-text-secondary">
                    {selectedEvent?.location}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-app-text-primary">
                    Type
                  </p>
                  <p className="text-xs sm:text-sm text-app-text-secondary">
                    {selectedEvent?.event_type}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-app-text-primary">
                    Audience
                  </p>
                  <p className="text-xs sm:text-sm text-app-text-secondary">
                    {selectedEvent?.target_audience}
                  </p>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-gray-200">
                <p className="text-xs sm:text-sm font-medium text-app-text-primary">
                  Description
                </p>
                <p className="text-xs sm:text-sm text-app-text-secondary leading-relaxed">
                  {selectedEvent?.description}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
