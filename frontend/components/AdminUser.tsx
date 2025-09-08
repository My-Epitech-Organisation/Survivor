"use client"
import { TableRow, TableCell } from "./ui/table";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IoSettingsOutline } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";
import AdminUserForm from "@/components/AdminUserForm";
import { getBackendUrl } from "@/lib/config";
import { FormUser, UserSimple } from "@/types/user";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogHeader, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

interface AdminUserProps {
  id: number,
  user: UserSimple,
  editCB: (userId: number, formUser: FormUser, btnAction: HTMLButtonElement | null) => void
  deleteCB: (userId: number, btnAction: HTMLButtonElement | null) => void
}

export default function AdminUser (props : AdminUserProps)
{
  const closeBtn = useRef<HTMLButtonElement>(null);

  return (
    <>
      <TableRow key={props.id} className="hover:bg-gray-50 transition-colors">
        <TableCell className="text-center border-r border-gray-200 align-middle text-app-text-secondary">{props.user.id}</TableCell>
        <TableCell className="border-none">
        <div className="flex justify-center items-center gap-3">
            <Avatar>
            <AvatarImage src={`${getBackendUrl()}${props.user.userImag}`}></AvatarImage>
            <AvatarFallback>{props.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="font-medium text-app-text-primary">{props.user.name}</span>
        </div>
        </TableCell>
        <TableCell className="text-center border-l border-gray-200 align-middle text-app-text-secondary">{props.user.role}</TableCell>
        <TableCell className="text-center border-l border-gray-200 align-middle text-app-text-secondary">{props.user.email}</TableCell>
        {props.user.founder ? (
        <>
          <TableCell className="text-center border-l border-gray-200 align-middle text-app-text-secondary">{props.user.founder.FounderID}</TableCell>
          <TableCell className="text-center border-l border-gray-200 align-middle text-app-text-secondary">{props.user.founder.FounderStartupID}</TableCell>
        </>
        ) : (
        <>
          <TableCell className="text-center border-l border-gray-200 align-middle text-app-text-secondary">none</TableCell>
          <TableCell className="text-center border-l border-gray-200 align-middle text-app-text-secondary">none</TableCell>
        </>
        )}
        <TableCell className="text-center border-l border-gray-200 align-middle">
        <Dialog>
            <DialogTrigger asChild>
              <button
                className="p-2 rounded-full hover:bg-red-50 transition-colors w-full flex items-center justify-center"
                aria-label="Edit"
                title={`Edit ${props.user.name}`}
              >
                <IoSettingsOutline className="text-xl text-gray-500" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] md:max-w-[60dvw]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Edit User
                </DialogTitle>
              </DialogHeader>
              <AdminUserForm
                defaultData={{
                  name: props.user.name,
                  email: props.user.email,
                  role: props.user.role,
                  founder: props.user.founder,
                  investor: props.user.investor,

                  userImag: props.user.userImag,
                  is_active: props.user.is_active
                }}
                onSubmit={(formUser) => props.editCB(props.id, formUser, closeBtn.current)}
              />
            </DialogContent>
          </Dialog>
        </TableCell>
        <TableCell className="text-center border-l border-gray-200 align-middle">
          <Dialog>
            <DialogTrigger asChild>
              <button
                className="p-2 rounded-full hover:bg-red-50 transition-colors w-full flex items-center justify-center"
                aria-label="Delete"
                title={`Delete ${props.user.name}`}
              >
                <FaTrashAlt className="text-xl text-red-500" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Delete User
                </DialogTitle>
              </DialogHeader>
              <div className="py-4 text-center text-app-text-primary">
                <p>
                  Are you sure you want to <span className="font-semibold text-red-600">delete</span> user <span className="font-semibold">{props.user.name}</span> ?
                </p>
              </div>
              <DialogFooter className="flex justify-center gap-2 mt-2">
                <DialogClose asChild ref={closeBtn}>
                  <Button variant="outline" className="min-w-[90px]">Cancel</Button>
                </DialogClose>
                  <Button
                    type="button"
                    variant="destructive"
                    className="min-w-[90px]"
                    onClick={() => props.deleteCB(props.user.id, closeBtn.current)}
                  >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TableCell>
      </TableRow>
    </>
  );
}