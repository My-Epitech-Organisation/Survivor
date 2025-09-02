"use client"
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ProjectOverview from '@/components/ProjectOverview';
import { Card } from '@/components/ui/card';
import { ProjectOverviewProps } from '@/types/project';
import { useEffect, useState } from 'react';
import { getAPIUrl } from "@/lib/socket-config";
import axios from 'axios';

let projects: ProjectOverviewProps[] = [
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
    ProjectName: "EcoLoop",
    ProjectDescription: "Marketplace for sustainable home goods.",
    ProjectLocation: "Ireland",
    ProjectMaturity: "Idea",
    ProjectStatus: "Growth",
    ProjectNeeds: "Talent Acquisition",
    ProjectSector: "DeepTech"
  },
  {
    ProjectId: 4,
    ProjectName: "EcoLoop",
    ProjectDescription: "Marketplace for sustainable home goods.",
    ProjectLocation: "Ireland",
    ProjectMaturity: "Idea",
    ProjectStatus: "Growth",
    ProjectNeeds: "Talent Acquisition",
    ProjectSector: "DeepTech"
  },
  {
    ProjectId: 5,
    ProjectName: "EcoLoop",
    ProjectDescription: "Marketplace for sustainable home goods.",
    ProjectLocation: "Ireland",
    ProjectMaturity: "Idea",
    ProjectStatus: "Growth",
    ProjectNeeds: "Talent Acquisition",
    ProjectSector: "DeepTech"
  }
];


export default function Projects() {
  // const [projects, setProjects] = useState<ProjectOverviewProps[]>([]);
  // const [showActivityBar, setShowActivityBar] = useState<Checked>(false)

  // useEffect(() => {
  //   const fetchTodos = async () => {
  //     try {
  //       const APIUrl = getAPIUrl();
  //       console.log(APIUrl);
  //       console.log("Fetching from:", `${APIUrl}/projects/`);
  //       const response = await axios.get<ProjectOverviewProps[]>(`${APIUrl}/projects/`);
  //       setProjects(response.data);
  //       console.log("Todos loaded:", projects);
  //     } catch (error) {
  //       console.error('Erreur API:', error);
  //     }
  //   };

  //   fetchTodos();
  // }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      <main className="flex-1 py-6">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Projects</h1>
            <div className='grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6'>
              {projects.map(project => (
                <ProjectOverview key={project.ProjectId} ProjectId={project.ProjectId} ProjectName={project.ProjectName} ProjectDescription={project.ProjectDescription} ProjectLocation={project.ProjectLocation} ProjectMaturity={project.ProjectMaturity} ProjectNeeds={project.ProjectNeeds} ProjectSector={project.ProjectSector} ProjectStatus={project.ProjectStatus}/>
              ))}
            </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
