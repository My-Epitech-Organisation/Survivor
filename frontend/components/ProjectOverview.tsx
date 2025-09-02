"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProjectOverviewProps, ProjectDetailsProps } from "@/types/project"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MapPin, Building, TrendingUp, Target, CheckCircle, Info } from "lucide-react"
import ProjectDetails from "./ProjectDetails"
import { useState, useEffect } from "react"
import { getAPIUrl } from "@/lib/socket-config"
import axios from "axios"

export default function ProjectOverview(props : ProjectOverviewProps) {
    // const [projectDetails, setprojectDetails] = useState<ProjectDetailsProps>([]);

    // useEffect(() => {
    // const fetchProject = async () => {
    //     try {
    //         const APIUrl = getAPIUrl();
    //         console.log(APIUrl);
    //         console.log("Fetching from:", `${APIUrl}/projects/${props.ProjectId}`);
    //         const response = await axios.get<ProjectDetailsProps>(`${APIUrl}/projects/${props.ProjectId}`);
    //         setprojectDetails(response.data);
    //         console.log("Projet loaded:", projectDetails);
    //     } catch (error) {
    //         console.error('Erreur API:', error);
    //     }
    // };
    // fetchProject();
    // }, []);


    const projectDetails: ProjectDetailsProps = {
        ProjectId: props.ProjectId,
        ProjectName: props.ProjectName,
        ProjectDescription: props.ProjectDescription,
        ProjectSector: props.ProjectSector,
        ProjectMaturity: props.ProjectMaturity,
        ProjectAdress: props.ProjectLocation,
        ProjectLegalStatus: "SAS",
        ProjectCreatedAt: "2024-01-15",
        ProjectFounders: [
            { FounderID: 1, FounderName: "John Doe", FounderStartupID: 1, FounderPictureURL: "blob:https://api.jeb-incubator.com/d4809f40-e0e5-4759-a3a4-0a50725d2afe" },
            { FounderID: 2, FounderName: "Jane Smith", FounderStartupID: 1, FounderPictureURL: "" }
        ],
        ProjectEmail: "contact@example.com",
        ProjectPhone: "+33 1 23 45 67 89",
        ProjectNeeds: props.ProjectNeeds,
        ProjectProgess: "Initial development phase completed. Working on MVP development and first client acquisition.",
        ProjectStatus: props.ProjectStatus,
        ProjectSocial: "@example_startup",
        ProjectWebsite: "https://example.com",
    };

    return (
        <Card className="w-full hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white overflow-hidden flex flex-col h-full">
            <CardHeader className="pb-4">
                <CardTitle className="text-center text-lg font-bold text-gray-900 mb-2">
                    {props.ProjectName}
                </CardTitle>
                {props.ProjectDescription && (
                    <CardDescription className="text-center text-gray-600 leading-relaxed text-sm">
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
                                    <Building className="h-4 w-4 text-blue-600" />
                                    <h4 className="font-medium text-gray-900 text-sm">Sector</h4>
                                </div>
                                <div className="w-full text-center">
                                    <span className="text-sm font-medium text-blue-700">
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
                                    <MapPin className="h-4 w-4 text-emerald-600" />
                                    <h4 className="font-medium text-gray-900 text-sm">Location</h4>
                                </div>
                                <div className="w-full text-center">
                                    <span className="text-sm font-medium text-emerald-700">
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
                                    <TrendingUp className="h-4 w-4 text-purple-600" />
                                    <h4 className="font-medium text-gray-900 text-sm">Maturity</h4>
                                </div>
                                <div className="w-full text-center">
                                    <span className="text-sm font-medium text-purple-700">
                                        {props.ProjectMaturity}
                                    </span>
                                </div>
                            </div>
                        )}
                        
                        {props.ProjectMaturity && props.ProjectStatus && (
                            <div className="w-px h-12 bg-gray-300"></div>
                        )}
                        
                        {props.ProjectStatus && (
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <h4 className="font-medium text-gray-900 text-sm">Status</h4>
                                </div>
                                <div className="w-full text-center">
                                    <span className="text-sm font-medium text-green-700">
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
                                    <Target className="h-4 w-4 text-orange-600" />
                                    <h4 className="font-medium text-gray-900 text-sm">Project Needs</h4>
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
                <div className="pt-6 border-t border-gray-100 mt-auto">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full text-white hover:text-white bg-blue-400 hover:bg-blue-500">
                                <Info className="h-4 w-4 mr-2" />
                                More Information
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[100vw] sm:max-w-[98vw] w-[100vw] sm:w-[98vw] min-h-[100vh] sm:min-h-[80dvh] max-h-[100vh] sm:max-h-[98vh] overflow-y-auto p-0 rounded-none sm:rounded-lg [&>button]:!w-12 [&>button]:!h-12 [&>button]:!flex [&>button]:!items-center [&>button]:!justify-center [&>button>svg]:!w-6 [&>button>svg]:!h-6">
                            <DialogHeader className="border-b pb-3 sm:pb-6 px-3 sm:px-8 pt-8 sm:pt-8">
                                <DialogTitle className="text-lg sm:text-3xl font-light">Project Details - {props.ProjectName}</DialogTitle>
                            </DialogHeader>
                            <div className="px-3 sm:px-8 pb-3 sm:pb-8">
                                <ProjectDetails {...projectDetails} />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardContent>
        </Card>
    );
}