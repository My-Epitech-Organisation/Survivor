"use client";

import AdminNavigation from "@/components/AdminNavigation";
import { useState, useEffect } from "react";
import { TbLoader3 } from "react-icons/tb";
import { FaSortDown, FaSortUp, FaSort } from "react-icons/fa";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { Event } from "@/types/event";
import { CalendarIcon } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import AdminEvent from "@/components/AdminEvent";
import AdminEventForm from "@/components/AdminEventForm";
import Footer from "@/components/Footer";

type SortColumn =
  | "id"
  | "name"
  | "dates"
  | "location"
  | "event_type"
  | "target_audience"
  | null;
type SortDirection = "asc" | "desc" | null;

export default function AdminEvents() {
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [eventsList, setEventsList] = useState<Event[] | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [filterType, setFilterType] = useState<string>("");
  const [filterLocation, setFilterLocation] = useState<string>("");
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (eventsList) {
      const uniqueTypes = [
        ...new Set(eventsList.map((event) => event.event_type)),
      ];
      const uniqueLocations = [
        ...new Set(eventsList.map((event) => event.location)),
      ];

      setEventTypes(uniqueTypes);
      setLocations(uniqueLocations);
    }
  }, [eventsList]);

  const fetchEvents = async () => {
    setIsDataLoading(true);
    try {
      const resp = (await api.get<Event[]>({ endpoint: "/events/" })).data;
      setEventsList(resp);
    } catch (error) {
      console.error(error);
      toast("Error", {
        className: "!text-red-500",
        description: (
          <span className="text-red-500">
            An error occurred while fetching events.
          </span>
        ),
      });
    }
    setIsDataLoading(false);
  };

  const handleSort = (column: SortColumn) => {
    let newDirection: SortDirection = "asc";

    // cycle through: null -> asc -> desc -> null
    if (sortColumn === column) {
      if (sortDirection === null) {
        newDirection = "asc";
      } else if (sortDirection === "asc") {
        newDirection = "desc";
      } else {
        newDirection = null;
        setSortColumn(null);
        setSortDirection(null);
        return;
      }
    } else {
      newDirection = "asc";
    }

    setSortColumn(column);
    setSortDirection(newDirection);
  };

  const normalizeText = (text: string): string => {
    if (typeof text !== "string") return "";

    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[''´`]/g, "")
      .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "");
  };

  const getSortedEventsList = () => {
    if (!eventsList) return null;

    let filteredList = [...eventsList];
    if (filterType) {
      filteredList = filteredList.filter(
        (event) => event.event_type === filterType
      );
    }
    if (filterLocation) {
      filteredList = filteredList.filter(
        (event) => event.location === filterLocation
      );
    }

    if (sortColumn && sortDirection) {
      filteredList.sort((a, b) => {
        let valueA, valueB;

        switch (sortColumn) {
          case "id":
            valueA = a.id;
            valueB = b.id;
            break;
          case "name":
            valueA = normalizeText(a.name);
            valueB = normalizeText(b.name);
            break;
          case "dates":
            valueA = normalizeText(a.dates);
            valueB = normalizeText(b.dates);
            break;
          case "location":
            valueA = normalizeText(a.location);
            valueB = normalizeText(b.location);
            break;
          case "event_type":
            valueA = normalizeText(a.event_type);
            valueB = normalizeText(b.event_type);
            break;
          case "target_audience":
            valueA = normalizeText(a.target_audience);
            valueB = normalizeText(b.target_audience);
            break;
          default:
            return 0;
        }

        if (sortDirection === "asc") {
          return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        } else {
          return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
        }
      });
    }

    return filteredList;
  };

  const handleEditEventSubmit = (
    id: number,
    data: Event,
    btnAction: HTMLButtonElement | null
  ) => {
    const eventData = {
      ...data,
      image_url: data.pictureURL || undefined,
    };
    api
      .put(`/events/${id}/`, eventData)
      .then((response) => {
        console.debug("Event edited successfully:", response.data);
        if (btnAction) {
          btnAction.click();
        }
        fetchEvents();
        toast("Event updated", {
          description: "The event has been updated successfully.",
        });
      })
      .catch((error) => {
        toast("Edit error", {
          className: "!text-red-500",
          description: (
            <span className="text-red-500">
              An error occurred while editing event: {String(error)}
            </span>
          ),
        });
        console.error("Error editing event:", error);
      });
  };

  const handleDeleteEventSubmit = (
    eventId: number,
    btnAction: HTMLButtonElement | null
  ) => {
    api
      .delete(`/events/${eventId}/`)
      .then((response) => {
        console.debug("Event deleted successfully:", response.data);
        if (btnAction) {
          btnAction.click();
        }
        fetchEvents();
        toast("Event deleted", {
          description: "The event has been deleted successfully.",
        });
      })
      .catch((error) => {
        toast("Delete error", {
          className: "!text-red-500",
          description: (
            <span className="text-red-500">
              An error occurred while deleting event: {String(error)}
            </span>
          ),
        });
        console.error("Error deleting event:", error);
      });
  };

  const handleCreateEvent = (data: Event) => {
    const eventData = {
      name: data.name,
      dates: data.dates,
      location: data.location,
      description: data.description,
      event_type: data.event_type,
      target_audience: data.target_audience,
      image: data.pictureURL,
    };

    console.debug("Sending event data to backend:", eventData);
    api
      .post("/events/", eventData)
      .then((response) => {
        console.debug("Event created successfully:", response.data);
        fetchEvents();
        toast("Event created", {
          description: "The event has been created successfully.",
        });
      })
      .catch((error) => {
        toast("Create error", {
          className: "!text-red-500",
          description: (
            <span className="text-red-500">
              An error occurred while creating event: {String(error)}
            </span>
          ),
        });
        console.error("Error creating event:", error);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-app-gradient-from to-app-gradient-to">
      <AdminNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isDataLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <TbLoader3 className="size-12 animate-spin text-blue-600 mb-4" />
            <p className="text-app-text-secondary text-lg">Loading events...</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-app-text-primary mb-6">
                Events Management
              </h1>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="bg-blue-600 text-white font-medium px-4 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer">
                    Add Event
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px] md:max-w-[60dvw] max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-heading flex items-center gap-2">
                      Create New Event
                    </DialogTitle>
                  </DialogHeader>
                  <AdminEventForm
                    onSubmit={(data) => handleCreateEvent(data)}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg p-4 mb-6 flex flex-wrap gap-4">
              <div className="flex flex-col w-64">
                <label className="text-sm font-medium mb-1 text-gray-700">
                  Event Type
                </label>
                <select
                  className="border border-gray-300 rounded-md p-2"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">All Types</option>
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col w-64">
                <label className="text-sm font-medium mb-1 text-gray-700">
                  Location
                </label>
                <select
                  className="border border-gray-300 rounded-md p-2"
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                >
                  <option value="">All Locations</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="text-app-text-secondary hover:text-app-text-primary px-4 py-2 rounded-md transition-colors self-end cursor-pointer"
                onClick={() => {
                  setFilterType("");
                  setFilterLocation("");
                }}
              >
                Clear All Filters
              </button>
            </div>

            {/* Events content */}
            <div className="max-w-7xl mx-auto bg-white rounded-2xl p-5">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="text-center cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleSort("id")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        ID
                        {sortColumn === "id" &&
                          (sortDirection === "asc" ? (
                            <FaSortUp />
                          ) : sortDirection === "desc" ? (
                            <FaSortDown />
                          ) : null)}
                        {sortColumn !== "id" && (
                          <FaSort className="text-gray-300" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-center border-l cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Name
                        {sortColumn === "name" &&
                          (sortDirection === "asc" ? (
                            <FaSortUp />
                          ) : sortDirection === "desc" ? (
                            <FaSortDown />
                          ) : null)}
                        {sortColumn !== "name" && (
                          <FaSort className="text-gray-300" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-center border-l cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleSort("dates")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Date
                        {sortColumn === "dates" &&
                          (sortDirection === "asc" ? (
                            <FaSortUp />
                          ) : sortDirection === "desc" ? (
                            <FaSortDown />
                          ) : null)}
                        {sortColumn !== "dates" && (
                          <FaSort className="text-gray-300" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-center border-l cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleSort("location")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Location
                        {sortColumn === "location" &&
                          (sortDirection === "asc" ? (
                            <FaSortUp />
                          ) : sortDirection === "desc" ? (
                            <FaSortDown />
                          ) : null)}
                        {sortColumn !== "location" && (
                          <FaSort className="text-gray-300" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-center border-l cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleSort("event_type")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Type
                        {sortColumn === "event_type" &&
                          (sortDirection === "asc" ? (
                            <FaSortUp />
                          ) : sortDirection === "desc" ? (
                            <FaSortDown />
                          ) : null)}
                        {sortColumn !== "event_type" && (
                          <FaSort className="text-gray-300" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-center border-l cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleSort("target_audience")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Audience
                        {sortColumn === "target_audience" &&
                          (sortDirection === "asc" ? (
                            <FaSortUp />
                          ) : sortDirection === "desc" ? (
                            <FaSortDown />
                          ) : null)}
                        {sortColumn !== "target_audience" && (
                          <FaSort className="text-gray-300" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-center border-l">
                      Settings
                    </TableHead>
                    <TableHead className="text-center border-l">
                      Delete
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getSortedEventsList()?.map((event) => {
                    return (
                      <AdminEvent
                        key={event.id}
                        event={event}
                        editCB={handleEditEventSubmit}
                        deleteCB={handleDeleteEventSubmit}
                      />
                    );
                  })}
                </TableBody>
              </Table>
              {(!eventsList || eventsList.length === 0) && (
                <div className="flex items-center justify-center py-12 gap-3">
                  <CalendarIcon className="w-8 h-8 text-gray-400" />
                  <span className="text-gray-400 text-lg font-medium">
                    No events found
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
