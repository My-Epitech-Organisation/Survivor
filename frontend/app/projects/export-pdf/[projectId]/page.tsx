'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getAPIUrl, getBackendUrl } from '@/lib/config';
import { ProjectDetailsProps } from '@/types/project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ChartBarLabel } from '@/components/ChartBarLabel';
import { ChartRadialText } from '@/components/ChartRadialText';

// Mock data structures for stats - replace with actual types if available
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
    if (data >= 100) return "Excellent engagement!";
    if (data >= 75) return "Très bon engagement.";
    if (data >= 50) return "Engagement moyen.";
    return "Engagement à améliorer.";
}

export default function ProjectExportPage() {
    const params = useParams();
    const projectId = params.projectId as string;

    const [project, setProject] = useState<ProjectDetailsProps | null>(null);
    const [views, setViews] = useState<ProjectViewsOverTime[]>([]);
    const [engagement, setEngagement] = useState<ProjectEngagement | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!projectId) return;

        const apiUrl = getAPIUrl();
        const fetchData = async () => {
            try {
                // Fetch all data in parallel
                const [projectRes, viewsRes, engagementRes] = await Promise.all([
                    fetch(`${apiUrl}/projects/${projectId}`),
                    fetch(`${apiUrl}/projectViews/project/${projectId}`),
                    fetch(`${apiUrl}/projectEngagement/project/${projectId}`)
                ]);

                if (projectRes.ok) {
                    const data = await projectRes.json();
                    setProject(data);
                }
                if (viewsRes.ok) {
                    const data = await viewsRes.json();
                    setViews(data);
                }
                if (engagementRes.ok) {
                    const data = await engagementRes.json();
                    setEngagement(data);
                }
            } catch (error) {
                console.error("Failed to fetch project data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [projectId]);

    const engagementData: ProjectEngagementData[] = [{
        browser: "engagement",
        rate: engagement?.rate || 0,
        fill: "#8b5cf6"
    }];
    
    if (loading) {
        return <div className="flex justify-center items-center h-screen">Chargement des données du projet...</div>;
    }

    if (!project) {
        return <div className="flex justify-center items-center h-screen">Projet non trouvé.</div>;
    }
    const backUrl = getBackendUrl();
    return (
        <div className="min-h-screen bg-white p-8" data-testid="project-export-page">
            {/* Header */}
            <header className="mb-12 text-center">
                <h1 className="text-5xl font-extrabold text-gray-900">{project.ProjectName}</h1>
                <p className="text-xl text-gray-500 mt-2">Rapport de Performance du Projet</p>
                <Badge variant="secondary" className="mt-4 text-base">
                    ID du Projet: {project.ProjectId}
                </Badge>
            </header>

            {/* Main Content */}
            <main>
                {/* Project Details & Founders */}
                <Card className="mb-8 border-2 border-gray-200 shadow-lg">
                    <CardHeader className="bg-gray-50">
                        <CardTitle className="text-2xl">Détails du Projet</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-4">
                            <p className="text-lg text-gray-700">{project.ProjectDescription}</p>
                            <div className="flex flex-wrap gap-2">
                                <Badge className="bg-blue-100 text-blue-800">{project.ProjectSector}</Badge>
                                <Badge className="bg-green-100 text-green-800">{project.ProjectMaturity}</Badge>
                                <Badge className="bg-purple-100 text-purple-800">{project.ProjectLegalStatus}</Badge>
                                <Badge className="bg-yellow-100 text-yellow-800">{project.ProjectStatus}</Badge>
                            </div>
                            <p><span className="font-semibold">Adresse:</span> {project.ProjectAddress}</p>
                            <p><span className="font-semibold">Créé le:</span> {new Date(project.ProjectCreatedAt).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg">Fondateurs</h3>
                            {project.ProjectFounders.map(founder => (
                                <div key={founder.FounderID} className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={backUrl + founder.FounderPictureURL} />
                                        <AvatarFallback>{founder.FounderName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <p className="font-medium">{founder.FounderName}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Statistics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <Card className="shadow-md">
                        <CardHeader>
                            <CardTitle>Vues du Projet par Mois</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartBarLabel
                                data={views}
                                title=""
                                description="Vues mensuelles du projet"
                                footerTitle="Tendance"
                                footerDescription="Analyse de la croissance des vues"
                                config={{ views: { label: "Vues", color: "#3b82f6" } }}
                            />
                        </CardContent>
                    </Card>
                    <Card className="shadow-md">
                        <CardHeader>
                            <CardTitle>Taux d'Engagement</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartRadialText
                                data={engagementData}
                                title=""
                                description="Métriques d'engagement actuelles"
                                centerLabel="Engagement"
                                footerTitle="Performance"
                                footerDescription={getProjectEngagementDescription(engagementData[0].rate)}
                                endAngle={engagementData[0].rate * 360 / 100}
                                config={{ rate: { label: "Taux" }, engagement: { label: "Engagement", color: "#8b5cf6" } }}
                            />
                        </CardContent>
                    </Card>
                </div>
            </main>

            {/* Footer */}
            <footer className="text-center text-gray-500 pt-8 mt-8 border-t">
                Rapport généré le {new Date().toLocaleDateString('fr-FR')}
            </footer>
        </div>
    );
}
