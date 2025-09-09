"use client";

import React, { useState, useMemo, useEffect } from "react";
import { CalendarEvent, CalendarProps } from "@/types/event";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight } from "lucide-react";

const Calendar: React.FC<CalendarProps> = ({ events, onEventClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    const parsedEvents = events
      .map((event) => ({
        ...event,
        parsedDate: new Date(event.dates),
      }))
      .filter((event) => !isNaN(event.parsedDate.getTime()));

    return parsedEvents;
  }, [events]);

  const { daysInMonth, firstDayOfMonth, monthName, year } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    return {
      daysInMonth: lastDay.getDate(),
      firstDayOfMonth: firstDay.getDay(),
      monthName: firstDay.toLocaleDateString("en-US", { month: "long" }),
      year: year,
    };
  }, [currentDate]);

  const getEventsForDay = (day: number) => {
    const targetDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const eventsForDay = calendarEvents.filter((event) => {
      const eventDate = event.parsedDate;
      return (
        eventDate.getDate() === targetDate.getDate() &&
        eventDate.getMonth() === targetDate.getMonth() &&
        eventDate.getFullYear() === targetDate.getFullYear()
      );
    });

    return eventsForDay;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const calendarDays = useMemo(() => {
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  }, [firstDayOfMonth, daysInMonth]);

  const getEventTypeColor = (eventType: string) => {
    const colors: Record<string, string> = {
      conference: "bg-app-blue-primary text-white",
      workshop: "bg-app-green-primary text-white",
      "pitch session": "bg-app-orange-primary text-white",
      default: "bg-app-text-muted text-white",
    };
    return colors[eventType.toLowerCase()] || colors.default;
  };

  const today = new Date();
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="w-full mx-auto bg-app-surface rounded-lg shadow-lg p-6 sm:p-6">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 lg:items-start">
        <div className="flex-shrink-0 w-full lg:w-[50%] xl:w-[60%]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-app-text-primary">
              {monthName} {year}
            </h2>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={goToPreviousMonth}
                className="flex-1 sm:flex-none px-3 py-1 bg-jeb-seven text-white rounded hover:bg-jeb-eight transition-colors text-sm sm:text-base cursor-pointer"
              >
                <ArrowLeft />
              </button>
              <button
                onClick={goToToday}
                className="flex-1 sm:flex-none px-3 py-1 bg-jeb-primary text-white rounded hover:bg-jeb-hover transition-colors font-bold text-sm sm:text-base cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={goToNextMonth}
                className="flex-1 sm:flex-none px-3 py-1 bg-jeb-seven text-white rounded hover:bg-jeb-eight transition-colors text-sm sm:text-base cursor-pointer"
              >
                <ArrowRight />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="p-1 sm:p-2 text-center font-medium text-app-text-secondary text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.charAt(0)}</span>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="p-1 sm:p-2 h-16 sm:h-20 lg:h-24"
                  ></div>
                );
              }

              const dayEvents = getEventsForDay(day);
              const isTodayDay = isToday(day);

              return (
                <div
                  key={`day-${index}`}
                  className={`p-1 sm:p-2 h-16 sm:h-20 lg:h-24 border border-app-border-light rounded transition-colors hover:bg-app-surface-hover ${
                    isTodayDay
                      ? "bg-app-blue-light border-app-blue-primary"
                      : "bg-app-surface"
                  }`}
                >
                  <div
                    className={`font-medium text-xs sm:text-sm mb-1 ${
                      isTodayDay
                        ? "text-app-blue-primary"
                        : "text-app-text-primary"
                    }`}
                  >
                    {day}
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    {dayEvents.slice(0, isMobile ? 1 : 2).map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs p-1 rounded truncate ${getEventTypeColor(
                          event.event_type
                        )} hover:brightness-90 cursor-pointer transition-all`}
                        title={`${event.name} - ${event.event_type}`}
                        onClick={() => onEventClick(event)}
                      >
                        <span className="hidden sm:inline">
                          {event.name.length > 10
                            ? event.name.substring(0, 10) + "..."
                            : event.name}
                        </span>
                        <span className="sm:hidden">
                          {event.name.length > 6
                            ? event.name.substring(0, 6) + "..."
                            : event.name}
                        </span>
                      </div>
                    ))}
                    {dayEvents.length > (isMobile ? 1 : 2) && (
                      <div className="text-xs text-app-text-muted">
                        +{dayEvents.length - (isMobile ? 1 : 2)} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Events List for Selected Month */}
        <div className="w-full lg:flex-1 lg:min-w-[30%] lg:max-w-[50%] xl:max-w-[40%] max-h-150 flex flex-col">
          <h3 className="font-heading text-base sm:text-lg font-semibold text-app-text-primary mb-4">
            Events in {monthName} {year}
          </h3>
          <div className="space-y-3 flex-1 overflow-y-auto">
            {calendarEvents
              .filter(
                (event) =>
                  event.parsedDate.getMonth() === currentDate.getMonth() &&
                  event.parsedDate.getFullYear() === currentDate.getFullYear()
              )
              .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime())
              .map((event) => (
                <Card
                  key={event.id}
                  className="p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onEventClick(event)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h4 className="font-medium text-app-text-primary text-sm sm:text-base">
                          {event.name}
                        </h4>
                        <Badge
                          className={`${getEventTypeColor(
                            event.event_type
                          )} text-xs self-start sm:self-auto`}
                        >
                          {event.event_type}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-app-text-secondary mb-2">
                        {event.description}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs text-app-text-muted">
                        <span className="flex items-center gap-1">
                          📅 {event.parsedDate.toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          📍 {event.location}
                        </span>
                        <span className="flex items-center gap-1">
                          👥 {event.target_audience}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            {calendarEvents.filter(
              (event) =>
                event.parsedDate.getMonth() === currentDate.getMonth() &&
                event.parsedDate.getFullYear() === currentDate.getFullYear()
            ).length === 0 && (
              <div className="flex items-center justify-center h-32 lg:h-64">
                <p className="text-app-text-muted text-center text-sm">
                  No events scheduled for this month.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
