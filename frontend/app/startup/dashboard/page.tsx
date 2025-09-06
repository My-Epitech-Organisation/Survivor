"use client";

import StartupNavigation from "@/components/StartupNavigation";
import { ChartBarLabel } from "@/components/ChartBarLabel";
import { ChartRadialText } from "@/components/ChartRadialText";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authenticatedFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { TbLoader3 } from "react-icons/tb";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { api } from "@/lib/api";
import { ProjectDetailsProps } from "@/types/project";

function getProjectEngagementDescription(data: number) {
  if (data >= 100) {
    return "Perfect engagement, keep it up!";
  } else if (data >= 75) {
    return "Good engagement, maintain the momentum!";
  } else if (data >= 50) {
    return "Average engagement, consider boosting visibility.";
  } else if (data >= 25) {
    return "Poor engagement, we need to take action.";
  } else {
    return "Very poor engagement, immediate action required.";
  }
}

interface UserProfile {
  name: string;
  pictureURL: string;
  nbStartups: number;
  email: string;
  investorId: number;
  founderId: number;
  id: number;
}

interface ProjectViewsOverTime {
  month: string;
  views: number;
}

interface ProjectEngagement {
  rate: number;
}

interface ProjectEngagementData {
  browser: string;
  rate: number;
  fill: string;
}

export default function StartupDashboard() {
  const { user, isLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [project, setProject] = useState<ProjectDetailsProps[] | null>(null);
  const [projectViewsOverTime, setProjectViewsOverTime] = useState<
    ProjectViewsOverTime[]
  >([]);
  const [projectEngagement, setProjectEngagement] =
    useState<ProjectEngagement | null>(null);
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

        try {
          const projectViewsResponse = await authenticatedFetch(
            `/projectViews/${user.id}`
          );
          if (projectViewsResponse.ok) {
            const projectViewsData = await projectViewsResponse.json();
            setProjectViewsOverTime(projectViewsData);
          } else {
            console.warn("Failed to fetch project views");
          }
        } catch (error) {
          console.error("Error fetching project views:", error);
        }

        try {
          const projectEngagementResponse = await authenticatedFetch(
            `/projectEngagement/${user.id}`
          );
          if (projectEngagementResponse.ok) {
            const projectEngagementData =
              await projectEngagementResponse.json();
            setProjectEngagement(projectEngagementData);
          } else {
            console.warn("Failed to fetch project engagement");
          }
        } catch (error) {
          console.error("Error fetching project engagement:", error);
        }
      } catch (error) {
        console.error("Error in data fetch sequence:", error);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchDataSequentially();
  }, [user, isLoading]);

  const projectEngagementData: ProjectEngagementData[] = [
    {
      browser: "engagement",
      rate: projectEngagement?.rate || 0,
      fill: "#2563eb",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-app-gradient-from to-app-gradient-to">
      <StartupNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-app-text-primary mb-6">
            Startup Dashboard
          </h1>
          <p className="text-xl text-app-text-secondary max-w-3xl mx-auto mb-8">
            Welcome to your startup management hub. Monitor your progress,
            manage opportunities, and connect with potential investors and
            partners.
          </p>
        </div>

        {isLoading || isDataLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <TbLoader3 className="size-12 animate-spin text-blue-600 mb-4" />
            <p className="text-app-text-secondary text-lg">
              {isLoading
                ? "Authentification approvement ..."
                : "Data loading ..."}
            </p>
          </div>
        ) : (
          <>
            {/* User Profile Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={userProfile?.pictureURL}
                      alt={userProfile?.name || ""}
                    />
                    <AvatarFallback>
                      {userProfile?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || ""}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {userProfile?.name || ""}
                    </h2>
                    <p className="text-app-text-secondary">
                      {userProfile?.nbStartups ? userProfile?.nbStartups : 0}{" "}
                      {userProfile?.nbStartups === 1 ? "Startup" : "Startups"}
                    </p>
                  </div>
                  <div className="ml-auto mr-5">
                    {project && project.length > 0 ? (
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 font-medium text-sm"
                        onClick={async () => {
                          setIsExporting(true);
                          try {
                            const token = document.cookie
                              .split(";")
                              .find((cookie) =>
                                cookie.trim().startsWith("authToken=")
                              )
                              ?.split("=")[1]
                              ?.trim();

                            if (!token) {
                              console.error("Authentication token not found");
                              return;
                            }

                            const response = await fetch(
                              `/api/pdf/project/${token}`
                            );
                            if (!response.ok) {
                              throw new Error(
                                `HTTP error! status: ${response.status}`
                              );
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
                        }}
                      >
                        {isExporting ? (
                          <>
                            <TbLoader3 className="size-4 animate-spin" />
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Download className="size-4" />
                            <span>Export as PDF</span>
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        className="bg-gray-400 text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 font-medium text-sm"
                        disabled
                      >
                        <Download className="size-4" />
                        <span>No Project</span>
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Project Views Chart */}
              <ChartBarLabel
                data={projectViewsOverTime}
                title="Project Views Over Time"
                description={
                  projectViewsOverTime.length > 1
                    ? `Monthly project views for the last ${projectViewsOverTime.length} months`
                    : "Project views for the last month"
                }
                footerTitle="Growth analysis"
                footerDescription="Showing total project views per month"
                config={{
                  views: {
                    label: "Views",
                    color: "#2563eb",
                  },
                }}
              />

              {/* Project Engagement Rate Chart */}
              <ChartRadialText
                data={projectEngagementData}
                title="Project Engagement Rate"
                description="Current engagement metrics"
                centerLabel="Engagement"
                footerTitle="Performance analysis"
                footerDescription={getProjectEngagementDescription(
                  projectEngagementData[0].rate
                )}
                endAngle={(projectEngagementData[0].rate * 360) / 100}
                config={{
                  rate: {
                    label: "Engagement Rate",
                  },
                  engagement: {
                    label: "Engagement",
                    color: "var(--chart-3)",
                  },
                }}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
