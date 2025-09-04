import AdminNavigation from "@/components/AdminNavigation";
import { ChartBarLabel } from "@/components/ChartBarLabel";
import { ChartRadialText } from "@/components/ChartRadialText";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Users,
  Building2,
  Eye,
  MessageSquare,
  Calendar,
} from "lucide-react";

// Mock data for KPIs
const mockData = {
  totalUsers: {
    value: 1247,
    changePercentage: 12,
  },
  totalStartups: {
    value: 89,
    changePercentage: 8,
  },
  totalEvents: {
    value: 47,
    changePercentage: 22,
  },
  newSignups: {
    value: 156,
    changePercentage: 20,
  },
  projectVisibility: {
    data: [
      { month: "Jan", views: 266 },
      { month: "Feb", views: 505 },
      { month: "Mar", views: 357 },
      { month: "Apr", views: 463 },
      { month: "May", views: 339 },
      { month: "Jun", views: 354 },
    ],
    changePercentage: 8.2,
  },
  userEngagement: {
    data: [{ browser: "Active Users", rate: 75, fill: "#2563eb" }],
    changePercentage: 12,
  },
  recentActions: [
    {
      id: 1,
      action: "New startup registered",
      user: "TechCorp Inc.",
      time: "2 hours ago",
      type: "signup",
    },
    {
      id: 2,
      action: "Project updated",
      user: "Sarah Connor",
      time: "4 hours ago",
      type: "update",
    },
    {
      id: 3,
      action: "New user registered",
      user: "John Doe",
      time: "6 hours ago",
      type: "signup",
    },
    {
      id: 4,
      action: "Event created",
      user: "Admin",
      time: "8 hours ago",
      type: "event",
    },
    {
      id: 5,
      action: "Project launched",
      user: "InnovateLab",
      time: "1 day ago",
      type: "launch",
    },
    {
      id: 6,
      action: "User verified",
      user: "Alice Smith",
      time: "1 day ago",
      type: "verification",
    },
  ],
  monthlyStats: {
    projectsLaunched: 12,
    eventsCreated: 8,
    activeSessions: 324,
    supportTickets: 12,
    avgSessionDuration: "8m 23s",
  },
};

export default function AdminDashboard() {
  const getActionIcon = (type: string) => {
    switch (type) {
      case "signup":
        return <Users className="h-4 w-4" />;
      case "update":
        return <MessageSquare className="h-4 w-4" />;
      case "event":
        return <Calendar className="h-4 w-4" />;
      case "launch":
        return <TrendingUp className="h-4 w-4" />;
      case "verification":
        return <Eye className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case "signup":
        return "bg-green-100 text-green-800";
      case "update":
        return "bg-blue-100 text-blue-800";
      case "event":
        return "bg-purple-100 text-purple-800";
      case "launch":
        return "bg-orange-100 text-orange-800";
      case "verification":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-app-gradient-from to-app-gradient-to">
      <AdminNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-app-text-primary mb-6">
            Admin Dashboard
          </h1>
          <p className="text-xl text-app-text-secondary max-w-3xl mx-auto mb-8">
            Welcome to the admin management hub. Here you can manage platform
            content, users, and view key metrics about platform usage and
            engagement.
          </p>
        </div>

        {/* KPI Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockData.totalUsers.value.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +{mockData.totalUsers.changePercentage}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Startups
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockData.totalStartups.value}
              </div>
              <p className="text-xs text-muted-foreground">
                +{mockData.totalStartups.changePercentage}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Events
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockData.totalEvents.value}
              </div>
              <p className="text-xs text-muted-foreground">
                +{mockData.totalEvents.changePercentage}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Signups</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockData.newSignups.value}
              </div>
              <p className="text-xs text-muted-foreground">
                +{mockData.newSignups.changePercentage}% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Project Visibility Chart */}
          <ChartBarLabel
            data={mockData.projectVisibility.data}
            title="Project Visibility"
            description="Monthly project views across the platform"
            footerTitle={`Trending up by ${mockData.projectVisibility.changePercentage}% this month`}
            footerDescription="Showing total views for the last 6 months"
            trendingPercentage={mockData.projectVisibility.changePercentage}
            config={{
              views: {
                label: "Views",
                color: "#2563eb",
              },
            }}
          />

          {/* User Engagement Chart */}
          <ChartRadialText
            data={mockData.userEngagement.data}
            title="User Engagement"
            description="Active users vs total registered users"
            centerLabel="75%"
            footerTitle={`Active users increased by ${mockData.userEngagement.changePercentage}%`}
            footerDescription="Compared to last month"
            trendingPercentage={mockData.userEngagement.changePercentage}
          />
        </div>

        {/* Recent Actions and Additional Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Actions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Actions</CardTitle>
              <CardDescription>
                Latest platform activities and user interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockData.recentActions.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-full ${getActionColor(
                          action.type
                        )}`}
                      >
                        {getActionIcon(action.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {action.action}
                        </p>
                        <p className="text-xs text-gray-500">
                          by {action.user}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {action.time}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Stats */}
          <Card>
            <CardHeader>
              <CardTitle>This Month</CardTitle>
              <CardDescription>Key metrics for current period</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Projects Launched</span>
                <span className="text-lg font-semibold">
                  {mockData.monthlyStats.projectsLaunched}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Events Created</span>
                <span className="text-lg font-semibold">
                  {mockData.monthlyStats.eventsCreated}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Sessions</span>
                <span className="text-lg font-semibold">
                  {mockData.monthlyStats.activeSessions}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Support Tickets</span>
                <span className="text-lg font-semibold">
                  {mockData.monthlyStats.supportTickets}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Avg. Session Duration
                </span>
                <span className="text-lg font-semibold">
                  {mockData.monthlyStats.avgSessionDuration}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
