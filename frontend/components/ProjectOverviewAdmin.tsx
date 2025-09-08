"use client";

import { Button } from "@/components/ui/button";
import {
  ProjectOverviewProps,
  ProjectDetailsProps,
  FormProjectDetails,
} from "@/types/project";
import { FaTrash, FaTrashAlt, FaPencilAlt } from "react-icons/fa";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MapPin,
  Building,
  TrendingUp,
  Target,
  CheckCircle,
} from "lucide-react";
import { useState, useRef } from "react";
import { api } from "@/lib/api";
import AdminProjectForm from "./AdminProjectForm";
import { Founder, MinimalFounder } from "@/types/founders";

export default function ProjectOverviewAdmin(props: ProjectOverviewProps) {
  const [formData, setFormData] = useState<FormProjectDetails>();
  const closeDialogRef = useRef<HTMLButtonElement>(null);

  const handleEditProjectSubmit = (data: FormProjectDetails) => {

    const apiData = {
      ...data,
      ProjectFounders: data.ProjectFounders.map((founder) => ({
        name: founder.name,
        picture: founder.picture,
      })),
    };

    api
      .put(`/projects/${props.ProjectId}/`, apiData)
      .then((response) => {
        if (closeDialogRef.current) {
          closeDialogRef.current.click();
        }
        // window.location.reload();
      })
      .catch((error) => {
        console.error("Error updating project:", error);
      });
  };

  const handleDeleteProject = () => {
    api
      .delete(`/projects/${props.ProjectId}/`)
      .then((response) => {
        if (closeDialogRef.current) {
          closeDialogRef.current.click();
        }
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error deleting project:", error);
      });
  };

  const FounderToMinimalFounder = (data: Founder[]): MinimalFounder[] => {
    return data.map((founder) => ({
      name: founder.FounderName,
      picture: founder.FounderPictureURL,
    }));
  };

  const fetchProject = async () => {
    try {
      const response = await api.get<ProjectDetailsProps>(
        {endpoint:`/projects/${props.ProjectId}`}
      );
      if (!response.data) {
        console.error("No project data found");
        return;
      }
      const details = response.data;
      setFormData({
        ProjectName: details.ProjectName || "",
        ProjectDescription: details.ProjectDescription || "",
        ProjectSector: details.ProjectSector || "",
        ProjectMaturity: details.ProjectMaturity || "",
        ProjectAddress: details.ProjectAddress || "",
        ProjectLegalStatus: details.ProjectLegalStatus || "",
        ProjectCreatedAt: details.ProjectCreatedAt || "",
        ProjectFounders: FounderToMinimalFounder(details.ProjectFounders) || [],
        ProjectEmail: details.ProjectEmail || "",
        ProjectPhone: details.ProjectPhone || "",
        ProjectWebsite: details.ProjectWebsite || "",
        ProjectSocial: details.ProjectSocial || "",
        ProjectNeeds: details.ProjectNeeds || "",
        ProjectStatus: details.ProjectStatus || "",
      });
    } catch (error) {
      console.error("Erreur API:", error);
    }
  };

  return (
    <Card className="w-full hover:shadow-xl transition-all duration-300 border border-app-border-light bg-app-surface overflow-hidden flex flex-col h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-center text-lg font-bold text-app-text-primary mb-2">
          {props.ProjectName}
        </CardTitle>
        {props.ProjectDescription && (
          <CardDescription className="text-center text-app-text-secondary leading-relaxed text-sm">
            {props.ProjectDescription}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="p-4 space-y-6 flex-1 flex flex-col">
        {/* Project Info Grid */}
        <div className="grid grid-cols-1 gap-6 flex-1">
          {/* Sector & Location */}
          <div className="flex items-start gap-4">
            {props.ProjectSector && (
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Building className="h-4 w-4 text-app-blue-primary" />
                  <h4 className="font-medium text-app-text-primary text-sm">
                    Sector
                  </h4>
                </div>
                <div className="w-full text-center">
                  <span className="text-sm font-medium text-app-blue-primary">
                    {props.ProjectSector}
                  </span>
                </div>
              </div>
            )}

            {props.ProjectSector && props.ProjectLocation && (
              <div className="w-px h-12 bg-gray-300"></div>
            )}

            {props.ProjectLocation && (
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="h-4 w-4 text-app-green-primary" />
                  <h4 className="font-medium text-app-text-primary text-sm">
                    Location
                  </h4>
                </div>
                <div className="w-full text-center">
                  <span className="text-sm font-medium text-app-green-primary">
                    {props.ProjectLocation}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Maturity & Status */}
          <div className="flex items-start gap-4">
            {props.ProjectMaturity && (
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp className="h-4 w-4 text-app-purple-primary" />
                  <h4 className="font-medium text-app-text-primary text-sm">
                    Maturity
                  </h4>
                </div>
                <div className="w-full text-center">
                  <span className="text-sm font-medium text-app-purple-primary">
                    {props.ProjectMaturity}
                  </span>
                </div>
              </div>
            )}

            {props.ProjectMaturity && props.ProjectStatus && (
              <div className="w-px h-12 bg-app-border-light"></div>
            )}

            {props.ProjectStatus && (
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4 text-app-green-primary" />
                  <h4 className="font-medium text-app-text-primary text-sm">
                    Status
                  </h4>
                </div>
                <div className="w-full text-center">
                  <span className="text-sm font-medium text-app-green-primary">
                    {props.ProjectStatus}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Needs Section */}
          {props.ProjectNeeds && (
            <div className="pt-2">
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Target className="h-4 w-4 text-app-orange-primary" />
                  <h4 className="font-medium text-app-text-primary text-sm">
                    Project Needs
                  </h4>
                </div>
                <div className="rounded-lg p-3">
                  <p className="text-sm text-gray-700 text-center">
                    {props.ProjectNeeds}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* More Information Button */}
        <div className="pt-7 h-[8vh] border-t grid grid-cols-2 gap-4 border-app-border-light mt-auto space-y-0">
          <Dialog>
            <DialogTrigger
              className="rounded-md w-full text-app-white hover:text-app-white bg-app-blue-primary hover:bg-app-blue-primary-hover cursor-pointer transition-all duration-300 group"
              onClick={() => fetchProject()}
            >
              <div className="flex items-center justify-center gap-2">
                <FaPencilAlt className="h-3.5 w-3.5" />
                <span>Edit</span>
              </div>
            </DialogTrigger>
            <DialogOverlay className="fixed inset-0 bg-black/50 z-40" />
            <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-0 min-w-[62%] max-h-[85vh] shadow-lg z-50 flex flex-col">
              <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10 rounded-t-lg">
                <DialogTitle className="text-xl font-bold">
                  Edit Project
                </DialogTitle>
                <DialogClose
                  className="h-6 w-6 rounded-full hover:bg-gray-200 flex items-center justify-center"
                  ref={closeDialogRef}
                >
                  <span className="sr-only">Close</span>
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
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </DialogClose>
              </div>
              <div className="p-4 md:p-6 overflow-y-auto">
                <AdminProjectForm
                  defaultData={formData}
                  onSubmit={handleEditProjectSubmit}
                />
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger
              className="rounded-md w-full text-app-white hover:text-app-white bg-red-600 hover:bg-red-700 transition-all duration-300 flex items-center justify-center gap-2 group"
              onClick={() => fetchProject()}
            >
              <div className="flex items-center justify-center gap-2">
                <div className="relative h-4 w-4 flex items-center justify-center">
                  <FaTrashAlt className="h-4 w-4 absolute transition-opacity duration-200 opacity-100 group-hover:opacity-0" />
                  <FaTrash className="h-4 w-4 absolute transition-opacity duration-200 opacity-0 group-hover:opacity-100" />
                </div>
                <span>Delete</span>
              </div>
            </DialogTrigger>
            <DialogOverlay className="fixed inset-0 bg-black/50 z-40" />
            <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-0 min-w-[15%] max-h-[85vh] shadow-lg z-50 flex flex-col">
              <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10 rounded-t-lg">
                <DialogTitle className="text-xl font-bold">
                  Delete Project
                </DialogTitle>
                <DialogClose
                  className="h-6 w-6 rounded-full hover:bg-gray-200 flex items-center justify-center"
                  ref={closeDialogRef}
                >
                  <span className="sr-only">Close</span>
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
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </DialogClose>
              </div>
              <div className="p-4 md:p-6 overflow-y-auto">
                Are you sure you want to delete this project ? This action
                cannot be undone.
                <div className="mt-4">
                  <Button
                    className="w-full text-app-white bg-red-600 hover:bg-red-700 transition-all duration-300"
                    onClick={handleDeleteProject}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
