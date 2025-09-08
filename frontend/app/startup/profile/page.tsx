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
import {
  FaEdit,
  FaEye,
  FaThumbsUp,
  FaShare,
  FaUsers,
} from "react-icons/fa";
import { FounderResponse } from "@/types/founders";
import { ProjectDetails, ProjectProfileFormData } from "@/types/project";
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

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const visibilityStats = {
    profileViews: 0,
    likes: 0,
    shares: 0,
    followers: 0,
  };

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

        return data.startupId;
      } catch (err) {
        return null;
      }
    };
    fetchStartupId().then((id) => {
      const fetchStartupDetails = async () => {
        try {
          const response = await authenticatedFetch(`/projects/${id}`);

          if (!response.ok) {
            throw new Error("Failed to fetch startup data");
          }

          const data: ProjectDetails = await response.json();
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
        } catch (err) {
          return null;
        }
      };
      fetchStartupDetails().then((data) => {
        if (data) {
          setFormData(data);
        }
        setIsLoading(false);
      });
    });
  }, [user?.founderId]);

  const handleSave = () => {
    // API call to save the data
    console.log("Saving startup profile:", formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
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
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-app-gradient-from to-app-gradient-to">
      <StartupNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-app-text-primary mb-6">
            Startup Profile Management
          </h1>
          <p className="text-xl text-app-text-secondary max-w-3xl mx-auto mb-8">
            Manage your startup&apos;s profile information, team members, and
            track your visibility metrics.
          </p>
          {!formData.name && !isEditing && !isLoading && (
            <span className="block mt-2 text-sm text-gray-500">
              Your profile is currently empty. Click "Edit Profile" to add
              your startup information.
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-app-text-secondary">
                Loading your startup profile...
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Visibility Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-app-text-primary flex items-center gap-2">
                  <FaEye className="text-blue-500" />
                  Visibility Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <FaEye className="text-3xl text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">
                      {visibilityStats.profileViews.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Profile Views</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <FaThumbsUp className="text-3xl text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">
                      {visibilityStats.likes}
                    </div>
                    <div className="text-sm text-gray-600">Likes</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <FaShare className="text-3xl text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">
                      {visibilityStats.shares}
                    </div>
                    <div className="text-sm text-gray-600">Shares</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <FaUsers className="text-3xl text-orange-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-orange-600">
                      {visibilityStats.followers}
                    </div>
                    <div className="text-sm text-gray-600">Followers</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Form */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl text-app-text-primary">
                  Company Profile
                </CardTitle>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={handleSave}
                        variant="default"
                        className="cursor-pointer"
                      >
                        Save Changes
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        className="cursor-pointer"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="cursor-pointer"
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
                  <h3 className="text-lg font-semibold text-app-text-primary mb-4">
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
                            value="Auto-entrepreneur"
                            className="cursor-pointer"
                          >
                            Auto-entrepreneur
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-app-text-primary mb-4">
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
                    className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md resize-none disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <h3 className="text-lg font-semibold text-app-text-primary mb-4">
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
                  <h3 className="text-lg font-semibold text-app-text-primary mb-4">
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
