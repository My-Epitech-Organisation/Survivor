"use client";

import { Button } from "@/components/ui/button";
import { ProjectOverviewProps, ProjectDetailsProps } from "@/types/project";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MapPin,
  Building,
  TrendingUp,
  Target,
  CheckCircle,
  Info,
} from "lucide-react";
import ProjectDetails from "./ProjectDetails";
import { useState } from "react";
import { api } from "@/lib/api";

export default function ProjectOverview(props: ProjectOverviewProps) {
  const [projectDetails, setprojectDetails] = useState<ProjectDetailsProps>();

  const fetchProject = async () => {
    try {
      const response = await api.get<ProjectDetailsProps>(
        {endpoint:`/projects/${props.ProjectId}`}
      );
      if (!response.data) {
        console.error("No project details found");
        return;
      }
      setprojectDetails(response.data);
    } catch (error) {
      console.error("Erreur API:", error);
    }
  };

  return (
    <Card className="w-full hover:shadow-xl transition-all duration-300 border border-app-border-light bg-app-surface overflow-hidden flex flex-col h-full">
      <CardHeader className="pb-4">
        <CardTitle className="font-heading text-center text-lg font-bold text-app-text-primary mb-2">
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
          <div className="flex items-center justify-around gap-6 px-6">
            {props.ProjectSector && (
              <div className="flex-1">
                <div className="flex items-center justify-start gap-2">
                  <Building className="h-4 w-4 text-app-blue-primary" />
                  <h4 className="font-heading font-regular text-app-text-primary text-sm">
                    Sector
                  </h4>
                </div>
                <div className="w-full">
                  <span className="text-sm font-semibold">
                    {props.ProjectSector}
                  </span>
                </div>
              </div>
            )}

            {props.ProjectSector && props.ProjectLocation && (
              <div className="w-px h-12 bg-app-border-light"></div>
            )}

            {props.ProjectLocation && (
              <div className="flex-1">
                <div className="flex items-center justify-start gap-2">
                  <MapPin className="h-4 w-4 text-app-green-primary" />
                  <h4 className="font-heading font-regular text-app-text-primary text-sm">
                    Location
                  </h4>
                </div>
                <div className="w-full">
                  <span className="text-sm font-semibold">
                    {props.ProjectLocation}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Maturity & Status */}
          <div className="flex items-center justify-around gap-6 px-6">
            {props.ProjectMaturity && (
              <div className="flex-1">
                <div className="flex items-center justify-start gap-2">
                  <TrendingUp className="h-4 w-4 text-app-purple-primary" />
                  <h4 className="font-heading font-regular text-app-text-primary text-sm">
                    Maturity
                  </h4>
                </div>
                <div className="w-full">
                  <span className="text-sm font-semibold">
                    {props.ProjectMaturity}
                  </span>
                </div>
              </div>
            )}

            {props.ProjectMaturity && props.ProjectStatus && (
              <div className="w-px h-12 bg-app-border-light"></div>
            )}

            {props.ProjectStatus && (
              <div className="flex-1">
                <div className="flex items-center justify-start gap-2">
                  <CheckCircle className="h-4 w-4 text-app-orange-primary" />
                  <h4 className="font-heading font-regular text-app-text-primary text-sm">
                    Status
                  </h4>
                </div>
                <div className="w-full">
                  <span className="text-sm font-semibold">
                    {props.ProjectStatus}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Needs Section */}
          {props.ProjectNeeds && (
            <div className="pt-2">
              <div className="space-y-1">
                <div className="flex items-center justify-start ml-2 gap-2">
                  <Target className="h-4 w-4 text-app-red-primary" />
                  <h4 className="font-heading font-regular text-app-text-primary text-sm">
                    Project Needs
                  </h4>
                </div>
                <div className="rounded-lg p-3 bg-app-surface-hover">
                  <p className="text-sm text-app-text-secondary text-center font-semibold">
                    {props.ProjectNeeds}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* More Information Button */}
        <div className="pt-6 border-t border-app-border-light mt-auto">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                onClick={() => fetchProject()}
                className="w-full font-bold text-app-white hover:text-app-white bg-jeb-primary hover:bg-jeb-hover cursor-pointer flex items-center"
              >
                <Info className="h-6 w-6 mr-2" />
                <span>More Information</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[100vw] sm:max-w-[98vw] w-[100vw] sm:w-[98vw] min-h-[100vh] sm:min-h-[80dvh] max-h-[100vh] sm:max-h-[98vh] overflow-y-auto p-0 rounded-none sm:rounded-lg">
              <DialogHeader className="border-b border-app-border-light bg-gradient-to-r from-jeb-five/15 to-jeb-gradient-to/50 px-6 sm:px-8 py-6 sm:py-8 pr-16 sm:pr-20">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="font-heading text-lg sm:text-xl md:text-3xl font-bold text-app-text-primary mb-1 sm:mb-2 truncate">
                      {props.ProjectName}
                    </DialogTitle>
                    <p className="text-xs sm:text-sm md:text-base text-app-text-secondary font-medium">
                      Project Details & Information
                    </p>
                  </div>
                </div>
              </DialogHeader>
              <div className="px-6 sm:px-8 py-6 sm:py-8 bg-app-surface-hover/30">
                {projectDetails && <ProjectDetails {...projectDetails} />}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
