"use client"

import { Button } from "@/components/ui/button"
import { ProjectProps } from "@/app/types/project"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Users, Phone, TrendingUp, Target, ExternalLink } from "lucide-react"

export default function ProjectCard(props : ProjectProps) {
    return (
        <Card className="w-full max-w-sm hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white overflow-hidden">
            <CardHeader className="pb-4">
                <CardTitle className="text-center text-lg font-bold text-gray-900 mb-2">
                    {props.ProjectName}
                </CardTitle>
                <CardDescription className="text-center text-gray-600 leading-relaxed text-sm">
                    {props.ProjectDescription}
                </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 space-y-5">
                {/* Founders & Contacts Section */}
                <div className="flex items-start gap-4">
                    {/* Founders Section */}
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-600" />
                            <h4 className="font-medium text-gray-900 text-sm">Founders</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {props.ProjectFounders.map((founder, index) => (
                                <Badge 
                                    key={index} 
                                    variant="secondary" 
                                    className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                                >
                                    {founder}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Contacts Section */}
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-emerald-600" />
                            <h4 className="font-medium text-gray-900 text-sm">Contacts</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {props.ProjectContacts.map((contact, index) => (
                                <Badge 
                                    key={index} 
                                    variant="secondary"
                                    className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                >
                                    {contact}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Progress & Needs Section */}
                <div className="flex items-start gap-4">
                    {/* Progress Section */}
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                            <h4 className="font-medium text-gray-900 text-sm">Progress</h4>
                        </div>
                        <div className="space-y-2">
                            {props.ProjectProgess.map((progress, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <span className="text-sm text-gray-700">{progress}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Needs Section */}
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-orange-600" />
                            <h4 className="font-medium text-gray-900 text-sm">Needs</h4>
                        </div>
                        <div className="space-y-2">
                            {props.ProjectNeeds.map((need, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    <span className="text-sm text-gray-700">{need}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* Project Link */}
                {props.ProjectLink && (
                    <div className="pt-4 border-t border-gray-100">
                        <Button 
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                            onClick={() => window.open(props.ProjectLink, '_blank')}
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Project
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}