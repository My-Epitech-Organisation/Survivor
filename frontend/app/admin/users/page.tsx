"use client";

import AdminNavigation from "@/components/AdminNavigation";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AdminUserForm from "@/components/AdminUserForm";
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
import { FormUser, UserSimple } from "@/types/user";
import { User as UserIcon } from "lucide-react";
import api from "@/lib/api";
import AdminUser from "@/components/AdminUser";
import { toast } from "sonner";
import Footer from "@/components/Footer";

type SortColumn =
  | "id"
  | "name"
  | "role"
  | "email"
  | "founderID"
  | "investorID"
  | null;
type SortDirection = "asc" | "desc" | null;

export default function AdminUsers() {
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [UserList, setUserList] = useState<UserSimple[] | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsDataLoading(true);
    try {
      const resp = (await api.get<UserSimple[]>({ endpoint: "/users/" })).data;
      setUserList(resp);
    } catch (error) {
      console.error(error);
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
        console.debug(`Sorting reset`);
        return;
      }
    } else {
      newDirection = "asc";
    }

    setSortColumn(column);
    setSortDirection(newDirection);
    console.debug(
      `Sorting by ${column} in ${
        newDirection === "asc" ? "ascending" : "descending"
      } order`
    );
  };

  const getSortedUserList = () => {
    if (!UserList || !sortColumn || !sortDirection) {
      return UserList;
    }

    return [...UserList].sort((a, b) => {
      let valueA, valueB;

      switch (sortColumn) {
        case "id":
          valueA = a.id;
          valueB = b.id;
          break;
        case "name":
          valueA = typeof a.name === "string" ? a.name.toLowerCase() : a.name;
          valueB = typeof b.name === "string" ? b.name.toLowerCase() : b.name;
          break;
        case "role":
          valueA = typeof a.role === "string" ? a.role.toLowerCase() : a.role;
          valueB = typeof b.role === "string" ? b.role.toLowerCase() : b.role;
          break;
        case "email":
          valueA =
            typeof a.email === "string" ? a.email.toLowerCase() : a.email;
          valueB =
            typeof b.email === "string" ? b.email.toLowerCase() : b.email;
          break;
        case "founderID":
          valueA = a.founder ? a.founder.FounderID : Number.MIN_SAFE_INTEGER;
          valueB = b.founder ? b.founder.FounderID : Number.MIN_SAFE_INTEGER;
          break;
        case "investorID":
          valueA = a.investor ? a.investor.id : Number.MIN_SAFE_INTEGER;
          valueB = b.investor ? b.investor.id : Number.MIN_SAFE_INTEGER;
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
  };

  const handleEditUserSubmit = (
    id: number,
    data: FormUser,
    btnAction: HTMLButtonElement | null
  ) => {
    console.debug("DataSend: ", data);
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

  const handleDeleteUserSubmit = (
    userID: number,
    btnAction: HTMLButtonElement | null
  ) => {
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

  const [openAddDialog, setOpenAddDialog] = useState(false);

  const handleAddUserSubmit = (data: FormUser) => {
    api
      .post("/users/", data)
      .then(() => {
        toast("User created", {
          className: "!text-green-500",
          description: (
            <span className="text-green-500">User created successfully!</span>
          ),
        });
        setOpenAddDialog(false);
        fetchUsers();
      })
      .catch((error) => {
        toast("Create error", {
          className: "!text-red-500",
          description: (
            <span className="text-red-500">
              An error occurred during user creation: {String(error)}
            </span>
          ),
        });
        console.error("Error creating user:", error);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-jeb-gradient-from to-jeb-gradient-to/50">
      <AdminNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isDataLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <TbLoader3 className="size-12 animate-spin text-jeb-primary mb-4" />
            <p className="text-app-text-secondary text-lg">Loading users...</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-app-text-primary mb-6">
                Users Management
              </h1>
              {/* Bouton Add User + Dialog */}
              <div>
                <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
                  <DialogTrigger asChild>
                    <button
                      className="bg-jeb-primary text-white px-4 py-2 rounded-md hover:bg-jeb-hover transition-colors font-bold cursor-pointer ml-4"
                      onClick={() => setOpenAddDialog(true)}
                    >
                      Add User
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[400px] md:max-w-[60dvw] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="font-heading flex items-center gap-2">
                        Add User
                      </DialogTitle>
                    </DialogHeader>
                    <AdminUserForm onSubmit={handleAddUserSubmit} />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Users content placeholder */}
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
                        User
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
                      onClick={() => handleSort("role")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Role
                        {sortColumn === "role" &&
                          (sortDirection === "asc" ? (
                            <FaSortUp />
                          ) : sortDirection === "desc" ? (
                            <FaSortDown />
                          ) : null)}
                        {sortColumn !== "role" && (
                          <FaSort className="text-gray-300" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-center border-l cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleSort("email")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Email
                        {sortColumn === "email" &&
                          (sortDirection === "asc" ? (
                            <FaSortUp />
                          ) : sortDirection === "desc" ? (
                            <FaSortDown />
                          ) : null)}
                        {sortColumn !== "email" && (
                          <FaSort className="text-gray-300" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-center border-l cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleSort("founderID")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Founder ID
                        {sortColumn === "founderID" &&
                          (sortDirection === "asc" ? (
                            <FaSortUp />
                          ) : sortDirection === "desc" ? (
                            <FaSortDown />
                          ) : null)}
                        {sortColumn !== "founderID" && (
                          <FaSort className="text-gray-300" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-center border-l cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleSort("investorID")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Investor ID
                        {sortColumn === "investorID" &&
                          (sortDirection === "asc" ? (
                            <FaSortUp />
                          ) : sortDirection === "desc" ? (
                            <FaSortDown />
                          ) : null)}
                        {sortColumn !== "investorID" && (
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
                  {UserList &&
                    UserList.length > 0 &&
                    getSortedUserList()?.map((user, id) => (
                      <AdminUser
                        key={id}
                        id={user.id}
                        user={user}
                        editCB={handleEditUserSubmit}
                        deleteCB={handleDeleteUserSubmit}
                      />
                    ))}
                </TableBody>
              </Table>
              {(!UserList || UserList.length === 0) && (
                <div className="flex items-center justify-center py-12 gap-3">
                  <UserIcon className="w-8 h-8 text-gray-400" />
                  <span className="text-gray-400 text-lg font-medium">
                    No user
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
