"use client"

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Calendar from '@/components/Calendar';
import { Event } from '@/types/event';
import { authenticatedFetch } from '@/lib/api';
import { useEffect, useState } from 'react';

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);

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
          <Calendar events={events} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
