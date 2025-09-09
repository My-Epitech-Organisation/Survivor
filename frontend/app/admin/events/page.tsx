"use client"

import AdminNavigation from "@/components/AdminNavigation";
import { useState, useEffect } from "react";
import { TbLoader3 } from "react-icons/tb";
import { FaSortDown, FaSortUp, FaSort } from "react-icons/fa";
import { FaTrashAlt } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Event } from "@/types/event";
import { CalendarIcon } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogHeader, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type SortColumn = 'id' | 'name' | 'dates' | 'location' | 'event_type' | 'target_audience' | null;
type SortDirection = 'asc' | 'desc' | null;

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
      const uniqueTypes = [...new Set(eventsList.map(event => event.event_type))];
      const uniqueLocations = [...new Set(eventsList.map(event => event.location))];

      setEventTypes(uniqueTypes);
      setLocations(uniqueLocations);
    }
  }, [eventsList]);

  const fetchEvents = async () => {
    setIsDataLoading(true);
    try {
      const resp = (await api.get<Event[]>({endpoint: "/events/"})).data
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
    let newDirection: SortDirection = 'asc';

    // cycle through: null -> asc -> desc -> null
    if (sortColumn === column) {
      if (sortDirection === null) {
        newDirection = 'asc';
      } else if (sortDirection === 'asc') {
        newDirection = 'desc';
      } else {
        newDirection = null;
        setSortColumn(null);
        setSortDirection(null);
        return;
      }
    } else {
      newDirection = 'asc';
    }

    setSortColumn(column);
    setSortDirection(newDirection);
  };

  const normalizeText = (text: string): string => {
    if (typeof text !== 'string') return '';

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
      filteredList = filteredList.filter(event => event.event_type === filterType);
    }
    if (filterLocation) {
      filteredList = filteredList.filter(event => event.location === filterLocation);
    }

    if (sortColumn && sortDirection) {
      filteredList.sort((a, b) => {
        let valueA, valueB;

        switch (sortColumn) {
          case 'id':
            valueA = a.id;
            valueB = b.id;
            break;
          case 'name':
            valueA = normalizeText(a.name);
            valueB = normalizeText(b.name);
            break;
          case 'dates':
            valueA = normalizeText(a.dates);
            valueB = normalizeText(b.dates);
            break;
          case 'location':
            valueA = normalizeText(a.location);
            valueB = normalizeText(b.location);
            break;
          case 'event_type':
            valueA = normalizeText(a.event_type);
            valueB = normalizeText(b.event_type);
            break;
          case 'target_audience':
            valueA = normalizeText(a.target_audience);
            valueB = normalizeText(b.target_audience);
            break;
          default:
            return 0;
        }

        if (sortDirection === 'asc') {
          return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        } else {
          return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
        }
      });
    }

    return filteredList;
  };

  const handleDelete = (eventId: number) => {
    // Placeholder for delete functionality
    toast("Delete action", {
      description: `Delete action for event ID: ${eventId} (not implemented yet)`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-app-gradient-from to-app-gradient-to">
      <AdminNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isDataLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <TbLoader3 className="size-12 animate-spin text-blue-600 mb-4" />
            <p className="text-app-text-secondary text-lg">
              Loading events...
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-app-text-primary mb-6">
                Events Management
              </h1>
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    className="bg-blue-600 text-white font-medium px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Add Event
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px] md:max-w-[60dvw] max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      Create New Event
                    </DialogTitle>
                  </DialogHeader>
                  <div className="p-4 text-center">
                    <p>Form will be implemented later</p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg p-4 mb-6 flex flex-wrap gap-4">
              <div className="flex flex-col w-64">
                <label className="text-sm font-medium mb-1 text-gray-700">Event Type</label>
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
                <label className="text-sm font-medium mb-1 text-gray-700">Location</label>
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
              {(filterType || filterLocation) && (
                <button
                  className="bg-gray-100 text-gray-700 font-medium px-4 py-2 rounded-md hover:bg-gray-200 transition-colors self-end"
                  onClick={() => {
                    setFilterType("");
                    setFilterLocation("");
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Events content */}
            <div className="max-w-7xl mx-auto bg-white rounded-2xl p-5">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="text-center cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleSort('id')}
                    >
                      <div className="flex items-center justify-center gap-1">
                        ID
                        {sortColumn === 'id' && (
                          sortDirection === 'asc' ? <FaSortUp /> : sortDirection === 'desc' ? <FaSortDown /> : null
                        )}
                        {sortColumn !== 'id' && <FaSort className="text-gray-300" />}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-center border-l cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Name
                        {sortColumn === 'name' && (
                          sortDirection === 'asc' ? <FaSortUp /> : sortDirection === 'desc' ? <FaSortDown /> : null
                        )}
                        {sortColumn !== 'name' && <FaSort className="text-gray-300" />}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-center border-l cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleSort('dates')}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Date
                        {sortColumn === 'dates' && (
                          sortDirection === 'asc' ? <FaSortUp /> : sortDirection === 'desc' ? <FaSortDown /> : null
                        )}
                        {sortColumn !== 'dates' && <FaSort className="text-gray-300" />}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-center border-l cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleSort('location')}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Location
                        {sortColumn === 'location' && (
                          sortDirection === 'asc' ? <FaSortUp /> : sortDirection === 'desc' ? <FaSortDown /> : null
                        )}
                        {sortColumn !== 'location' && <FaSort className="text-gray-300" />}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-center border-l cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleSort('event_type')}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Type
                        {sortColumn === 'event_type' && (
                          sortDirection === 'asc' ? <FaSortUp /> : sortDirection === 'desc' ? <FaSortDown /> : null
                        )}
                        {sortColumn !== 'event_type' && <FaSort className="text-gray-300" />}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-center border-l cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleSort('target_audience')}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Audience
                        {sortColumn === 'target_audience' && (
                          sortDirection === 'asc' ? <FaSortUp /> : sortDirection === 'desc' ? <FaSortDown /> : null
                        )}
                        {sortColumn !== 'target_audience' && <FaSort className="text-gray-300" />}
                      </div>
                    </TableHead>
                    <TableHead className="text-center border-l">Settings</TableHead>
                    <TableHead className="text-center border-l">Delete</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getSortedEventsList()?.map((event) => (
                    <TableRow key={event.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="text-center border-r border-gray-200 align-middle text-app-text-secondary">{event.id}</TableCell>
                      <TableCell className="text-center border-l border-gray-200 align-middle font-medium text-app-text-primary">{event.name}</TableCell>
                      <TableCell className="text-center border-l border-gray-200 align-middle text-app-text-secondary">{event.dates}</TableCell>
                      <TableCell className="text-center border-l border-gray-200 align-middle text-app-text-secondary">{event.location}</TableCell>
                      <TableCell className="text-center border-l border-gray-200 align-middle text-app-text-secondary">{event.event_type}</TableCell>
                      <TableCell className="text-center border-l border-gray-200 align-middle text-app-text-secondary">{event.target_audience}</TableCell>
                      <TableCell className="text-center border-l border-gray-200 align-middle">
                        <Dialog>
                          <DialogTrigger asChild>
                            <button
                              className="p-2 rounded-full hover:bg-blue-50 transition-colors w-full flex items-center justify-center cursor-pointer"
                              aria-label="Edit"
                              title={`Edit ${event.name}`}
                            >
                              <IoSettingsOutline className="text-xl text-gray-500" />
                            </button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[400px] md:max-w-[60dvw] max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                Edit Event
                              </DialogTitle>
                            </DialogHeader>
                            <div className="p-4 text-center">
                              <p>Edit form will be implemented later</p>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell className="text-center border-l border-gray-200 align-middle">
                        <Dialog>
                          <DialogTrigger asChild>
                            <button
                              className="p-2 rounded-full hover:bg-red-50 transition-colors w-full flex items-center justify-center cursor-pointer"
                              aria-label="Delete"
                              title={`Delete ${event.name}`}
                            >
                              <FaTrashAlt className="text-xl text-red-500" />
                            </button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[400px]">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                Delete Event
                              </DialogTitle>
                            </DialogHeader>
                            <div className="py-4 text-center text-app-text-primary">
                              <p>
                                Are you sure you want to <span className="font-semibold text-red-600">delete</span> the event <span className="font-semibold">&ldquo;{event.name}&rdquo;</span> ?
                              </p>
                            </div>
                            <DialogFooter className="flex justify-center gap-2 mt-2">
                              <DialogClose asChild>
                                <Button variant="outline" className="min-w-[90px]">Cancel</Button>
                              </DialogClose>
                              <Button
                                type="button"
                                variant="destructive"
                                className="min-w-[90px]"
                                onClick={() => handleDelete(event.id)}
                              >
                                Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {(!eventsList || eventsList.length === 0) && (
                <div className="flex items-center justify-center py-12 gap-3">
                  <CalendarIcon className="w-8 h-8 text-gray-400" />
                  <span className="text-gray-400 text-lg font-medium">No events found</span>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
