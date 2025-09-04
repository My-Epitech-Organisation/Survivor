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
import { api } from "@/lib/api"
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { User } from '@/types/user';

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
    const founderId = params.founderId as string;

    // Données de démonstration pour les graphiques au cas où les requêtes API échoueraient
    const demoViewsData: ProjectViewsOverTime[] = [
        { month: 'Jan', views: 320 },
        { month: 'Fév', views: 450 },
        { month: 'Mar', views: 380 },
        { month: 'Avr', views: 520 },
        { month: 'Mai', views: 610 },
        { month: 'Juin', views: 490 }
    ];

    const demoEngagement: ProjectEngagement = { rate: 78 };

    const [project, setProject] = useState<ProjectDetailsProps>();
    const [views, setViews] = useState<ProjectViewsOverTime[]>(demoViewsData); // Initialiser avec des données de démo
    const [engagement, setEngagement] = useState<ProjectEngagement | null>(demoEngagement); // Initialiser avec des données de démo
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!founderId) return;

        const apiUrl = getAPIUrl();
        const fetchData = async () => {
            try {
                console.log(`Fetching data for founder ID: ${founderId}`);
                // Essayer de récupérer les projets du fondateur sans authentification d'abord
                const projectRes = await api.get<ProjectDetailsProps[] | null>(`${apiUrl}/projects/founder/${founderId}`);
                console.log("Project response:", projectRes.data);
                
                if (projectRes.data && projectRes.data.length > 0) {
                    setProject(projectRes.data[0]);
                    
                    try {
                        // Essayer de récupérer les données utilisateur, mais ne pas bloquer si ça échoue
                        const user = await api.get<User>(`${apiUrl}/user`);
                        if (user?.data?.id) {
                            const viewsRes = await api.get<ProjectViewsOverTime[]>(`${apiUrl}/projectViews/${user.data.id}`);
                            const engagementRes = await api.get<ProjectEngagement | null>(`${apiUrl}/projectEngagement/${user.data.id}`);
                            setViews(viewsRes.data);
                            setEngagement(engagementRes.data);
                        }
                    } catch (userError) {
                        console.warn("Could not fetch user data:", userError);
                        // Continuer sans les données utilisateur
                    }
                } else {
                    console.error("No projects found for this founder ID:", founderId);
                }
            } catch (error) {
                console.error("Failed to fetch project data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [founderId]);
    
    if (loading) {
        return <div className="flex justify-center items-center h-screen">Chargement des données du projet...</div>;
    }

    if (!project) {
        // Utiliser un message d'erreur plus descriptif pour le débogage
        return (
            <div className="flex justify-center items-center h-screen flex-col">
                <div className="text-xl font-bold text-red-500">Projet non trouvé</div>
                <div className="mt-2">ID du fondateur: {founderId}</div>
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
                                data={views.length > 0 ? views : demoViewsData} // Utiliser les données de démo si aucune donnée réelle
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
                                data={[{
                                    browser: "engagement",
                                    rate: engagement?.rate || demoEngagement.rate, // Utiliser la valeur de démo si aucune donnée réelle
                                    fill: "#8b5cf6"
                                }]}
                                title=""
                                description="Métriques d'engagement actuelles"
                                centerLabel="Engagement"
                                footerTitle="Performance"
                                footerDescription={getProjectEngagementDescription(engagement?.rate || demoEngagement.rate)}
                                endAngle={(engagement?.rate || demoEngagement.rate) * 360 / 100}
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
