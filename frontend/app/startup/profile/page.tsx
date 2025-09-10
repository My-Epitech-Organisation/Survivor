"use client";

import { useEffect, useState } from "react";
import StartupNavigation from "@/components/StartupNavigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FaEdit, FaEye, FaThumbsUp, FaThumbsDown, FaShare } from "react-icons/fa";
import { FounderResponse } from "@/types/founders";
import { ProjectDetails, ProjectProfileFormData } from "@/types/project";
import { Founder } from "@/types/founders";
import { authenticatedFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function StartupProfile() {
  const [formData, setFormData] = useState<ProjectProfileFormData>({
    id: null,
    name: null,
    description: null,
    sector: null,
    maturity: null,
    address: null,
    legalStatus: null,
    email: null,
    phone: null,
    needs: null,
    status: null,
    social: null,
    website: null,
  });
  const [originalFormData, setOriginalFormData] =
    useState<ProjectProfileFormData>({
      id: null,
      name: null,
      description: null,
      sector: null,
      maturity: null,
      address: null,
      legalStatus: null,
      email: null,
      phone: null,
      needs: null,
      status: null,
      social: null,
      website: null,
    });
  const [uselessData, setUselessData] = useState({
    createdAt: "",
    founders: [] as Founder[],
  });

  const [isFounder, setIsFounder] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { user, isLoading } = useAuth();
  const [profileViews, setProfileViews] = useState<number | null>(null);
  const [engagementStats, setEngagementStats] = useState({
    likes: 0,
    dislikes: 0,
    shares: 0,
  });

  const getFormValue = (value: string | null): string => value || "";

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    const fetchStartupId = async () => {
      try {
        const response = await authenticatedFetch(
          `/founders/${user?.founderId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch startup id");
        }

        const data: FounderResponse = await response.json();

        return data.FounderStartupID;
      } catch {
        console.error("Error fetching startup ID");
        return null;
      }
    };

    if (user?.founderId) {
      setIsFounder(true);
      fetchStartupId().then((id) => {
        const fetchStartupDetails = async () => {
          try {
            const response = await authenticatedFetch(`/projects/${id}`);

            if (!response.ok) {
              throw new Error("Failed to fetch startup data");
            }

            const data: ProjectDetails = await response.json();
            setUselessData({
              founders: data.ProjectFounders,
              createdAt: data.ProjectCreatedAt,
            });
            return {
              id: data.ProjectId,
              name: data.ProjectName,
              description: data.ProjectDescription,
              sector: data.ProjectSector,
              maturity: data.ProjectMaturity,
              address: data.ProjectAddress,
              legalStatus: data.ProjectLegalStatus,
              email: data.ProjectEmail,
              phone: data.ProjectPhone,
              needs: data.ProjectNeeds,
              status: data.ProjectStatus,
              social: data.ProjectSocial,
              website: data.ProjectWebsite,
            };
          } catch {
            return null;
          }
        };

        fetchStartupDetails().then((data) => {
          if (data) {
            setFormData(data);
            setOriginalFormData(data);

            if (data.id) {
              authenticatedFetch(`/kpi/project-views/${data.id}`)
                .then((response) => {
                  if (!response.ok) {
                    throw new Error("Failed to fetch project views");
                  }
                  return response.json();
                })
                .then((viewsData) => {
                  setProfileViews(viewsData.total_views);
                })
                .catch((err) => {
                  console.error("Error fetching project views: ", err);
                  setProfileViews(0);
                });

              authenticatedFetch(`/projects/${data.id}/engagement-count/`)
                .then((response) => {
                  if (!response.ok) {
                    throw new Error("Failed to fetch engagement stats");
                  }
                  return response.json();
                })
                .then((engagementData) => {
                  setEngagementStats({
                    likes: engagementData.total_likes,
                    dislikes: engagementData.total_dislikes,
                    shares: engagementData.total_shares,
                  });
                })
                .catch((err) => {
                  console.error("Error fetching engagement stats: ", err);
                  setEngagementStats({
                    likes: 0,
                    dislikes: 0,
                    shares: 0,
                  });
                });
            }
          }
        });
      });
    }
  }, [user?.founderId]);

  const handleSave = async () => {
    if (!formData.id) {
      console.error("Project ID is missing");
      return;
    }

    try {
      const updateData = {
        ProjectId: formData.id,
        ProjectName: formData.name,
        ProjectDescription: formData.description,
        ProjectSector: formData.sector,
        ProjectMaturity: formData.maturity,
        ProjectAddress: formData.address,
        ProjectLegalStatus: formData.legalStatus,
        ProjectEmail: formData.email,
        ProjectPhone: formData.phone,
        ProjectNeeds: formData.needs,
        ProjectStatus: formData.status,
        ProjectSocial: formData.social,
        ProjectWebsite: formData.website,
        ProjectFounders: uselessData.founders,
        ProjectCreatedAt: uselessData.createdAt,
      };

      const response = await authenticatedFetch(`/projects/${formData.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Failed to update project");
      }

      setOriginalFormData({ ...formData });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  const handleCancel = () => {
    setFormData({ ...originalFormData });
    setIsEditing(false);
  };

  const handleStartEditing = () => {
    setOriginalFormData({ ...formData });
    setIsEditing(true);
  };

  return (
    <div className="min-h-screen bg-app-surface flex flex-col">
      <StartupNavigation />

      <main className="px-4 sm:px-6 lg:px-8 py-12 flex-1 transition-all">
        <div className="text-center mb-16">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-app-text-primary mb-6 transition-all">
            Startup Profile Management
          </h1>
          <p className="text-xl text-app-text-secondary max-w-3xl mx-auto mb-8">
            Manage your startup&apos;s profile information, team members, and
            track your visibility metrics.
          </p>
          {!isFounder ? (
            <span className="block mt-2 text-sm text-app-text-secondary">
              You do not have a startup to your name, please contact the
              administration to add a startup to your profile.
            </span>
          ) : (
            !formData.name &&
            !isEditing &&
            !isLoading && (
              <span className="block mt-2 text-sm text-app-text-secondary">
                Your profile is currently empty. Click &quot;Edit Profile&quot;
                to add your startup information.
              </span>
            )
          )}
        </div>

        {isFounder && (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Visibility Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-2xl text-app-text-primary flex items-center gap-2">
                  <FaEye className="text-app-blue-primary" />
                  Visibility Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-app-purple-light rounded-lg">
                    <FaEye className="text-3xl text-app-blue-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-app-blue-primary">
                      {(profileViews || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-app-text-secondary">Profile Views</div>
                    </div>
                  <div className="text-center p-4 bg-app-purple-light rounded-lg">
                    <FaShare className="text-3xl text-app-purple-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-app-purple-primary">
                      {engagementStats.shares}
                    </div>
                    <div className="text-sm text-app-text-secondary">Shares</div>
                  </div>
                  <div className="text-center p-4 bg-app-purple-light rounded-lg">
                    <FaThumbsUp className="text-3xl text-app-green-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-app-green-primary">
                      {engagementStats.likes}
                    </div>
                    <div className="text-sm text-app-text-secondary">Likes</div>
                  </div>
                  <div className="text-center p-4 bg-app-purple-light rounded-lg">
                    <FaThumbsDown className="text-3xl text-app-red-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-app-red-primary">
                      {engagementStats.dislikes}
                    </div>
                    <div className="text-sm text-app-text-secondary">Dislikes</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Form */}
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <CardTitle className="font-heading text-2xl text-app-text-primary">
                  Company Profile
                </CardTitle>
                <div className="flex gap-2 flex-col sm:flex-row">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={handleSave}
                        variant="default"
                        className="bg-jeb-primary text-white font-bold px-4 py-2 rounded-md hover:bg-jeb-hover transition-colors cursor-pointer"
                      >
                        Save Changes
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        className="border-jeb-primary text-jeb-primary hover:text-jeb-hover hover:bg-jeb-light cursor-pointer font-bold"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleStartEditing}
                      variant="default"
                      className="bg-jeb-primary text-white font-bold px-4 py-2 rounded-md hover:bg-jeb-hover transition-colors cursor-pointer"
                    >
                      <FaEdit className="mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="font-heading text-lg font-semibold text-app-text-primary mb-4">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="mb-2 block">
                        Company Name
                      </Label>
                      <Input
                        id="name"
                        value={getFormValue(formData.name)}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="legalStatus" className="mb-2 block">
                        Legal Status
                      </Label>
                      <Select
                        value={getFormValue(formData.legalStatus)}
                        onValueChange={(value) =>
                          handleInputChange("legalStatus", value)
                        }
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Select legal status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SAS" className="cursor-pointer">
                            SAS
                          </SelectItem>
                          <SelectItem value="SARL" className="cursor-pointer">
                            SARL
                          </SelectItem>
                          <SelectItem value="SA" className="cursor-pointer">
                            SA
                          </SelectItem>
                          <SelectItem value="SNC" className="cursor-pointer">
                            SNC
                          </SelectItem>
                          <SelectItem
                            value="Self-Employed"
                            className="cursor-pointer"
                          >
                            Self-Employed
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="font-heading text-lg font-semibold text-app-text-primary mb-4">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="address" className="mb-2 block">
                        Address
                      </Label>
                      <Input
                        id="address"
                        value={getFormValue(formData.address)}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="mb-2 block">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={getFormValue(formData.email)}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="mb-2 block">
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        value={getFormValue(formData.phone)}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description" className="mb-2 block">
                    Description
                  </Label>
                  <textarea
                    id="description"
                    className="w-full min-h-[120px] p-3 border border-app-border rounded-md resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    value={getFormValue(formData.description)}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder="Describe your startup..."
                  />
                </div>

                {/* Online Presence */}
                <div>
                  <h3 className="font-heading text-lg font-semibold text-app-text-primary mb-4">
                    Online Presence
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="website" className="mb-2 block">
                        Website URL
                      </Label>
                      <Input
                        id="website"
                        type="url"
                        value={getFormValue(formData.website)}
                        onChange={(e) =>
                          handleInputChange("website", e.target.value)
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="socialMedia" className="mb-2 block">
                        Social Media URL
                      </Label>
                      <Input
                        id="socialMedia"
                        type="url"
                        value={getFormValue(formData.social)}
                        onChange={(e) =>
                          handleInputChange("social", e.target.value)
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>

                {/* Project Details */}
                <div>
                  <h3 className="font-heading text-lg font-semibold text-app-text-primary mb-4">
                    Project Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label htmlFor="projectStatus" className="mb-2 block">
                        Project Status
                      </Label>
                      <Input
                        id="projectStatus"
                        value={getFormValue(formData.status)}
                        onChange={(e) =>
                          handleInputChange("status", e.target.value)
                        }
                        disabled={!isEditing}
                        placeholder="e.g., Active, Paused, Completed, Seeking Funding"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sector" className="mb-2 block">
                        Sector
                      </Label>
                      <Input
                        id="sector"
                        value={getFormValue(formData.sector)}
                        onChange={(e) =>
                          handleInputChange("sector", e.target.value)
                        }
                        disabled={!isEditing}
                        placeholder="e.g., Technology, Healthcare, Finance, Education"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maturity" className="mb-2 block">
                        Maturity
                      </Label>
                      <Input
                        id="maturity"
                        value={getFormValue(formData.maturity)}
                        onChange={(e) =>
                          handleInputChange("maturity", e.target.value)
                        }
                        disabled={!isEditing}
                        placeholder="e.g., Idea Stage, Prototype, MVP, Product-Market Fit"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="needs" className="mb-2 block">
                      Needs
                    </Label>
                    <Input
                      id="needs"
                      value={getFormValue(formData.needs)}
                      onChange={(e) =>
                        handleInputChange("needs", e.target.value)
                      }
                      disabled={!isEditing}
                      placeholder="e.g., Funding, Technical Support, Marketing..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
