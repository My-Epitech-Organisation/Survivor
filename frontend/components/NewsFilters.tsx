"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, MapPin, Tag, Calendar, Filter } from "lucide-react";
import { useState, useEffect } from "react";

export interface NewsFiltersProps {
  categories: string[];
  locations: string[];
  onFiltersChange?: (filters: {
    categories: string[];
    locations: string[];
    dateRange: string | null;
  }) => void;
}

export default function NewsFilters(data: NewsFiltersProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<string | null>(
    null
  );

  const { onFiltersChange } = data;

  const dateRangeOptions = [
    { value: "last_week", label: "Last Week" },
    { value: "last_month", label: "Last Month" },
    { value: "last_3_months", label: "Last 3 Months" },
    { value: "last_6_months", label: "Last 6 Months" },
    { value: "last_year", label: "Last Year" },
  ];

  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange({
        categories: selectedCategories,
        locations: selectedLocations,
        dateRange: selectedDateRange,
      });
    }
  }, [
    selectedCategories,
    selectedLocations,
    selectedDateRange,
    onFiltersChange,
  ]);

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories((prev) => [...prev, category]);
    } else {
      setSelectedCategories((prev) => prev.filter((c) => c !== category));
    }
  };

  const handleLocationChange = (location: string, checked: boolean) => {
    if (checked) {
      setSelectedLocations((prev) => [...prev, location]);
    } else {
      setSelectedLocations((prev) => prev.filter((l) => l !== location));
    }
  };

  const handleDateRangeChange = (dateRange: string, checked: boolean) => {
    if (checked) {
      setSelectedDateRange(dateRange);
    } else {
      setSelectedDateRange(null);
    }
  };

  const getDisplayText = (selected: string[], defaultText: string) => {
    if (selected.length === 0) return defaultText;
    if (selected.length === 1) return selected[0];
    return `${selected.length} selected`;
  };

  const getDateRangeDisplayText = () => {
    if (!selectedDateRange) return "All Time";
    const option = dateRangeOptions.find(
      (opt) => opt.value === selectedDateRange
    );
    return option ? option.label : "All Time";
  };

  return (
    <Card className="h-fit bg-app-surface border border-app-border-light shadow-sm">
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-app-text-secondary" />
          <h3 className="text-lg font-semibold text-app-text-primary">
            Filters
          </h3>
        </div>
      </CardHeader>

      {/* Filters Row */}
      <CardContent className="pt-0 pb-3 flex flex-wrap gap-4 items-end">
        {/* Location Filter */}
        <div className="flex-1 min-w-[200px] space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-app-green-primary" />
            <span className="text-sm font-medium text-app-text-primary">
              Location
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between cursor-pointer"
              >
                {getDisplayText(selectedLocations, "All Locations")}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
              <DropdownMenuLabel>Select Location</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {data.locations.map((location) => (
                <DropdownMenuCheckboxItem
                  key={location}
                  checked={selectedLocations.includes(location)}
                  onCheckedChange={(checked) =>
                    handleLocationChange(location, checked)
                  }
                  className="cursor-pointer"
                >
                  {location}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Category Filter */}
        <div className="flex-1 min-w-[200px] space-y-2">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-app-purple-primary" />
            <span className="text-sm font-medium text-app-text-primary">
              Category
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between cursor-pointer"
              >
                {getDisplayText(selectedCategories, "All Categories")}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
              <DropdownMenuLabel>Select Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {data.categories.map((category) => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={(checked) =>
                    handleCategoryChange(category, checked)
                  }
                  className="cursor-pointer"
                >
                  {category}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Date Range Filter */}
        <div className="flex-1 min-w-[200px] space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-app-blue-primary" />
            <span className="text-sm font-medium text-app-text-primary">
              Date Range
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between cursor-pointer"
              >
                {getDateRangeDisplayText()}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
              <DropdownMenuLabel>Select Date Range</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {dateRangeOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={selectedDateRange === option.value}
                  onCheckedChange={(checked) =>
                    handleDateRangeChange(option.value, checked)
                  }
                  className="cursor-pointer"
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Clear Filters Button */}
        <div className="flex-shrink-0">
          <Button
            variant="ghost"
            className="text-app-text-secondary hover:text-app-text-primary whitespace-nowrap cursor-pointer"
            onClick={() => {
              setSelectedCategories([]);
              setSelectedLocations([]);
              setSelectedDateRange(null);
            }}
          >
            Clear All Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
