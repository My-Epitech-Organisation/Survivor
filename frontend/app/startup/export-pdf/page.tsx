'use client';

import { ChartBarLabel } from '@/components/ChartBarLabel';
import { ChartRadialText } from '@/components/ChartRadialText';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAPIUrl } from '@/lib/config';

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

export default function StartupPDFExportPage() {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [projectViewsOverTime, setProjectViewsOverTime] = useState<ProjectViewsOverTime[]>([]);
    const [projectEngagement, setProjectEngagement] = useState<ProjectEngagement | null>(null);
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId');

    useEffect(() => {
        if (!userId) return;

        const apiUrl = getAPIUrl();

        const fetchUserProfile = async () => {
            try {
                const response = await fetch(`${apiUrl}/user/${userId}`);
                if (response.ok) {
                    const profile = await response.json();
                    setUserProfile(profile);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        };

        const fetchProjectViewsOverTime = async () => {
            try {
                const response = await fetch(`${apiUrl}/projectViews/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setProjectViewsOverTime(data);
                }
            } catch (error) {
                console.error("Error fetching project views:", error);
            }
        };

        const fetchProjectEngagement = async () => {
            try {
                const response = await fetch(`${apiUrl}/projectEngagement/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setProjectEngagement(data);
                }
            } catch (error) {
                console.error("Error fetching project engagement:", error);
            }
        };

        fetchUserProfile();
        fetchProjectViewsOverTime();
        fetchProjectEngagement();
    }, [userId]);

    const projectEngagementData: ProjectEngagementData[] = [{
        browser: "engagement",
        rate: projectEngagement?.rate || 0,
        fill: "#2563eb"
    }];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8" data-testid="startup-dashboard">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-gray-900 mb-4">
                    Startup Dashboard Report
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Comprehensive analytics and insights for startup performance monitoring
                </p>
                <div className="flex justify-center mt-6">
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                        Generated on {new Date().toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </Badge>
                </div>
            </div>

            {/* User Profile Section */}
            <Card className="mb-8 shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-6">
                        <Avatar className="h-20 w-20 border-4 border-white">
                            <AvatarImage src={userProfile?.pictureURL} alt={userProfile?.name || ""} />
                            <AvatarFallback className="text-2xl bg-white text-blue-600">
                                {userProfile?.name?.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-3xl font-bold">{userProfile?.name || "Startup Founder"}</h2>
                            <p className="text-blue-100 text-lg">
                                {userProfile?.nbStartups ? userProfile?.nbStartups : 0} {userProfile?.nbStartups === 1 ? 'Startup' : 'Startups'}
                            </p>
                            <p className="text-blue-100">
                                {userProfile?.email}
                            </p>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-3 gap-6 text-center">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{userProfile?.id}</div>
                            <div className="text-gray-600">User ID</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{userProfile?.founderId}</div>
                            <div className="text-gray-600">Founder ID</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{userProfile?.investorId}</div>
                            <div className="text-gray-600">Investor ID</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Project Views Chart */}
                <Card className="shadow-xl border-0">
                    <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
                        <CardTitle className="text-xl">Project Views Over Time</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <ChartBarLabel
                            data={projectViewsOverTime}
                            title=""
                            description={projectViewsOverTime.length > 1 ?
                                `Monthly project views for the last ${projectViewsOverTime.length} months`
                                : "Project views for the last month"}
                            footerTitle="Growth analysis"
                            footerDescription="Showing total project views per month"
                            config={{
                                views: {
                                    label: "Views",
                                    color: "#10b981",
                                },
                            }}
                        />
                    </CardContent>
                </Card>

                {/* Project Engagement Rate Chart */}
                <Card className="shadow-xl border-0">
                    <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
                        <CardTitle className="text-xl">Project Engagement Rate</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <ChartRadialText
                            data={projectEngagementData}
                            title=""
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
                                    color: "#8b5cf6",
                                },
                            }}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Footer */}
            <div className="text-center py-8 border-t-2 border-gray-200">
                <p className="text-gray-500 text-lg">
                    This report was automatically generated for startup performance tracking and analysis.
                </p>
                <p className="text-gray-400">
                    © {new Date().getFullYear()} Startup Dashboard - All rights reserved
                </p>
            </div>
        </div>
    );
}
