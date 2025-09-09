"use client"

import { Button } from "./ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu"
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import api from "@/lib/api";
import { Investor } from "@/types/investor";
import { Label } from "@/components/ui/label";

type Checked = DropdownMenuCheckboxItemProps["checked"]

export default function NewThreadChat() {
  const [investorsList, setInvestorsList] = useState<Investor[] | null>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedInvestors, setSelectedInvestors] = useState<number[]>([]);

  useEffect(() => {
    const fetchInvestisor = async ()  => {
      try {
        setIsLoading(true);
        const res = await api.get<Investor[] | null>({endpoint: "/investors/"});
        setInvestorsList(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInvestisor();
  }, [])
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            aria-label="Nouvelle conversation"
            onClick={() => {setSelectedInvestors([])}}
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
                <Button id="investor-list" variant="outline">{!selectedInvestors || selectedInvestors.length === 0
                  ? "Select investor"
                  : selectedInvestors.length === 1
                    ? investorsList?.find(inv => inv.id === selectedInvestors.at(0))?.name
                    : `${selectedInvestors.length} investors selected`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                {investorsList &&
                  investorsList.map((investor) => (
                    <DropdownMenuCheckboxItem
                      key={investor.id}
                      checked={selectedInvestors.includes(investor.id)}
                      onCheckedChange={(checked) => {
                        setSelectedInvestors((prev) =>
                          checked
                            ? [...prev, investor.id]
                            : prev.filter((id) => id !== investor.id)
                        );
                      }}
                    >
                      {investor.name}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
        </DialogContent>
      </Dialog>
    </>
  );
}
