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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "@/lib/api";
import { Investor } from "@/types/investor";
import { User } from "@/types/user";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"

type Checked = DropdownMenuCheckboxItemProps["checked"];

interface NewThreadChatProps {
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
          endpoint: "/users/investors/",
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
  }, []);
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            aria-label="Nouvelle conversation"
            onClick={() => {
              setSelectedInvestors([]);
            }}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle conversation</DialogTitle>
            <DialogDescription>
              Démarrez une nouvelle conversation en sélectionnant un
              utilisateur.
            </DialogDescription>
          </DialogHeader>
          <Label htmlFor="investor-list">Select Investor(s)</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button id="investor-list" variant="outline">
                {!selectedInvestors || selectedInvestors.length === 0
                  ? "Select investor"
                  : selectedInvestors.length === 1
                  ? usersList?.find(
                      (inv) => inv.id === selectedInvestors.at(0)
                    )?.name
                  : `${selectedInvestors.length} investors selected`}
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
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer flex-1"
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
