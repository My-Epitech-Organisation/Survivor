"use client";
import AdminNavigation from "@/components/AdminNavigation";
import ProjectOverviewAdmin from "@/components/ProjectOverviewAdmin";
import { useEffect, useState, useRef } from "react";
import { FormProjectDetails, ProjectOverviewProps } from "@/types/project";
import { api } from "@/lib/api";
import { FaPlus } from "react-icons/fa";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
} from "@radix-ui/react-dialog";
import AdminProjectForm from "@/components/AdminProjectForm";
import { TbLoader3 } from "react-icons/tb";

export default function AdminProjects() {
  const [projects, setProjects] = useState<ProjectOverviewProps[]>([]);
  const closeDialogRef = useRef<HTMLButtonElement>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const handleNewProjectSubmit = (data: FormProjectDetails) => {
    api
      .post("/projects/", data)
      .then((response) => {
        console.log("Project created successfully:", response.data);
        if (closeDialogRef.current) {
          closeDialogRef.current.click();
        }
        fetchProjects();
      })
      .catch((error) => {
        console.error("Error creating project:", error);
      });
  };

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
      setIsDataLoading(false);
    } catch (error) {
      console.error("Erreur API:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-app-gradient-from to-app-gradient-to">
      <AdminNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isDataLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <TbLoader3 className="size-12 animate-spin text-blue-600 mb-4" />
            <p className="text-app-text-secondary text-lg">
              Loading projects...
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-app-text-primary">
                Projects Management
              </h1>
              <Dialog>
                <DialogTrigger
                  className="inline-flex items-center justify-center gap-2 bg-app-blue-primary hover:bg-app-blue-primary-hover rounded-lg px-6 py-3 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 group"
                  onClick={(e) => {
                    const button = e.currentTarget;
                    button.classList.add("scale-95");
                    setTimeout(() => button.classList.remove("scale-95"), 150);
                    console.log("Add new project clicked");
                  }}
                >
                  <div className="relative w-5 h-5 flex items-center justify-center">
                    <FaPlus className="h-5 w-5 text-white absolute transition-all duration-300 opacity-100 group-hover:rotate-90" />
                  </div>
                  <span className="hidden md:block text-white font-medium">
                    Add New Project
                  </span>
                </DialogTrigger>
                <DialogOverlay className="fixed inset-0 bg-black/50 z-40" />
                <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-0 w-[95%] max-w-[1200px] max-h-[85vh] shadow-lg z-50 flex flex-col">
                  <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10 rounded-t-lg">
                    <DialogTitle className="text-xl font-bold">
                      Add New Project
                    </DialogTitle>
                    <DialogClose asChild ref={closeDialogRef}>
                      <button
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors focus:outline-none"
                        aria-label="Close"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </DialogClose>
                  </div>
                  <div className="p-4 md:p-6 overflow-y-auto">
                    <AdminProjectForm onSubmit={handleNewProjectSubmit} />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {/* Projects content placeholder */}
            <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">
              {projects.map((project) => (
                <ProjectOverviewAdmin key={project.ProjectId} {...project} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
