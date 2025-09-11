"use client";
import { TableRow, TableCell } from "@/components/ui/table";
import { FaTrashAlt } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { Event } from "@/types/event";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import AdminEventForm from "@/components/AdminEventForm";

interface AdminEventProps {
  event: Event;
  editCB: (
    eventId: number,
    data: Event,
    btnAction: HTMLButtonElement | null
  ) => void;
  deleteCB: (eventId: number, btnAction: HTMLButtonElement | null) => void;
}

export default function AdminEvent(props: AdminEventProps) {
  const closeBtn = useRef<HTMLButtonElement>(null);

  return (
    <TableRow
      key={props.event.id}
      className="hover:bg-app-surface-hover transition-colors"
    >
      <TableCell className="text-center border-r border-app-border align-middle text-app-text-secondary">
        {props.event.id}
      </TableCell>
      <TableCell className="text-center border-l border-app-border align-middle font-medium text-app-text-primary">
        {props.event.name}
      </TableCell>
      <TableCell className="text-center border-l border-app-border align-middle text-app-text-secondary">
        {props.event.dates}
      </TableCell>
      <TableCell className="text-center border-l border-app-border align-middle text-app-text-secondary">
        {props.event.location}
      </TableCell>
      <TableCell className="text-center border-l border-app-border align-middle text-app-text-secondary">
        {props.event.event_type}
      </TableCell>
      <TableCell className="text-center border-l border-app-border align-middle text-app-text-secondary">
        {props.event.target_audience}
      </TableCell>
      <TableCell className="text-center border-l border-app-border align-middle">
        <Dialog>
          <DialogTrigger asChild>
            <button
              className="p-2 rounded-full hover:bg-jeb-hover/10 transition-colors w-full flex items-center justify-center cursor-pointer"
              aria-label="Edit"
              title={`Edit ${props.event.name}`}
            >
              <IoSettingsOutline className="text-xl text-app-text-secondary" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px] md:max-w-[60dvw] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading flex items-center gap-2">
                Edit Event
              </DialogTitle>
            </DialogHeader>
            <AdminEventForm
              defaultData={props.event}
              onSubmit={(data) =>
                props.editCB(props.event.id, data, closeBtn.current)
              }
            />
          </DialogContent>
        </Dialog>
      </TableCell>
      <TableCell className="text-center border-l border-app-border align-middle">
        <Dialog>
          <DialogTrigger asChild>
            <button
              className="p-2 rounded-full hover:bg-jeb-primary/10 transition-colors w-full flex items-center justify-center cursor-pointer"
              aria-label="Delete"
              title={`Delete ${props.event.name}`}
            >
              <FaTrashAlt className="text-xl text-jeb-primary" />
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
                Are you sure you want to{" "}
                <span className="font-semibold text-app-purple-primary">delete</span> the
                event{" "}
                <span className="font-semibold">
                  &ldquo;{props.event.name}&rdquo;
                </span>{" "}
                ?
              </p>
            </div>
            <DialogFooter className="flex justify-center gap-2 mt-2">
              <DialogClose asChild ref={closeBtn}>
                <Button variant="outline" className="min-w-[90px] cursor-pointer">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="button"
                variant="destructive"
                className="min-w-[90px] cursor-pointer bg-app-purple-primary hover:bg-app-purple-primary/80"
                onClick={() => props.deleteCB(props.event.id, closeBtn.current)}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  );
}
