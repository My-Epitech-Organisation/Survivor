"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FaTrash, FaUpload } from "react-icons/fa";
import { Founder } from "@/types/founders";

interface AddFoundersSectionProps {
  founders: Founder[];
  onUpdateFounders: (founders: Founder[]) => void;
  onClose: () => void;
}

export function AddFoundersSection({
  founders,
  onUpdateFounders,
  onClose,
}: AddFoundersSectionProps) {
  const [newFounder, setNewFounder] = useState<Partial<Founder>>({
    FounderName: "",
    FounderPictureURL: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setNewFounder((prev) => ({
        ...prev,
        FounderPictureURL: imageUrl,
      }));
    }
  };

  const handleAddFounder = () => {
    if (newFounder.FounderName) {
      const newFounderComplete: Founder = {
        FounderID: Math.random(),
        FounderStartupID: 0,
        FounderName: newFounder.FounderName,
        FounderPictureURL: newFounder.FounderPictureURL || "",
      };

      onUpdateFounders([...founders, newFounderComplete]);
      setNewFounder({
        FounderName: "",
        FounderPictureURL: "",
      });
      onClose();
    }
  };

  const handleRemoveFounder = (founderId: number) => {
    const updatedFounders = founders.filter((f) => f.FounderID !== founderId);
    onUpdateFounders(updatedFounders);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        <div className="flex items-center gap-4">
          <Avatar
            className="h-20 w-20 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <AvatarImage src={newFounder.FounderPictureURL || ""} />
            <AvatarFallback>
              <FaUpload className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileSelect}
          />
          <div className="flex-1 space-y-4">
            <div>
              <Label htmlFor="founderName">Founder Name</Label>
              <Input
                id="founderName"
                value={newFounder.FounderName}
                onChange={(e) =>
                  setNewFounder((prev) => ({
                    ...prev,
                    FounderName: e.target.value,
                  }))
                }
                placeholder="Enter founder name"
              />
            </div>
          </div>
        </div>
        <Button
          type="button"
          onClick={handleAddFounder}
          disabled={!newFounder.FounderName}
        >
          Add Founder
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Current Founders</h3>
        <div className="grid gap-4">
          {founders.map((founder) => (
            <div
              key={founder.FounderID}
              className="flex items-center gap-4 p-4 border rounded-lg"
            >
              <Avatar className="h-16 w-16">
                <AvatarImage src={founder.FounderPictureURL} />
                <AvatarFallback>{founder.FounderName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{founder.FounderName}</p>
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleRemoveFounder(founder.FounderID)}
              >
                <FaTrash className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
