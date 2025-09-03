"use client"
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ProjectOverview from '@/components/ProjectOverview';
import ProjectFilters from '@/components/ProjectFilters';
import { ProjectFiltersProps, ProjectOverviewProps } from '@/types/project';
import { useEffect, useState, useCallback } from 'react';

const projects: ProjectOverviewProps[] = [
  {
    ProjectId: 1,
    ProjectName: "EcoLoop",
    ProjectDescription: "Marketplace for sustainable home goods.",
    ProjectLocation: "Ireland",
    ProjectMaturity: "Idea",
    ProjectStatus: "Growth",
    ProjectNeeds: "Talent Acquisition",
    ProjectSector: "DeepTech"
  },
    {
    ProjectId: 2,
    ProjectName: "HealthBridge",
    ProjectDescription: "Virtual learning environment with AI tutors.",
    ProjectLocation: "Netherlands",
    ProjectMaturity: "Early Stage",
    ProjectStatus: "Growth",
    ProjectNeeds: "Strategic Partnerships",
    ProjectSector: "DeepTech"
  },
  {
    ProjectId: 3,
    ProjectName: "UrbanNest",
    ProjectDescription: "MAutomated greenhouse system for urban farming.",
    ProjectLocation: "Finland",
    ProjectMaturity: "Prototype",
    ProjectStatus: "Seed",
    ProjectNeeds: "Strategic Partnerships",
    ProjectSector: "FinTech"
  },
  {
    ProjectId: 4,
    ProjectName: "BrightPath",
    ProjectDescription: "Gamified e-learning platform for remote students.",
    ProjectLocation: "Finland",
    ProjectMaturity: "Idea",
    ProjectStatus: "Early Stage",
    ProjectNeeds: "Mentorship",
    ProjectSector: "SaaS"
  },
  {
    ProjectId: 5,
    ProjectName: "AgroNova",
    ProjectDescription: "App to connect caregivers with families in need.",
    ProjectLocation: "Spain",
    ProjectMaturity: "MVP",
    ProjectStatus: "Scale-up",
    ProjectNeeds: "Talent Acquisition",
    ProjectSector: "Logistics"
  },
  {
    ProjectId: 6,
    ProjectName: "SkillSpark",
    ProjectDescription: "Electric vehicle fleet management platform.",
    ProjectLocation: "Portugal",
    ProjectMaturity: "MVP",
    ProjectStatus: "Scale-up",
    ProjectNeeds: "Talent Acquisition",
    ProjectSector: "DeepTech"
  },
];


export default function Projects() {
  // const [projects, setProjects] = useState<ProjectOverviewProps[]>([]);
  // const [showActivityBar, setShowActivityBar] = useState<Checked>(false)

  // useEffect(() => {
  //   const fetchProjects = async () => {
  //     try {
  //       const APIUrl = getAPIUrl();
  //       console.log(APIUrl);
  //       console.log("Fetching from:", `${APIUrl}/projects/`);
  //       const response = await axios.get<ProjectOverviewProps[]>(`${APIUrl}/projects/`);
  //       setProjects(response.data);
  //       console.log("Projects loaded:", projects);
  //     } catch (error) {
  //       console.error('Erreur API:', error);
  //     }
  //   };

  //   fetchProjects();
  // }, []);

  const [locations, setLocations] = useState<string[]>([]);
  const [maturities, setMaturities] = useState<string[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);

  const [activeFilters, setActiveFilters] = useState({
    locations: [] as string[],
    maturities: [] as string[],
    sectors: [] as string[]
  });

  useEffect(() => {
    const uniqueLocations = [...new Set(projects.map(project => project.ProjectLocation))];
    const uniqueMaturities = [...new Set(projects.map(project => project.ProjectMaturity))];
    const uniqueSectors = [...new Set(projects.map(project => project.ProjectSector))];

    setLocations(uniqueLocations);
    setMaturities(uniqueMaturities);
    setSectors(uniqueSectors);
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
    <div className="min-h-screen bg-app-surface-hover flex flex-col">
      <Navigation />

      <main className="flex-1 py-6">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-bold text-app-text-primary mb-6">Projects</h1>

          {/* Filters */}
          <ProjectFilters {...projectFilter}/>

          {/* Projects Grid */}
          <div className='grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6'>
            {filteredProjects.map(project => (
              <ProjectOverview key={project.ProjectId} ProjectId={project.ProjectId} ProjectName={project.ProjectName} ProjectDescription={project.ProjectDescription} ProjectLocation={project.ProjectLocation} ProjectMaturity={project.ProjectMaturity} ProjectNeeds={project.ProjectNeeds} ProjectSector={project.ProjectSector} ProjectStatus={project.ProjectStatus}/>
            ))}
          </div>

          {/* Message si aucun projet trouvé */}
          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-app-text-secondary text-lg">No projects found matching your filters.</p>
              <p className="text-app-text-muted text-sm mt-2">Try adjusting your filter criteria.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
