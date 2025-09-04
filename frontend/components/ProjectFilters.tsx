"use client"

import { ProjectFiltersProps } from "@/types/project";
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
import { ChevronDown, MapPin, Building, TrendingUp, Filter } from "lucide-react";
import { useState, useEffect } from "react";

export default function ProjectFilters(data: ProjectFiltersProps) {
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [selectedMaturities, setSelectedMaturities] = useState<string[]>([]);
    const [selectedSectors, setSelectedSectors] = useState<string[]>([]);

    const { onFiltersChange } = data;

    useEffect(() => {
        if (onFiltersChange) {
            onFiltersChange({
                locations: selectedLocations,
                maturities: selectedMaturities,
                sectors: selectedSectors
            });
        }
    }, [selectedLocations, selectedMaturities, selectedSectors, onFiltersChange]);

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
        <Card className="h-fit bg-app-surface border border-app-border-light shadow-sm">
            {/* Header */}
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-app-text-secondary" />
                    <h3 className="text-lg font-semibold text-app-text-primary">Filters</h3>
                </div>
            </CardHeader>

            {/* Filters Row */}
            <CardContent className="pt-0 pb-3 flex flex-wrap gap-4 items-end">
                {/* Location Filter */}
                <div className="flex-1 min-w-[200px] space-y-2">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-app-green-primary" />
                        <span className="text-sm font-medium text-app-text-primary">Location</span>
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
                        <TrendingUp className="h-4 w-4 text-app-purple-primary" />
                        <span className="text-sm font-medium text-app-text-primary">Maturity</span>
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
                        <Building className="h-4 w-4 text-app-blue-primary" />
                        <span className="text-sm font-medium text-app-text-primary">Sector</span>
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
                        className="text-app-text-secondary hover:text-app-text-primary whitespace-nowrap"
                        onClick={() => {
                            setSelectedLocations([]);
                            setSelectedMaturities([]);
                            setSelectedSectors([]);
                        }}
                    >
                        Clear All Filters
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}