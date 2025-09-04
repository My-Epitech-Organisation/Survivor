'use client';

import StartupNavigation from '@/components/StartupNavigation';
import { ChartBarLabel } from '@/components/ChartBarLabel';
import { ChartRadialText } from '@/components/ChartRadialText';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { authenticatedFetch } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { Download, LoaderCircle } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ProjectDetailsProps } from '@/types/project';
import { Founder } from '@/types/founders';

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

const projectsDefault : ProjectDetailsProps[] = [
    {
        ProjectId: 1,
        ProjectName: "EcoLoop",
        ProjectDescription: "Marketplace for sustainable home goods.",
        ProjectSector: "DeepTech",
        ProjectMaturity: "Idea",
        ProjectAddress: "77 Main Road, 37908 Ireland",
        ProjectLegalStatus: "SAS",
        ProjectCreatedAt: "2018-10-26",
        ProjectFounders: [
            {
                FounderID: 1,
                FounderName: "Manon Leroy",
                FounderStartupID: 1,
                FounderPictureURL: "/api/media/founders/1_1.jpg"
            }
        ],
        ProjectEmail: "contact@ecoloop.com",
        ProjectPhone: "+48 362 575 689",
        ProjectNeeds: "Talent Acquisition",
        ProjectStatus: "Growth",
        ProjectSocial: "https://www.linkedin.com/company/ecoloop",
        ProjectWebsite: "https://www.ecoloop.com"
    },
    {
        ProjectId: 0,
        ProjectName: "string",
        ProjectDescription: "string",
        ProjectSector: "string",
        ProjectMaturity: "string",
        ProjectAddress: "string",
        ProjectLegalStatus: "string",
        ProjectCreatedAt: "string",
        ProjectFounders: [
            {
                FounderID: 0,
                FounderName: "Plazza",
                FounderStartupID: 0,
                FounderPictureURL: "zizi"
            },
            {
                FounderID: 0,
                FounderName: "Plazza",
                FounderStartupID: 0,
                FounderPictureURL: "zizi"
            },
        ],
        ProjectEmail: "string",
        ProjectPhone: "string",
        ProjectNeeds: "string",
        ProjectStatus: "string",
        ProjectSocial: "string",
        ProjectWebsite: "string",
    }
]

export default function StartupDashboard() {
    const { user } = useAuth();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [projectViewsOverTime, setProjectViewsOverTime] = useState<ProjectViewsOverTime[]>([]);
    const [projectEngagement, setProjectEngagement] = useState<ProjectEngagement | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const userProfileResponse = await authenticatedFetch(`/user/${user?.id}`);
            if (!userProfileResponse.ok) {
                throw new Error("Failed to fetch user profile");
            }
            const userProfile: UserProfile = await userProfileResponse.json();
            setUserProfile(userProfile);
        }
        fetchUserData().catch(error => {
            console.error("Error fetching user data:", error);
        });

        const fetchProjectViewsOverTime = async () => {
            const projectViewsOverTimeResponse = await authenticatedFetch(`/projectViews/${user?.id}`);
            if (!projectViewsOverTimeResponse.ok) {
                throw new Error("Failed to fetch project views");
            }
            const projectViewsOverTime: ProjectViewsOverTime[] = await projectViewsOverTimeResponse.json();
            setProjectViewsOverTime(projectViewsOverTime);
        }
        fetchProjectViewsOverTime().catch(error => {
            console.error("Error fetching project views over time:", error);
        });

        const fetchProjectEngagement = async () => {
            const projectEngagementResponse = await authenticatedFetch(`/projectEngagement/${user?.id}`);
            if (!projectEngagementResponse.ok) {
                throw new Error("Failed to fetch project engagement data");
            }
            const projectEngagement: ProjectEngagement = await projectEngagementResponse.json();
            setProjectEngagement(projectEngagement);
        }
        fetchProjectEngagement().catch(error => {
            console.error("Error fetching project engagement data:", error);
        });

    }, [user?.id]);

    const projectEngagementData: ProjectEngagementData[] = [{
        browser: "engagement",
        rate: projectEngagement?.rate || 0,
        fill: "#2563eb"
    }];

    return (
        <div className="min-h-screen bg-gradient-to-br from-app-gradient-from to-app-gradient-to">
            <StartupNavigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-app-text-primary mb-6">
                        Startup Dashboard
                    </h1>
                    <p className="text-xl text-app-text-secondary max-w-3xl mx-auto mb-8">
                        Welcome to your startup management hub. Monitor your progress, manage opportunities,
                        and connect with potential investors and partners.
                    </p>
                </div>

                {/* User Profile Section */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={userProfile?.pictureURL} alt={userProfile?.name || ""} />
                                <AvatarFallback>{userProfile?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-2xl font-bold">{userProfile?.name || ""}</h2>
                                <p className="text-app-text-secondary">
                                    {userProfile?.nbStartups ? userProfile?.nbStartups : 0} {userProfile?.nbStartups === 1 ? 'Startup' : 'Startups'}
                                </p>
                            </div>
                            <div className="ml-auto mr-5">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 font-medium text-sm">
                                            <Download className='size-4' />
                                            <span>Export</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {projectsDefault.map((project) => (
                                            <DropdownMenuItem 
                                                key={project.ProjectId}
                                                onClick={() => window.open(`/api/pdf/project/${project.ProjectId}`, '_blank')}
                                                className="cursor-pointer"
                                            >
                                                Export {project.ProjectName}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
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
                        description={projectViewsOverTime.length > 1 ?
                            `Monthly project views for the last ${projectViewsOverTime.length} months`
                            : "Project views for the last month"}
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
                        footerDescription={getProjectEngagementDescription(projectEngagementData[0].rate)}
                        endAngle={projectEngagementData[0].rate * 360 / 100}
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
            </main>
        </div>
    );
}
