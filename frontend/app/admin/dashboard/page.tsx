"use client";

import { useEffect, useState } from "react";
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
import { DashboardService, MonthlyStatsResponse, ProjectVisibilityItem, TotalCountResponse, UsersConnectedResponse } from "@/services/DashboardService";

// Mock data for recent actions only (will be implemented later)
const mockRecentActions = [
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
];

export default function AdminDashboard() {
  // State for dashboard data
  const [totalUsers, setTotalUsers] = useState<TotalCountResponse>({ value: 0 });
  const [totalStartups, setTotalStartups] = useState<TotalCountResponse>({ value: 0 });
  const [totalEvents, setTotalEvents] = useState<TotalCountResponse>({ value: 0 });
  const [newSignups, setNewSignups] = useState<TotalCountResponse>({ value: 0 });
  const [projectVisibility, setProjectVisibility] = useState<ProjectVisibilityItem[]>([]);
  const [usersConnected, setUsersConnected] = useState<UsersConnectedResponse>({ rate: 0 });
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStatsResponse>({
    projectsLaunched: 0,
    eventsCreated: 0,
    activeSessions: 0,
    newSignups: 0,
    totalViews: 0,
    avgViewsPerProject: 0,
    avgSessionDuration: '0m 0s',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const {
          totalUsers,
          totalStartups,
          totalEvents,
          newSignups,
          projectVisibility,
          usersConnected,
          monthlyStats,
        } = await DashboardService.getAllDashboardData();

        setTotalUsers(totalUsers);
        setTotalStartups(totalStartups);
        setTotalEvents(totalEvents);
        setNewSignups(newSignups);
        setProjectVisibility(projectVisibility);
        setUsersConnected(usersConnected);
        setMonthlyStats(monthlyStats);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to fetch dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
          
          {/* Error message */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
              <p>{error}</p>
            </div>
          )}
          
          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-center items-center mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-app-blue-primary"></div>
            </div>
          )}
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
                {totalUsers.value.toLocaleString()}
                <span className="text-xs text-muted-foreground pl-1">
                  Users
                </span>
              </div>
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
                {totalStartups.value}
                <span className="text-xs text-muted-foreground pl-1">
                  Startups
                </span>
              </div>
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
                {totalEvents.value}
                <span className="text-xs text-muted-foreground pl-1">
                  Events
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Signups</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {newSignups.value}
                <span className="text-xs text-muted-foreground pl-1">
                  Signups
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Engagement Chart */}
          <ChartRadialText
            data={[{ browser: "Online Users", rate: usersConnected.rate, fill: "#2563eb" }]}
            title="User Engagement"
            description="Online users vs total registered users"
            centerLabel="Users online"
            startAngle={90 - usersConnected.rate * 3.6}
            endAngle={90}
          />

          {/* Project Visibility Chart */}
          <ChartBarLabel
            data={projectVisibility.map(item => ({
              month: item.month.length > 3 ? item.month.substring(0, 3) : item.month, // Robust: use full name if shorter than 3 chars
              views: item.views
            }))}
            title="Project Visibility"
            description="Monthly project views across the platform"
            config={{
              views: {
                label: "Views",
                color: "#2563eb",
              },
            }}
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
                {mockRecentActions.map((action) => (
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
                  {monthlyStats.projectsLaunched}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Events Created</span>
                <span className="text-lg font-semibold">
                  {monthlyStats.eventsCreated}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Sessions</span>
                <span className="text-lg font-semibold">
                  {monthlyStats.activeSessions}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Views</span>
                <span className="text-lg font-semibold">
                  {monthlyStats.totalViews}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg. Views Per Project</span>
                <span className="text-lg font-semibold">
                  {monthlyStats.avgViewsPerProject}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Avg. Session Duration
                </span>
                <span className="text-lg font-semibold">
                  {monthlyStats.avgSessionDuration}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
