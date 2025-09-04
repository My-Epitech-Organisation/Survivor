"use client"

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Calendar from '@/components/Calendar';
import { Event } from '@/types/event';
import { authenticatedFetch } from '@/lib/api';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';


export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await authenticatedFetch('/events/');
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
    <div className="min-h-screen bg-app-surface-hover">
      <Navigation />

      <main className="w-full mx-auto py-3 px-2 sm:py-6 sm:px-4 lg:px-8 max-w-screen-xl">
        <div className="py-3 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-app-text-primary mb-4 sm:mb-6">Events Calendar</h1>
          <div className="mb-4 sm:mb-6">
            <p className="text-sm sm:text-base text-app-text-secondary">
              Discover upcoming events, conferences, workshops, and networking opportunities in the tech industry.
            </p>
          </div>
          <Calendar events={events} onEventClick={handleEventClick} />
        </div>
      </main>
      <Dialog open={selectedEvent !== null} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-app-text-primary mb-2">
              {selectedEvent?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-app-text-secondary"><strong>Date:</strong> {selectedEvent?.dates}</p>
            <p className="text-sm text-app-text-secondary"><strong>Location:</strong> {selectedEvent?.location}</p>
            <p className="text-sm text-app-text-secondary"><strong>Type:</strong> {selectedEvent?.event_type}</p>
            <p className="text-sm text-app-text-secondary"><strong>Audience:</strong> {selectedEvent?.target_audience}</p>
            <div className="mt-2">
              <p className="text-sm text-app-text-secondary">{selectedEvent?.description}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
