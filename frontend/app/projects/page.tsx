"use client"
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ProjectOverview from '@/components/ProjectOverview';
import ProjectFilters from '@/components/ProjectFilters';
import { ProjectFiltersProps, ProjectOverviewProps } from '@/types/project';
import { useEffect, useState, useCallback } from 'react';
import { getAPIUrl } from "@/lib/com-config";
import axios from 'axios';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {Download, FileText, FileSpreadsheet} from "lucide-react";

// const projects: ProjectOverviewProps[] = [
//   {
//     ProjectId: 1,
//     ProjectName: "EcoLoop",
//     ProjectDescription: "Marketplace for sustainable home goods.",
//     ProjectLocation: "Ireland",
//     ProjectMaturity: "Idea",
//     ProjectStatus: "Growth",
//     ProjectNeeds: "Talent Acquisition",
//     ProjectSector: "DeepTech"
//   },
//     {
//     ProjectId: 2,
//     ProjectName: "HealthBridge",
//     ProjectDescription: "Virtual learning environment with AI tutors.",
//     ProjectLocation: "Netherlands",
//     ProjectMaturity: "Early Stage",
//     ProjectStatus: "Growth",
//     ProjectNeeds: "Strategic Partnerships",
//     ProjectSector: "DeepTech"
//   },
//   {
//     ProjectId: 3,
//     ProjectName: "UrbanNest",
//     ProjectDescription: "MAutomated greenhouse system for urban farming.",
//     ProjectLocation: "Finland",
//     ProjectMaturity: "Prototype",
//     ProjectStatus: "Seed",
//     ProjectNeeds: "Strategic Partnerships",
//     ProjectSector: "FinTech"
//   },
//   {
//     ProjectId: 4,
//     ProjectName: "BrightPath",
//     ProjectDescription: "Gamified e-learning platform for remote students.",
//     ProjectLocation: "Finland",
//     ProjectMaturity: "Idea",
//     ProjectStatus: "Early Stage",
//     ProjectNeeds: "Mentorship",
//     ProjectSector: "SaaS"
//   },
//   {
//     ProjectId: 5,
//     ProjectName: "AgroNova",
//     ProjectDescription: "App to connect caregivers with families in need.",
//     ProjectLocation: "Spain",
//     ProjectMaturity: "MVP",
//     ProjectStatus: "Scale-up",
//     ProjectNeeds: "Talent Acquisition",
//     ProjectSector: "Logistics"
//   },
//   {
//     ProjectId: 6,
//     ProjectName: "SkillSpark",
//     ProjectDescription: "Electric vehicle fleet management platform.",
//     ProjectLocation: "Portugal",
//     ProjectMaturity: "MVP",
//     ProjectStatus: "Scale-up",
//     ProjectNeeds: "Talent Acquisition",
//     ProjectSector: "DeepTech"
//   },
// ];


export default function Projects() {
  const [projects, setProjects] = useState<ProjectOverviewProps[]>([]);

  const [locations, setLocations] = useState<string[]>([]);
  const [maturities, setMaturities] = useState<string[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);

  const [activeFilters, setActiveFilters] = useState({
    locations: [] as string[],
    maturities: [] as string[],
    sectors: [] as string[]
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const APIUrl = getAPIUrl();
        console.debug("Fetching from:", `${APIUrl}/projects/`);
        const response = await axios.get<ProjectOverviewProps[]>(`${APIUrl}/projects/`);
        setProjects(response.data);
        console.debug("Projects loaded:", response.data);
        
        // Utiliser response.data directement au lieu de projects
        const uniqueLocations = [...new Set(response.data.map(project => project.ProjectLocation))];
        const uniqueMaturities = [...new Set(response.data.map(project => project.ProjectMaturity))];
        const uniqueSectors = [...new Set(response.data.map(project => project.ProjectSector))];

        setLocations(uniqueLocations);
        setMaturities(uniqueMaturities);
        setSectors(uniqueSectors);
      } catch (error) {
        console.error('Erreur API:', error);
      }
    };

    fetchProjects();
  }, []);

  const handleFiltersChange = useCallback((filters: {
    locations: string[];
    maturities: string[];
    sectors: string[];
  }) => {
    setActiveFilters(filters);
  }, []);

  const getFilteredProjects = () => {
    return projects.filter(project => {
      const locationMatch = activeFilters.locations.length === 0 ||
        activeFilters.locations.includes(project.ProjectLocation);
      const maturityMatch = activeFilters.maturities.length === 0 ||
        activeFilters.maturities.includes(project.ProjectMaturity);
      const sectorMatch = activeFilters.sectors.length === 0 ||
        activeFilters.sectors.includes(project.ProjectSector);
      return locationMatch && maturityMatch && sectorMatch;
    });
  };

  const filteredProjects = getFilteredProjects();

  const projectFilter: ProjectFiltersProps = {
    ProjectLocation: locations,
    ProjectMaturity: maturities,
    ProjectSector: sectors,
    onFiltersChange: handleFiltersChange
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      <main className="flex-1 py-6">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Projects</h1>

          {/* Filters and Export Section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            {/* Filters Section */}
            <div className="lg:col-span-4">
              <ProjectFilters {...projectFilter}/>
            </div>
            
            {/* Export Section */}
            {/* <div className="lg:col-span-1">
              <Card className="h-fit bg-white border border-gray-200 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Export</h3>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 hover:bg-blue-50 hover:border-blue-200"
                  >
                    <FileText className="h-4 w-4 text-blue-600" />
                    Export as PDF
                  </Button>
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-400 text-center">
                      {filteredProjects.length} projects to export
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>*/}
          </div>
          

          {/* Projects Grid */}
          <div className='grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6'>
            {filteredProjects.map(project => (
              <ProjectOverview key={project.ProjectId} ProjectId={project.ProjectId} ProjectName={project.ProjectName} ProjectDescription={project.ProjectDescription} ProjectLocation={project.ProjectLocation} ProjectMaturity={project.ProjectMaturity} ProjectNeeds={project.ProjectNeeds} ProjectSector={project.ProjectSector} ProjectStatus={project.ProjectStatus}/>
            ))}
          </div>

          {/* Message si aucun projet trouvé */}
          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No projects found matching your filters.</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your filter criteria.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
