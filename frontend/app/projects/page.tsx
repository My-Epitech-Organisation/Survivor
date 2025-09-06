"use client";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProjectOverview from "@/components/ProjectOverview";
import ProjectFilters from "@/components/ProjectFilters";
import { ProjectFiltersProps, ProjectOverviewProps } from "@/types/project";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

export default function Projects() {
  const [projects, setProjects] = useState<ProjectOverviewProps[]>([]);

  const [locations, setLocations] = useState<string[]>([]);
  const [maturities, setMaturities] = useState<string[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);

  const [activeFilters, setActiveFilters] = useState({
    locations: [] as string[],
    maturities: [] as string[],
    sectors: [] as string[],
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        console.debug("Fetching projects from API");
        const response = await api.get<ProjectOverviewProps[]>("/projects/");
        if (!response.data) {
          console.error("No project data found");
          return;
        }
        setProjects(response.data);
        console.debug("Projects loaded:", response.data);

        const uniqueLocations = [
          ...new Set(
            response.data.map(
              (project: ProjectOverviewProps) => project.ProjectLocation
            )
          ),
        ];
        const uniqueMaturities = [
          ...new Set(
            response.data.map(
              (project: ProjectOverviewProps) => project.ProjectMaturity
            )
          ),
        ];
        const uniqueSectors = [
          ...new Set(
            response.data.map(
              (project: ProjectOverviewProps) => project.ProjectSector
            )
          ),
        ];

        setLocations(uniqueLocations as string[]);
        setMaturities(uniqueMaturities as string[]);
        setSectors(uniqueSectors as string[]);
      } catch (error) {
        console.error("Erreur API:", error);
      }
    };

    fetchProjects();
  }, []);

  const handleFiltersChange = useCallback(
    (filters: {
      locations: string[];
      maturities: string[];
      sectors: string[];
    }) => {
      setActiveFilters(filters);
    },
    []
  );

  const getFilteredProjects = () => {
    return projects.filter((project) => {
      const locationMatch =
        activeFilters.locations.length === 0 ||
        activeFilters.locations.includes(project.ProjectLocation);
      const maturityMatch =
        activeFilters.maturities.length === 0 ||
        activeFilters.maturities.includes(project.ProjectMaturity);
      const sectorMatch =
        activeFilters.sectors.length === 0 ||
        activeFilters.sectors.includes(project.ProjectSector);
      return locationMatch && maturityMatch && sectorMatch;
    });
  };

  const filteredProjects = getFilteredProjects();

  const projectFilter: ProjectFiltersProps = {
    ProjectLocation: locations,
    ProjectMaturity: maturities,
    ProjectSector: sectors,
    onFiltersChange: handleFiltersChange,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-app-gradient-from to-app-gradient-to flex flex-col">
      <Navigation />

      <main className="flex-1 py-6">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-bold text-app-text-primary mb-6">
            Projects
          </h1>

          {/* Filters and Export Section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            {/* Filters Section */}
            <div className="lg:col-span-4">
              <ProjectFilters {...projectFilter} />
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
          <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">
            {filteredProjects.map((project) => (
              <ProjectOverview
                key={project.ProjectId}
                ProjectId={project.ProjectId}
                ProjectName={project.ProjectName}
                ProjectDescription={project.ProjectDescription}
                ProjectLocation={project.ProjectLocation}
                ProjectMaturity={project.ProjectMaturity}
                ProjectNeeds={project.ProjectNeeds}
                ProjectSector={project.ProjectSector}
                ProjectStatus={project.ProjectStatus}
              />
            ))}
          </div>

          {/* Message si aucun projet trouvé */}
          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-app-text-secondary text-lg">
                No projects found matching your filters.
              </p>
              <p className="text-app-text-muted text-sm mt-2">
                Try adjusting your filter criteria.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
