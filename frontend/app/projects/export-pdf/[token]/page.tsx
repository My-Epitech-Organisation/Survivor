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
import { authenticatedFetch } from "@/lib/api";

interface ProjectViewsOverTime {
    month: string;
    views: number;
}

interface ProjectEngagement {
    rate: number;
}

export default function ProjectExportPage() {
    const params = useParams();
    const token = params.token as string;

    const [project, setProject] = useState<ProjectDetailsProps>();
    const [views, setViews] = useState<ProjectViewsOverTime[]>([]);
    const [engagement, setEngagement] = useState<ProjectEngagement>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>();

    useEffect(() => {
        if (!token) {
            setError("Token d'authentification manquant");
            setLoading(false);
            return;
        }

        const apiUrl = getAPIUrl();
        const fetchData = async () => {
            try {
                const userResponse = await authenticatedFetch(
                    `${apiUrl}/user`,
                    { method: 'GET' },
                    token
                );
                
                if (!userResponse.ok) {
                    throw new Error('Erreur d\'authentification');
                }
                
                const userData = await userResponse.json();
                const founderId = userData.founderId;
                
                if (!founderId) {
                    throw new Error('Aucun ID de fondateur associé à cet utilisateur');
                }
                
                const projectResponse = await authenticatedFetch(
                    `${apiUrl}/projects/founder/${founderId}`,
                    { method: 'GET' },
                    token
                );
                
                if (!projectResponse.ok) {
                    throw new Error('Impossible de récupérer les projets');
                }
                
                const projects = await projectResponse.json();
                
                if (!projects || projects.length === 0) {
                    throw new Error('Aucun projet trouvé pour ce fondateur');
                }
                
                setProject(projects[0]);
                
                const viewsResponse = await authenticatedFetch(
                    `${apiUrl}/projectViews/${userData.id}`,
                    { method: 'GET' },
                    token
                );
                
                if (viewsResponse.ok) {
                    const viewsData = await viewsResponse.json();
                    if (viewsData && viewsData.length > 0) {
                        setViews(viewsData);
                    }
                }
                
                const engagementResponse = await authenticatedFetch(
                    `${apiUrl}/projectEngagement/${userData.id}`,
                    { method: 'GET' },
                    token
                );
                
                if (engagementResponse.ok) {
                    const engagementData = await engagementResponse.json();
                    if (engagementData) {
                        setEngagement(engagementData);
                    }
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des données:", error);
                setError(error instanceof Error ? error.message : 'Erreur inconnue');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);
    
    if (loading) {
        return <div className="flex justify-center items-center h-screen">Chargement des données du projet...</div>;
    }

    if (error || !project) {
        return (
            <div className="flex justify-center items-center h-screen flex-col">
                <div className="text-xl font-bold text-red-500">Erreur</div>
                <div className="mt-2">{error || "Données du projet non disponibles"}</div>
            </div>
        );
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
                                    <CardTitle>Taux d&apos;Engagement</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ChartRadialText
                                        data={[{
                                            browser: "engagement",
                                            rate: engagement?.rate || 0,
                                            fill: "#8b5cf6"
                                        }]}
                                        title=""
                                        description="Métriques d'engagement actuelles"
                                        centerLabel="Engagement"
                                        footerTitle="Performance"
                                        footerDescription={engagement?.rate?.toString() || "0"}
                                        endAngle={(engagement?.rate || 0) * 360 / 100}
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
