"use client"

import AdminNavigation from "@/components/AdminNavigation";
import { useState, useRef } from "react";
import { TbLoader3 } from "react-icons/tb";
import { Dialog, DialogTrigger, DialogOverlay, DialogContent, DialogTitle, DialogClose } from "@radix-ui/react-dialog";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { Card,  CardContent,  CardDescription,  CardHeader,  CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { User } from "@/types/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getBackendUrl } from "@/lib/config";
import { IoSettingsOutline } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";

const UserList : User[] = [
  {
    name : "Noa",
    email: "noa.roussiere@gmail.com",
    role: "admin",
    id: 1,
    founderId: 1,
    startupId: 1,
    userImag: "string",
  },
  {
    name : "Noa",
    email: "noa.roussiere@gmail.com",
    role: "investor",
    id: 1,
    founderId: 1,
    startupId: 1,
    userImag: "string",
  },
  {
    name : "Noa",
    email: "noa.roussiere@gmail.com",
    role: "user",
    id: 1,
    founderId: 1,
    startupId: 1,
    userImag: "string",
  }, 
  {
    name : "Noa",
    email: "noa.roussiere@gmail.com",
    role: "founder",
    id: 1,
    founderId: 1,
    startupId: 1,
    userImag: "string",
  }, 
]


export default function AdminUsers() {
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const closeDialogRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-app-gradient-from to-app-gradient-to">
      <AdminNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isDataLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <TbLoader3 className="size-12 animate-spin text-blue-600 mb-4" />
            <p className="text-app-text-secondary text-lg">
              Loading users...
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-app-text-primary mb-6">
                Users Management
              </h1>
              <Dialog>
                <DialogTrigger
                  className="inline-flex items-center justify-center gap-2 bg-app-blue-primary hover:bg-app-blue-primary-hover rounded-lg px-6 py-3 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 group"
                  onClick={(e) => {
                    const button = e.currentTarget;
                    button.classList.add("scale-95");
                    setTimeout(() => button.classList.remove("scale-95"), 150);
                  }}
                >
                  <div className="relative w-5 h-5 flex items-center justify-center">
                    <FaPlus className="h-5 w-5 text-white absolute transition-all duration-300 opacity-100 group-hover:rotate-90" />
                  </div>
                  <span className="hidden md:block text-white font-medium">
                    Add New User
                  </span>
                </DialogTrigger>
                <DialogOverlay className="fixed inset-0 bg-black/50 z-40" />
                <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-0 w-[95%] max-w-[1200px] max-h-[85vh] shadow-lg z-50 flex flex-col">
                  <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10 rounded-t-lg">
                    <DialogTitle className="text-xl font-bold">
                      Add New User
                    </DialogTitle>
                    <DialogClose asChild ref={closeDialogRef}>
                      <button
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors focus:outline-none"
                        aria-label="Close"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </DialogClose>
                  </div>
                  <div className="p-4 md:p-6 overflow-y-auto">
                    {/* <AdminProjectForm onSubmit={handleNewProjectSubmit} /> */}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Users content placeholder */}
            <div className="max-w-7xl mx-auto bg-white rounded-2xl p-5">
              {/* <CardHeader>
                <CardTitle className="text-2xl font-semibold text-app-text-primary mb-6">
                  Users
                </CardTitle>
                <CardDescription className="text-app-text-secondary mb-8">
                  This is where the users management content will go.
                </CardDescription>
              </CardHeader> */}
              <div className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[240px]">User</TableHead>
                      <TableHead className="text-center border-l">Role</TableHead>
                      <TableHead className="text-center border-l">Email</TableHead>
                      <TableHead className="text-center border-l">Settings</TableHead>
                      <TableHead className="text-center border-l">Delete</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {UserList.map((user, id) => (
                      <TableRow key={id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="border-none">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={`${getBackendUrl()}${user.userImag}`}></AvatarImage>
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-app-text-primary">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center border-l border-gray-200 align-middle text-app-text-secondary">{user.role}</TableCell>
                        <TableCell className="text-center border-l border-gray-200 align-middle text-app-text-secondary">{user.email}</TableCell>
                        <TableCell className="text-center border-l border-gray-200 align-middle">
                          <button className="p-2 rounded hover:bg-gray-100 transition-colors" aria-label="Settings">
                            <IoSettingsOutline className="text-xl text-gray-500" />
                          </button>
                        </TableCell>
                        <TableCell className="text-center border-l border-gray-200 align-middle">
                          <button className="p-2 rounded hover:bg-red-100 transition-colors" aria-label="Delete">
                            <FaTrashAlt className="text-xl text-red-500" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
