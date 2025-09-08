"use client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import api from "@/lib/api"
import { useState, useRef } from "react"
import { getAPIUrl, getBackendUrl } from "@/lib/config"
import { Pencil } from 'lucide-react';

interface InputAvatar {
  url?: string
  defaultChar: string
  size?: number
  variente?: "normal" | "modifiable"
  onChange?: (url: string) => void
}

export default function InputAvatar(props: InputAvatar) {
  const [img, setImgUrl] = useState<string>(props.url ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  console.log("URL: ", props.url);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = reader.result as string;
          const res = await api.post<{ url: string }>("/media/upload/", { url: base64String });
          if (res.data && res.data.url) {
            setImgUrl(res.data.url);
            props.onChange?.(res.data.url);
          } else {
            throw new Error("API didn't return an avatar url image");
          }
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  if (props.variente === "modifiable") {
    return (
      <div className="relative inline-block">
        <Input
          type="file"
          className="hidden"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`h-${props.size} w-${props.size} cursor-pointer p-0 rounded-full border border-gray-300 relative`}
          variant="ghost"
        >
          <Avatar className={`h-${props.size} w-${props.size}`}>
        <AvatarImage src={img ? `${getBackendUrl()}${img}` : undefined} />
        <AvatarFallback>{props.defaultChar.toUpperCase()}</AvatarFallback>
          </Avatar>
          {/* Overlay with Pencil icon in the left bottom corner */}
          <span className="absolute bottom-1 right-1 p-1 bg-gray-200 rounded-full flex items-center justify-center">
        <Pencil className="h-4 w-4 text-gray-700" />
          </span>
        </Button>
      </div>
    );
  }
  return (
    <Avatar className={`h-${props.size} w-${props.size}`}>
      <AvatarImage src={img ? `${getBackendUrl()}${img}` : undefined} />
      <AvatarFallback>{props.defaultChar.toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}
