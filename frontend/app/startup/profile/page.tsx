"use client";

import { useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FaEdit,
  FaTrashAlt,
  FaPlus,
  FaEye,
  FaThumbsUp,
  FaShare,
  FaUsers,
} from "react-icons/fa";
import { MinimalFounder } from "@/types/founders";

// Mock data for the startup profile
const mockStartupData = {
  name: "TechFlow Solutions",
  legalStatus: "SAS",
  address: "123 Innovation Street, Paris, France",
  email: "contact@techflow.com",
  phone: "+33 1 23 45 67 89",
  description:
    "TechFlow Solutions is a cutting-edge SaaS platform that revolutionizes workflow automation for small and medium enterprises. Our AI-powered tools help businesses streamline their operations and increase productivity by 40%.",
  website: "https://techflow.com",
  socialMedia: "https://linkedin.com/company/techflow",
  projectStatus: "Active",
  needs: "Funding, Marketing Support, Technical Partnerships",
  sector: "Technology",
  maturity: "Product-Market Fit",
  founders: [
    {
      name: "Alice Johnson",
      picture:
        "https://images.unsplash.com/photo-1494790108755-2616b612b5e5?w=150",
    },
    {
      name: "Bob Smith",
      picture:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    },
    {
      name: "Carol Davis",
      picture:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    },
  ] as MinimalFounder[],
};

// Mock visibility stats
const mockVisibilityStats = {
  profileViews: 1247,
  likes: 89,
  shares: 34,
  followers: 156,
};

export default function StartupProfile() {
  const [formData, setFormData] = useState(mockStartupData);
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFoundersChange = (founders: MinimalFounder[]) => {
    setFormData((prev) => ({
      ...prev,
      founders,
    }));
  };

  const addFounder = () => {
    const newFounder: MinimalFounder = {
      name: "",
      picture:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    };
    handleFoundersChange([...formData.founders, newFounder]);
  };

  const removeFounder = (index: number) => {
    const updatedFounders = formData.founders.filter((_, i) => i !== index);
    handleFoundersChange(updatedFounders);
  };

  const updateFounder = (
    index: number,
    field: keyof MinimalFounder,
    value: string
  ) => {
    const updatedFounders = formData.founders.map((founder, i) =>
      i === index ? { ...founder, [field]: value } : founder
    );
    handleFoundersChange(updatedFounders);
  };

  const handleSave = () => {
    // Here you would typically make an API call to save the data
    console.log("Saving startup profile:", formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(mockStartupData);
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
        </div>

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
                    {mockVisibilityStats.profileViews.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Profile Views</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <FaThumbsUp className="text-3xl text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {mockVisibilityStats.likes}
                  </div>
                  <div className="text-sm text-gray-600">Likes</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <FaShare className="text-3xl text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">
                    {mockVisibilityStats.shares}
                  </div>
                  <div className="text-sm text-gray-600">Shares</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <FaUsers className="text-3xl text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">
                    {mockVisibilityStats.followers}
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
                      value={formData.name}
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
                      value={formData.legalStatus}
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
                      value={formData.address}
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
                      value={formData.email}
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
                      value={formData.phone}
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
                  value={formData.description}
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
                      value={formData.website}
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
                      value={formData.socialMedia}
                      onChange={(e) =>
                        handleInputChange("socialMedia", e.target.value)
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
                      value={formData.projectStatus}
                      onChange={(e) =>
                        handleInputChange("projectStatus", e.target.value)
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
                      value={formData.sector}
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
                      value={formData.maturity}
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
                    value={formData.needs}
                    onChange={(e) => handleInputChange("needs", e.target.value)}
                    disabled={!isEditing}
                    placeholder="e.g., Funding, Technical Support, Marketing..."
                  />
                </div>
              </div>

              {/* Founders Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-app-text-primary">
                    Founders
                  </h3>
                  {isEditing && (
                    <Button
                      onClick={addFounder}
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                    >
                      <FaPlus className="mr-2" />
                      Add Founder
                    </Button>
                  )}
                </div>
                <div className="space-y-4">
                  {formData.founders.map((founder, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={founder.picture} alt={founder.name} />
                        <AvatarFallback>
                          {founder.name
                            .split(" ")
                            .map((word) => word[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Input
                          value={founder.name}
                          onChange={(e) =>
                            updateFounder(index, "name", e.target.value)
                          }
                          disabled={!isEditing}
                          placeholder="Founder name"
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          value={founder.picture}
                          onChange={(e) =>
                            updateFounder(index, "picture", e.target.value)
                          }
                          disabled={!isEditing}
                          placeholder="Picture URL"
                        />
                      </div>
                      {isEditing && (
                        <Button
                          onClick={() => removeFounder(index)}
                          variant="destructive"
                          size="sm"
                          className="cursor-pointer"
                        >
                          <FaTrashAlt />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
