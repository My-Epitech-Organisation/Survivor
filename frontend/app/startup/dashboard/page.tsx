"use client";

import StartupNavigation from "@/components/StartupNavigation";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { authenticatedFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { TbLoader3 } from "react-icons/tb";
import { Button } from "@/components/ui/button";
import {
  Download,
  Building2,
  MapPin,
  Calendar,
  Globe,
  Users,
  FileText,
  Scale,
  Target,
  Activity,
  ExternalLink,
} from "lucide-react";
import { api } from "@/lib/api";
import { ProjectDetailsProps } from "@/types/project";

interface UserProfile {
  name: string;
  pictureURL: string;
  nbStartups: number;
  email: string;
  investorId: number;
  founderId: number;
  id: number;
}

export default function StartupDashboard() {
  const { user, isLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [project, setProject] = useState<ProjectDetailsProps[] | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    setIsDataLoading(true);
    if (isLoading || !user || !user.id) {
      if (!isLoading && !user) {
        setIsDataLoading(false);
      }
      return;
    }

    const fetchDataSequentially = async () => {
      try {
        const userProfileResponse = await authenticatedFetch(
          `/user/${user.id}`
        );
        if (!userProfileResponse.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const userProfileData: UserProfile = await userProfileResponse.json();
        setUserProfile(userProfileData);

        if (userProfileData.founderId) {
          try {
            const projectData = await api.get<ProjectDetailsProps[] | null>(
              `/projects/founder/${userProfileData.founderId}`
            );
            setProject(projectData.data);
          } catch (error) {
            console.error("Error fetching projects:", error);
          }
        } else {
          console.warn("User has no founderId, skipping project fetch");
        }
      } catch (error) {
        console.error("Error in data fetch sequence:", error);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchDataSequentially();
  }, [user, isLoading]);

  const currentProject = project && project.length > 0 ? project[0] : null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const exportProfileToPDF = async () => {
    setIsExporting(true);
    try {
      const token = document.cookie
        .split(";")
        .find((cookie) => cookie.trim().startsWith("authToken="))
        ?.split("=")[1]
        ?.trim();

      if (!token) {
        console.error("Authentication token not found");
        return;
      }

      const response = await fetch(`/api/pdf/project/${token}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `project-report.pdf`;
      a.style.display = "none";
      a.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-app-gradient-from to-app-gradient-to flex flex-col">
      <StartupNavigation />

      <main className="px-4 sm:px-6 lg:px-8 py-12 flex-1 flex flex-col items-center">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-app-text-primary mb-6">
            Project Profile
          </h1>
          <p className="text-xl text-app-text-secondary max-w-3xl mx-auto mb-8">
            Complete overview of your startup project including company details,
            founders information, business needs, and project status.
          </p>
        </div>

        {isLoading || isDataLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <TbLoader3 className="size-12 animate-spin text-app-blue-primary mb-4" />
            <p className="text-app-text-secondary text-lg">
              {isLoading
                ? "Authentification approvement ..."
                : "Data loading ..."}
            </p>
          </div>
        ) : (
          <>
            {!currentProject ? (
              <div className="text-center py-12">
                <Building2 className="size-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-600 mb-2">
                  No Project Found
                </h2>
                <p className="text-gray-500">
                  You don't have any projects associated with your account yet.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-8 gap-6 mb-8 max-w-6xl">
                  <div className="col-span-full flex justify-end">
                    <Button
                      className="bg-app-blue-primary hover:bg-app-blue-primary-hover text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 font-medium cursor-pointer"
                      onClick={exportProfileToPDF}
                    >
                      {isExporting ? (
                        <>
                          <TbLoader3 className="size-4 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Download className="size-4" />
                          <span>Export Profile</span>
                        </>
                      )}
                    </Button>
                  </div>
                  {/* Main Header Card */}
                  <Card className="mb-8 col-span-4 h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                          <AvatarImage
                            src={userProfile?.pictureURL}
                            alt={userProfile?.name || ""}
                          />
                          <AvatarFallback className="text-2xl">
                            {userProfile?.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || ""}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h2 className="text-3xl font-bold text-app-text-primary">
                            {userProfile?.name || ""}
                          </h2>
                          <p className="text-app-text-secondary text-lg mt-1">
                            {currentProject.ProjectFounders.length > 1 && (
                              <span>Co-</span>
                            )}
                            Founder of {currentProject.ProjectName}
                          </p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                  </Card>

                  {/* Project Name & Description - Large Card */}
                  <Card className="md:col-span-4 lg:col-span-4 h-full gap-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-4 text-2xl">
                        <Building2 className="h-8 w-8 text-app-blue-primary" />
                        {currentProject.ProjectName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 leading-relaxed">
                        {currentProject.ProjectDescription}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Sector */}
                  <Card className="col-span-2 row-span-2">
                    <CardContent className="p-6 flex flex-col gap-8">
                      <div className="flex items-start gap-3">
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <Target className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Sector
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {currentProject.ProjectSector}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <Activity className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Maturity
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {currentProject.ProjectMaturity}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-3 bg-orange-100 rounded-lg">
                          <Activity className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Project Status
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {currentProject.ProjectStatus}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-3 bg-indigo-100 rounded-lg">
                          <Scale className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Legal Status
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {currentProject.ProjectLegalStatus}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Location */}
                  <Card className="col-span-3">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <MapPin className="h-6 w-6 text-app-blue-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Location
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {currentProject.ProjectAddress}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Creation Date */}
                  <Card className="col-span-3">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                          <Calendar className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Founded
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {formatDate(currentProject.ProjectCreatedAt)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Founders - Wide Card */}
                  <Card className="md:col-span-4 lg:col-span-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-green-600" />
                        Founders
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {currentProject.ProjectFounders.map(
                          (founder, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
                            >
                              <Avatar className="h-12 w-12">
                                <AvatarImage
                                  src={founder.FounderPictureURL}
                                  alt={founder.FounderName}
                                />
                                <AvatarFallback>
                                  {founder.FounderName.split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {founder.FounderName}
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Needs - Full Width Card */}
                  <Card className="md:col-span-3 lg:col-span-4">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-red-600" />
                        Project Needs
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed text-lg">
                        {currentProject.ProjectNeeds}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Website */}
                  {currentProject.ProjectWebsite && (
                    <Card className="col-span-2">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3">
                          <div className="p-3 bg-cyan-100 rounded-lg">
                            <Globe className="h-6 w-6 text-cyan-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600 mb-1">
                              Website
                            </p>
                            <a
                              href={
                                currentProject.ProjectWebsite.startsWith("http")
                                  ? currentProject.ProjectWebsite
                                  : `https://${currentProject.ProjectWebsite}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-app-blue-primary hover:text-blue-800 flex items-center gap-1 font-medium"
                            >
                              Visit Website
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Social Media */}
                  {currentProject.ProjectSocial && (
                    <Card className="col-span-2">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3">
                          <div className="p-3 bg-pink-100 rounded-lg">
                            <Users className="h-6 w-6 text-pink-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600 mb-1">
                              Social Media
                            </p>
                            <a
                              href={
                                currentProject.ProjectSocial.startsWith("http")
                                  ? currentProject.ProjectSocial
                                  : `https://${currentProject.ProjectSocial}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-app-blue-primary hover:text-blue-800 flex items-center gap-1 font-medium"
                            >
                              Follow Us
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
