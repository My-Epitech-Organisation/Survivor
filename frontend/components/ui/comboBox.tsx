"use client";

import * as React from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { InputAvatar } from "@/components/ui/InputAvatar";

interface ComboboxProps {
  elements: { value: string; label: string, url? : string }[];
  defaultValue?: string;
  defaultLabel?: string;
  placeholder: string;
  notFound: string;
  id?: string;
  variante?: "withAvatar";
  onChange?: (value: string | undefined) => void;
}

export function Combobox(props: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    if ((value === undefined || value === "") && props.defaultValue) {
      setValue(props.defaultValue);
    }
  }, [props.defaultValue, value]);

  const handleSelect = (currentValue: string) => {
    if (currentValue === value && currentValue === props.defaultValue) {
      setValue("");
      if (props.onChange) props.onChange(undefined);
    } else {
      setValue(currentValue);
      if (props.onChange) props.onChange(currentValue);
    }
    setOpen(false);
  };

  const displayLabel = value
    ? props.elements.find((element) => element.value === value)?.label
    : (props.defaultLabel || props.placeholder);

  const finalLabel = displayLabel && displayLabel.trim() !== "" ? displayLabel : props.placeholder;

  if (props.variante === "withAvatar") {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            <span className="flex items-center gap-2">
              {finalLabel}
            </span>
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandEmpty>{props.notFound}</CommandEmpty>
              <CommandGroup>
                {props.elements.map((element) => (
                  <CommandItem
                    key={element.value}
                    value={element.value}
                    onSelect={handleSelect}
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
            <span className="flex items-center gap-2">
              {finalLabel}
            </span>
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandEmpty>{props.notFound}</CommandEmpty>
              <CommandGroup>
                {props.elements.map((element) => (
                  <CommandItem
                    key={element.value}
                    value={element.value}
                    onSelect={handleSelect}
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
