"use client";

import * as React from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import InputAvatar from "@/components/ui/InputAvatar";

interface ComboboxProps {
  elements: { value: string; label: string, url? : string }[];
  placeholder: string;
  notFound: string;
  id?: string;
  variante?: "withAvatar";
  onChange?: (value: string | undefined) => void;
}

export function Combobox(props: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  if (props.variante === "withAvatar") {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button id={props.id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {/* AvatarDisplay */}
            {value ? (
              <span className="flex items-center gap-2">
                {props.elements.find((element) => element.label === value)?.label}
              </span>
            ) : props.placeholder}
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder={props.placeholder} />
            <CommandList>
              <CommandEmpty>{props.notFound}</CommandEmpty>
              <CommandGroup>
                {props.elements.map((element) => (
                  <CommandItem
                    key={element.value}
                    value={element.label}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      setOpen(false);
                      if (props.onChange)
                        props.onChange(element.value);
                    }}
                  >
                    <span className="flex items-center gap-2 flex-1">
                      <InputAvatar variente="normal" size={4} defaultChar={element.label.charAt(0)} url={element.url} />
                      {element.label}
                    </span>
                    <CheckIcon
                      className={cn(
                        "ml-2 h-4 w-4",
                        value === element.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {/* AvatarDisplay */}
            {value ? (
              <span className="flex items-center gap-2">
                {props.elements.find((element) => element.label === value)?.label}
              </span>
            ) : props.placeholder}
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder={props.placeholder} />
            <CommandList>
              <CommandEmpty>{props.notFound}</CommandEmpty>
              <CommandGroup>
                {props.elements.map((element) => (
                  <CommandItem
                    key={element.value}
                    value={element.label}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      setOpen(false);
                      if (props.onChange)
                        props.onChange(element.value);
                    }}
                  >
                    {element.label}
                    <CheckIcon
                      className={cn(
                        "ml-2 h-4 w-4",
                        value === element.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
  );
}
