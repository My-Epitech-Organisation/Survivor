"use client"

import { ProjectFiltersProps } from "@/types/project";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, MapPin, Building, TrendingUp, Filter } from "lucide-react";
import { useState, useEffect } from "react";

export default function ProjectFilters(data: ProjectFiltersProps) {
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [selectedMaturities, setSelectedMaturities] = useState<string[]>([]);
    const [selectedSectors, setSelectedSectors] = useState<string[]>([]);

    useEffect(() => {
        if (data.onFiltersChange) {
            data.onFiltersChange({
                locations: selectedLocations,
                maturities: selectedMaturities,
                sectors: selectedSectors
            });
        }
    }, [selectedLocations, selectedMaturities, selectedSectors, data.onFiltersChange]);

    const handleLocationChange = (location: string, checked: boolean) => {
        if (checked) {
            setSelectedLocations(prev => [...prev, location]);
        } else {
            setSelectedLocations(prev => prev.filter(l => l !== location));
        }
    };

    const handleMaturityChange = (maturity: string, checked: boolean) => {
        if (checked) {
            setSelectedMaturities(prev => [...prev, maturity]);
        } else {
            setSelectedMaturities(prev => prev.filter(m => m !== maturity));
        }
    };

    const handleSectorChange = (sector: string, checked: boolean) => {
        if (checked) {
            setSelectedSectors(prev => [...prev, sector]);
        } else {
            setSelectedSectors(prev => prev.filter(s => s !== sector));
        }
    };

    const getDisplayText = (selected: string[], defaultText: string) => {
        if (selected.length === 0) return defaultText;
        if (selected.length === 1) return selected[0];
        return `${selected.length} selected`;
    };

    return (
        <div className="w-full bg-white border border-gray-200 rounded-lg p-4 mb-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-4 items-end">
                {/* Location Filter */}
                <div className="flex-1 min-w-[200px] space-y-2">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm font-medium text-gray-700">Location</span>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                                {getDisplayText(selectedLocations, "All Locations")}
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                            <DropdownMenuLabel>Select Location</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {data.ProjectLocation.map((location) => (
                                <DropdownMenuCheckboxItem
                                    key={location}
                                    checked={selectedLocations.includes(location)}
                                    onCheckedChange={(checked) => handleLocationChange(location, checked)}
                                >
                                    {location}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Maturity Filter */}
                <div className="flex-1 min-w-[200px] space-y-2">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-700">Maturity</span>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                                {getDisplayText(selectedMaturities, "All Maturities")}
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                            <DropdownMenuLabel>Select Maturity</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {data.ProjectMaturity.map((maturity) => (
                                <DropdownMenuCheckboxItem
                                    key={maturity}
                                    checked={selectedMaturities.includes(maturity)}
                                    onCheckedChange={(checked) => handleMaturityChange(maturity, checked)}
                                >
                                    {maturity}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Sector Filter */}
                <div className="flex-1 min-w-[200px] space-y-2">
                    <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Sector</span>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                                {getDisplayText(selectedSectors, "All Sectors")}
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                            <DropdownMenuLabel>Select Sector</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {data.ProjectSector.map((sector) => (
                                <DropdownMenuCheckboxItem
                                    key={sector}
                                    checked={selectedSectors.includes(sector)}
                                    onCheckedChange={(checked) => handleSectorChange(sector, checked)}
                                >
                                    {sector}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Clear Filters Button */}
                <div className="flex-shrink-0">
                    <Button
                        variant="ghost"
                        className="text-gray-600 hover:text-gray-800 whitespace-nowrap"
                        onClick={() => {
                            setSelectedLocations([]);
                            setSelectedMaturities([]);
                            setSelectedSectors([]);
                        }}
                    >
                        Clear All Filters
                    </Button>
                </div>
            </div>
        </div>
    );
}