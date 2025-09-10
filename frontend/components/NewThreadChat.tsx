"use client";

import { Button } from "./ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import { useEffect, useState, useRef } from "react";
import { Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "@/lib/api";
import { User } from "@/types/user";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"

type Checked = DropdownMenuCheckboxItemProps["checked"];

interface NewThreadChatProps {
  variante: "investors" | "founders"
  onSumbit: (investors: User[]) => void;
}

export default function NewThreadChat(props: NewThreadChatProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [usersList, setUsersList] = useState<User[] | null>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedInvestors, setSelectedInvestors] = useState<number[]>([]);

  useEffect(() => {
    const fetchInvestisor = async () => {
      try {
        setIsLoading(true);
        const res = await api.get<User[] | null>({
          endpoint: `/users/${props.variante}/`,
        });
        console.log("USERLIST: ", res.data);
        setUsersList(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvestisor();
  }, [props.variante]);
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            aria-label="New conversation"
            onClick={() => {
              setSelectedInvestors([]);
            }}
            className="cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New conversation</DialogTitle>
            <DialogDescription>
              Start a new conversation by selecting a user.
            </DialogDescription>
          </DialogHeader>
          <Label htmlFor="investor-list">Select {props.variante === "founders" ? "founder" : "inventor"}(s)</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button id="investor-list" variant="outline" className="cursor-pointer">
                {!selectedInvestors || selectedInvestors.length === 0
                  ? `Select ${props.variante === "founders" ? "founder(s)" : "inventor(s)"}`
                  : selectedInvestors.length === 1
                  ? usersList?.find(
                      (inv) => inv.id === selectedInvestors.at(0)
                    )?.name
                  : `${selectedInvestors.length} ${props.variante === "founders" ? "founders" : "inventors"} selected`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Select a user</DropdownMenuLabel>
              {usersList &&
                usersList.map((user) => (
                  <DropdownMenuCheckboxItem
                    key={user.id}
                    checked={selectedInvestors.includes(user.id)}
                    onCheckedChange={(checked) => {
                      setSelectedInvestors((prev) =>
                        checked
                          ? [...prev, user.id]
                          : prev.filter((id) => id !== user.id)
                      );
                    }}
                    className="cursor-pointer"
                  >
                    {user.name}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="w-full flex gap-2">
            <Button
              variant="outline"
              className="flex-1 cursor-pointer"
              onClick={() => {
                closeRef.current?.click();
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-jeb-primary hover:bg-jeb-hover cursor-pointer flex-1"
              onClick={() => {
                const selectedInvestorObjects = usersList?.filter(
                  (inv) => selectedInvestors.includes(inv.id)
                ) ?? [];
                if (selectedInvestorObjects.length == 0) {
                  toast("Thread error", {
                      className: "!text-red-500",
                      description: (
                        <span className="text-red-500">
                          Select at least one investor.
                        </span>
                      ),
                  });
                  return;
                }
                closeRef.current?.click();
                props.onSumbit(selectedInvestorObjects);
              }}
            >
              Chat
            </Button>
          </div>
          <DialogClose ref={closeRef} className="hidden" />
        </DialogContent>
      </Dialog>
    </>
  );
}
