"use client"

import AdminNavigation from "@/components/AdminNavigation";
import { useState, useRef } from "react";
import { TbLoader3 } from "react-icons/tb";
import { Dialog, DialogTrigger, DialogOverlay, DialogContent, DialogTitle, DialogClose } from "@radix-ui/react-dialog";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { Card,  CardContent,  CardDescription,  CardHeader,  CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { FormUser, User } from "@/types/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getBackendUrl } from "@/lib/config";
import { IoSettingsOutline } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";
import { User as UserIcon } from "lucide-react";
import AdminUserForm from "@/components/AdminUserForm";
import api from "@/lib/api";

const UserList : User[] = [
  {
    name : "Noa",
    email: "noa.roussiere@gmail.com",
    role: "admin",
    id: Math.floor(Math.random() * (60 - 1) + 1),
    founderId: Math.floor(Math.random() * (60 - 1) + 1),
    startupId: Math.floor(Math.random() * (60 - 1) + 1),
    userImag: "string",
  },
  {
    name : "Alban",
    email: "roussee.alban@gmail.com",
    role: "investor",
    id: Math.floor(Math.random() * (60 - 1) + 1),
    founderId: Math.floor(Math.random() * (60 - 1) + 1),
    startupId: Math.floor(Math.random() * (60 - 1) + 1),
    userImag: "string",
  },
  {
    name : "Eliott",
    email: "eliott.tesnier@gmail.com",
    role: "founder",
    id: Math.floor(Math.random() * (60 - 1) + 1),
    founderId: Math.floor(Math.random() * (60 - 1) + 1),
    startupId: Math.floor(Math.random() * (60 - 1) + 1),
    userImag: "string",
  }, 
  {
    name : "Paul-Antoine",
    email: "pa.salmon@gmail.com",
    role: "user",
    id: Math.floor(Math.random() * (60 - 1) + 1),
    founderId: Math.floor(Math.random() * (60 - 1) + 1),
    startupId: Math.floor(Math.random() * (60 - 1) + 1),
    userImag: "string",
  }, 
]


export default function AdminUsers() {
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const closeDialogRef = useRef<HTMLButtonElement>(null);
  
  const handleEditUserSubmit = (data: FormUser) => {
    api
      .put("/user/", data)
      .then((response) => {
        console.debug("Project edit successfully:", response.data);
        if (closeDialogRef.current) {
          closeDialogRef.current.click();
        }
        // fetchuUsers();
      })
      .catch((error) => {
        console.error("Error creating project:", error);
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
              Loading users...
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-app-text-primary mb-6">
                Users Management
              </h1>
            </div>

            {/* Users content placeholder */}
            <div className="max-w-7xl mx-auto bg-white rounded-2xl p-5">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">ID</TableHead>
                      <TableHead className="text-center border-l">User</TableHead>
                      <TableHead className="text-center border-l">Role</TableHead>
                      <TableHead className="text-center border-l">Email</TableHead>
                      <TableHead className="text-center border-l">Founder ID</TableHead>
                      <TableHead className="text-center border-l">Founder Startup</TableHead>
                      <TableHead className="text-center border-l">Settings</TableHead>
                      <TableHead className="text-center border-l">Delete</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {UserList.map((user, id) => (
                      <TableRow key={id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="text-center border-r border-gray-200 align-middle text-app-text-secondary">{user.id}</TableCell>
                        <TableCell className="border-none">
                          <div className="flex justify-center items-center gap-3">
                            <Avatar>
                              <AvatarImage src={`${getBackendUrl()}${user.userImag}`}></AvatarImage>
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-app-text-primary">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center border-l border-gray-200 align-middle text-app-text-secondary">{user.role}</TableCell>
                        <TableCell className="text-center border-l border-gray-200 align-middle text-app-text-secondary">{user.email}</TableCell>
                        <TableCell className="text-center border-l border-gray-200 align-middle text-app-text-secondary">{user.founderId}</TableCell>
                        <TableCell className="text-center border-l border-gray-200 align-middle text-app-text-secondary">{user.startupId}</TableCell>
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
                {UserList.length === 0 && (
                  <div className="flex items-center justify-center py-12 gap-3">
                    <UserIcon className="w-8 h-8 text-gray-400" />
                    <span className="text-gray-400 text-lg font-medium">No user</span>
                  </div>
                )}
              </div>
          </>
        )}
      </main>
    </div>
  );
}
