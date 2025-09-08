"use client"

import AdminNavigation from "@/components/AdminNavigation";
import { useState, useRef, useEffect } from "react";
import { TbLoader3 } from "react-icons/tb";
import { Dialog, DialogTrigger, DialogOverlay, DialogContent, DialogTitle, DialogClose } from "@radix-ui/react-dialog";
import { Card,  CardContent,  CardDescription,  CardHeader,  CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { FormUser, UserSimple } from "@/types/user";
import { User as UserIcon } from "lucide-react";
import api from "@/lib/api";
import AdminUser from "@/components/AdminUser";
import { toast } from "sonner"

export default function AdminUsers() {
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [UserList, setUserList] = useState<UserSimple[] | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsDataLoading(true);
    try {
      setUserList((await api.get<UserSimple[]>({endpoint: "/users/"})).data);
    } catch (error) {
      console.error(error);
    }
    setIsDataLoading(false);
  };

  const handleEditUserSubmit = (id: number, data: FormUser, btnAction: HTMLButtonElement | null) => {
    console.log("DataSend: ", data);
    api
      .put(`/users/${id}/`, data)
      .then((response) => {
        console.debug("User edit successfully:", response.data);
        if (btnAction) {
          btnAction.click();
        }
        fetchUsers();
      })
      .catch((error) => {
        toast("Edit error", {
            className: "!text-red-500",
            description: (
              <span className="text-red-500">
                An error occurred during edit user: {String(error)}
              </span>
            ),
        });
        console.error("Error creating project:", error);
      });
  };

    const handleDeleteUserSubmit = (userID: number, btnAction: HTMLButtonElement | null) => {
      api
        .delete(`/users/${userID}/`)
        .then((response) => {
          console.debug("User delete successfully:", response.data);
          if (btnAction) {
            btnAction.click();
          }
          fetchUsers();
        })
        .catch((error) => {
          toast("Delete error", {
            className: "!text-red-500",
            description: (
              <span className="text-red-500">
                An error occurred during delete user: {String(error)}
              </span>
            ),
          });
          console.error("Error deleting user:", error);
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
                    {UserList && UserList.length > 0 && (
                      UserList.map((user, id) => (
                        <AdminUser key={id} id={user.id} user={user} editCB={handleEditUserSubmit} deleteCB={handleDeleteUserSubmit}/>
                      ))
                    )}
                  </TableBody>
                </Table>
                  {(!UserList || UserList.length === 0) && (
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
