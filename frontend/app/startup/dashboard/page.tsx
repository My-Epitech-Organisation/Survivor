import StartupNavigation from '@/components/StartupNavigation';
import { ChartBarLabel } from '@/components/ChartBarLabel';
import { ChartRadialText } from '@/components/ChartRadialText';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


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

export default function StartupDashboard() {
    /* Mockup data */
    const userProfile = {
        name: "John Doe",
        image: "/placeholder-avatar.jpg",
        nbStartups: 5
    };

    const projectViewsOverTime = [
        { month: "January", views: 186 },
        { month: "February", views: 305 },
        { month: "March", views: 237 },
        { month: "April", views: 173 },
        { month: "May", views: 209 },
        { month: "June", views: 314 },
    ];

    const projectEngagementData = [
        { browser: "engagement", rate: 75, fill: "#2563eb" }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <StartupNavigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Startup Dashboard
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                        Welcome to your startup management hub. Monitor your progress, manage opportunities,
                        and connect with potential investors and partners.
                    </p>
                </div>

                {/* User Profile Section */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={userProfile.image} alt={userProfile.name} />
                                <AvatarFallback>{userProfile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-2xl font-bold">{userProfile.name}</h2>
                                <p className="text-gray-600">
                                    {userProfile.nbStartups} {userProfile.nbStartups === 1 ? 'Startup' : 'Startups'}
                                </p>
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
