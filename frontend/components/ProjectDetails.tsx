"use client";
import { ProjectDetailsProps } from "@/types/project";
import { FaGithub, FaRegUser } from "react-icons/fa6";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Founder } from "@/types/founders";
import { getBackendUrl } from "@/lib/config";
import {
  FaLinkedinIn,
  FaInstagram,
  FaFacebook,
  FaXTwitter,
  FaLink,
} from "react-icons/fa6";
import { FaThumbsUp, FaThumbsDown, FaShare } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { authenticatedFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function ProjectDetails(props: ProjectDetailsProps) {
  const backendUrl = getBackendUrl();
  const { user } = useAuth();
  const [engagementStats, setEngagementStats] = useState({
    likes: 0,
    dislikes: 0,
    shares: 0,
  });
  const [isLoading, setIsLoading] = useState({
    like: false,
    dislike: false,
    share: false,
  });
  const [userInteractions, setUserInteractions] = useState({
    liked: false,
    disliked: false,
  });

  useEffect(() => {
    const fetchEngagementStats = async () => {
      try {
        const response = await authenticatedFetch(`/projects/${props.ProjectId}/engagement-count/`);
        if (response.ok) {
          const data = await response.json();
          setEngagementStats({
            likes: data.total_likes,
            dislikes: data.total_dislikes,
            shares: data.total_shares,
          });
        }
      } catch (error) {
        console.error("Error fetching engagement stats:", error);
      }
    };

    if (props.ProjectId) {
      fetchEngagementStats();
    }
  }, [props.ProjectId]);

  const handleLike = async () => {
    if (!user) {
      toast("Authentication Required", {
        description: "You must be logged in to like projects",
        className: "!text-white !bg-red-600 !border-red-500",
      });
      return;
    }

    setIsLoading(prev => ({ ...prev, like: true }));
    try {
      let method = "POST";
      let response;

      if (userInteractions.liked) {
        response = await authenticatedFetch(`/projects/${props.ProjectId}/like/`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
        method = "DELETE";
      } else {
        response = await authenticatedFetch(`/projects/${props.ProjectId}/like/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      if (response.ok) {
        if (method === "POST" || (method === "DELETE" && !userInteractions.liked)) {
          setEngagementStats(prev => ({
            ...prev,
            likes: prev.likes + 1,
            dislikes: userInteractions.disliked ? prev.dislikes - 1 : prev.dislikes,
          }));
          setUserInteractions({
            liked: true,
            disliked: false,
          });
        } else {
          setEngagementStats(prev => ({
            ...prev,
            likes: Math.max(0, prev.likes - 1),
          }));
          setUserInteractions({
            ...userInteractions,
            liked: false,
          });
        }
      } else {
        const errorData = await response.json();
        if (errorData.error && errorData.error.includes("already liked")) {
          setUserInteractions({
            liked: true,
            disliked: false,
          });
          toast("Already Liked", {
            description: "You have already liked this project",
            className: "!text-white !bg-orange-600 !border-orange-500",
          });
        } else {
          toast("Like Failed", {
            description: errorData.error || "Failed to process like",
            className: "!text-white !bg-red-600 !border-red-500",
          });
        }
      }
    } catch (error) {
      console.error("Error handling like:", error);
      toast("Error", {
        description: "An error occurred while processing your request",
        className: "!text-white !bg-red-600 !border-red-500",
      });
    } finally {
      setIsLoading(prev => ({ ...prev, like: false }));
    }
  };

  const handleDislike = async () => {
    if (!user) {
      toast("Authentication Required", {
        description: "You must be logged in to dislike projects",
        className: "!text-white !bg-red-600 !border-red-500",
      });
      return;
    }

    setIsLoading(prev => ({ ...prev, dislike: true }));
    try {
      let method = "POST";
      let response;

      if (userInteractions.disliked) {
        response = await authenticatedFetch(`/projects/${props.ProjectId}/dislike/`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
        method = "DELETE";
      } else {
        response = await authenticatedFetch(`/projects/${props.ProjectId}/dislike/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      if (response.ok) {
        if (method === "POST" || (method === "DELETE" && !userInteractions.disliked)) {
          setEngagementStats(prev => ({
            ...prev,
            dislikes: prev.dislikes + 1,
            likes: userInteractions.liked ? prev.likes - 1 : prev.likes,
          }));
          setUserInteractions({
            disliked: true,
            liked: false,
          });
        } else {
          setEngagementStats(prev => ({
            ...prev,
            dislikes: Math.max(0, prev.dislikes - 1),
          }));
          setUserInteractions({
            ...userInteractions,
            disliked: false,
          });
        }
      } else {
        const errorData = await response.json();
        if (errorData.error && errorData.error.includes("already disliked")) {
          setUserInteractions({
            liked: false,
            disliked: true,
          });
          toast("Already Disliked", {
            description: "You have already disliked this project",
            className: "!text-white !bg-orange-600 !border-orange-500",
          });
        } else {
          toast("Dislike Failed", {
            description: errorData.error || "Failed to process dislike",
            className: "!text-white !bg-red-600 !border-red-500",
          });
        }
      }
    } catch (error) {
      console.error("Error handling dislike:", error);
      toast("Error", {
        description: "An error occurred while processing your request",
        className: "!text-white !bg-red-600 !border-red-500",
      });
    } finally {
      setIsLoading(prev => ({ ...prev, dislike: false }));
    }
  };

  const handleShare = async () => {
    if (!user) {
      toast("Authentication Required", {
        description: "You must be logged in to share projects",
        className: "!text-white !bg-red-600 !border-red-500",
      });
      return;
    }

    setIsLoading(prev => ({ ...prev, share: true }));

    try {
      const shareText = `
🌟 ${props.ProjectName}

${props.ProjectDescription || ''}

🏷️ Sector: ${props.ProjectSector || 'Not specified'}
📊 Status: ${props.ProjectStatus || 'Not specified'}
🎯 Maturity: ${props.ProjectMaturity || 'Not specified'}

📞 Contact Information:
${props.ProjectEmail ? `Email: ${props.ProjectEmail}` : ''}
${props.ProjectPhone ? `Phone: ${props.ProjectPhone}` : ''}
${props.ProjectAddress ? `Address: ${props.ProjectAddress}` : ''}

${props.ProjectWebsite ? `🌐 Website: ${props.ProjectWebsite}` : ''}
${props.ProjectSocial ? `📱 Social: ${props.ProjectSocial}` : ''}

${props.ProjectNeeds ? `💡 Current Needs: ${props.ProjectNeeds}` : ''}

---
Shared from JEB Incubator
      `.trim();

      await navigator.clipboard.writeText(shareText);

      setEngagementStats(prev => ({
        ...prev,
        shares: prev.shares + 1,
      }));

      toast("Share Successful", {
        description: "Project information copied to clipboard! You can now paste it anywhere to share.",
        className: "!text-white !bg-green-600 !border-green-500",
      });

      authenticatedFetch(`/projects/${props.ProjectId}/share/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform: "clipboard",
        }),
      }).catch(error => {
        console.error("Error tracking share:", error);
      });

    } catch (error) {
      console.error("Error sharing project:", error);
      toast("Share Failed", {
        description: "Failed to copy project information to clipboard. Please try again.",
        className: "!text-white !bg-red-600 !border-red-500",
      });
    } finally {
      setIsLoading(prev => ({ ...prev, share: false }));
    }
  };

  return (
    <div className="max-w-none mx-auto space-y-6 sm:space-y-12 py-2 sm:py-4">
      {/* Hero Section */}
      <div className="text-center space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8 bg-grad.ient-to-r from-jeb-five/15 to-jeb-gradient-to/50 py-6 sm:py-8 md:py-10 lg:py-12 px-3 sm:px-4 md:px-6 lg:px-8 rounded-lg sm:rounded-xl lg:rounded-2xl">
        <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-gray-900 tracking-tight">
          {props.ProjectName}
        </h1>
        {props.ProjectDescription && (
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto leading-relaxed font-light">
            {props.ProjectDescription}
          </p>
        )}

        {/* Status Badges */}
        <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 flex-wrap mt-4 sm:mt-6 lg:mt-8">
          {props.ProjectSector && (
            <div className="bg-white rounded-full px-3 sm:px-4 md:px-5 lg:px-6 py-1.5 sm:py-2 md:py-2.5 lg:py-3 shadow-sm border">
              <span className="text-blue-700 font-medium text-xs sm:text-sm md:text-base">
                {props.ProjectSector}
              </span>
            </div>
          )}
          {props.ProjectStatus && (
            <div className="bg-white rounded-full px-3 sm:px-4 md:px-5 lg:px-6 py-1.5 sm:py-2 md:py-2.5 lg:py-3 shadow-sm border">
              <span className="text-green-700 font-medium text-xs sm:text-sm md:text-base">
                {props.ProjectStatus}
              </span>
            </div>
          )}
          {props.ProjectMaturity && (
            <div className="bg-white rounded-full px-3 sm:px-4 md:px-5 lg:px-6 py-1.5 sm:py-2 md:py-2.5 lg:py-3 shadow-sm border">
              <span className="text-purple-700 font-medium text-xs sm:text-sm md:text-base">
                {props.ProjectMaturity}
              </span>
            </div>
          )}
        </div>

        {/* Engagement Buttons */}
        <div className="flex justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 mt-6 sm:mt-8 lg:mt-10">
          <Button
            onClick={handleLike}
            disabled={isLoading.like || !user}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all duration-200 ${
              userInteractions.liked
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-white hover:bg-green-50 text-green-600 border border-green-200"
            } ${isLoading.like ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <FaThumbsUp className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">
              {isLoading.like ? "..." : userInteractions.liked ? "Unlike" : "Like"} ({engagementStats.likes})
            </span>
          </Button>

          <Button
            onClick={handleDislike}
            disabled={isLoading.dislike || !user}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all duration-200 ${
              userInteractions.disliked
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-white hover:bg-red-50 text-red-600 border border-red-200"
            } ${isLoading.dislike ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <FaThumbsDown className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">
              {isLoading.dislike ? "..." : userInteractions.disliked ? "Undislike" : "Dislike"} ({engagementStats.dislikes})
            </span>
          </Button>

          <Button
            onClick={handleShare}
            disabled={isLoading.share || !user}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all duration-200 bg-white hover:bg-purple-50 text-purple-600 border border-purple-200 ${
              isLoading.share ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <FaShare className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">
              {isLoading.share ? "..." : "Share"} ({engagementStats.shares})
            </span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
        {/* Project Information */}
        <div className="space-y-6 sm:space-y-8">
          <div className="bg-white rounded-lg md:rounded-xl p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 shadow-sm border">
            <h2 className="font-heading text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6 md:mb-8 flex items-center gap-1.5 sm:gap-2 md:gap-3">
              <div className="w-1 sm:w-1.5 md:w-2 h-5 sm:h-6 md:h-8 bg-blue-500 rounded-full"></div>
              Project Info
            </h2>

            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              {props.ProjectId && (
                <div>
                  <dt className="text-xs sm:text-xs md:text-sm font-medium text-gray-500 mb-0.5 sm:mb-1 md:mb-2">
                    Project ID
                  </dt>
                  <dd className="text-sm sm:text-base md:text-lg text-gray-900">
                    #{props.ProjectId}
                  </dd>
                </div>
              )}

              {props.ProjectLegalStatus && (
                <div>
                  <dt className="text-xs sm:text-xs md:text-sm font-medium text-gray-500 mb-0.5 sm:mb-1 md:mb-2">
                    Legal Status
                  </dt>
                  <dd className="text-sm sm:text-base md:text-lg text-gray-900">
                    {props.ProjectLegalStatus}
                  </dd>
                </div>
              )}

              <div>
                <dt className="text-xs sm:text-xs md:text-sm font-medium text-gray-500 mb-0.5 sm:mb-1 md:mb-2">
                  Created
                </dt>
                <dd className="text-sm sm:text-base md:text-lg text-gray-900">
                  {new Date(props.ProjectCreatedAt).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </dd>
              </div>
            </div>
          </div>

          {/* Current Needs */}
          {props.ProjectNeeds && (
            <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 lg:p-8 xl:p-10 shadow-sm border">
              <h2 className="font-heading text-xl md:text-2xl font-semibold text-gray-900 mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
                <div className="w-1.5 md:w-2 h-6 md:h-8 bg-red-500 rounded-full"></div>
                Current Needs
              </h2>
              <div className="bg-red-50 rounded-lg p-4 md:p-6">
                <p className="text-base md:text-lg text-red-800 leading-relaxed">
                  {props.ProjectNeeds}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="space-y-8">
          <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 lg:p-8 xl:p-10 shadow-sm border">
            <h2 className="font-heading text-xl md:text-2xl font-semibold text-gray-900 mb-6 md:mb-8 flex items-center gap-2 md:gap-3">
              <div className="w-1.5 md:w-2 h-6 md:h-8 bg-emerald-500 rounded-full"></div>
              Contact
            </h2>

            <div className="space-y-4 md:space-y-6">
              <div>
                <dt className="text-xs md:text-sm font-medium text-gray-500 mb-1 md:mb-2">
                  Email
                </dt>
                <dd className="text-base md:text-lg">
                  <a
                    href={`mailto:${props.ProjectEmail}`}
                    className="text-emerald-600 hover:text-emerald-700 transition-colors break-all"
                  >
                    {props.ProjectEmail}
                  </a>
                </dd>
              </div>

              <div>
                <dt className="text-xs md:text-sm font-medium text-gray-500 mb-1 md:mb-2">
                  Phone
                </dt>
                <dd className="text-base md:text-lg">
                  <a
                    href={`tel:${props.ProjectPhone}`}
                    className="text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    {props.ProjectPhone}
                  </a>
                </dd>
              </div>

              {props.ProjectAddress && (
                <div>
                  <dt className="text-xs md:text-sm font-medium text-gray-500 mb-1 md:mb-2">
                    Address
                  </dt>
                  <dd className="text-base md:text-lg text-gray-900">
                    {props.ProjectAddress}
                  </dd>
                </div>
              )}

              {props.ProjectWebsite && (
                <div>
                  <dt className="text-xs md:text-sm font-medium text-gray-500 mb-1 md:mb-2">
                    Website
                  </dt>
                  <dd className="text-base md:text-lg">
                    <a
                      href={props.ProjectWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-700 transition-colors break-all"
                    >
                      {props.ProjectWebsite}
                    </a>
                  </dd>
                </div>
              )}

              {props.ProjectSocial && (
                <div>
                  <dt className="text-xs md:text-sm font-medium text-gray-500 mb-1 md:mb-2">
                    Social
                  </dt>
                  <dd className="text-base md:text-lg">
                    <a
                      href={props.ProjectSocial}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-700 transition-colors break-all"
                    >
                      {(() => {
                        try {
                          const url = new URL(props.ProjectSocial);
                          const domain = url.hostname.replace("www.", "");

                          if (domain.includes("facebook"))
                            return <FaFacebook />;
                          if (
                            domain.includes("twitter") ||
                            domain.includes("x.com")
                          )
                            return <FaXTwitter />;
                          if (domain.includes("instagram"))
                            return <FaInstagram />;
                          if (domain.includes("linkedin"))
                            return <FaLinkedinIn />;
                          if (domain.includes("github")) return <FaGithub />;

                          return <FaLink />;
                        } catch {
                          return props.ProjectSocial;
                        }
                      })()}
                    </a>
                  </dd>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="space-y-8">
          <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 lg:p-8 xl:p-10 shadow-sm border">
            <h2 className="font-heading text-xl md:text-2xl font-semibold text-gray-900 mb-6 md:mb-8 flex items-center gap-2 md:gap-3">
              <div className="w-1.5 md:w-2 h-6 md:h-8 bg-purple-500 rounded-full"></div>
              Team
            </h2>

            <div className="space-y-4 md:space-y-6">
              {props.ProjectFounders && props.ProjectFounders.length > 0 && (
                <div>
                  <dt className="text-xs md:text-sm font-medium text-gray-500 mb-3 md:mb-4">
                    Founders ({props.ProjectFounders.length})
                  </dt>
                  <dd className="space-y-3 md:space-y-4">
                    {props.ProjectFounders.map(
                      (founder: Founder, index: number) => {
                        console.debug(
                          "Founder picture URL:",
                          founder.FounderPictureURL
                        );
                        return (
                          <div
                            key={index}
                            className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-purple-50 rounded-lg"
                          >
                            <div className=" bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0">
                              <Avatar className="w-10 md:w-12 h-10 md:h-12 text-purple-600">
                                <AvatarImage
                                  src={backendUrl + founder.FounderPictureURL}
                                />
                                <AvatarFallback>
                                  <FaRegUser />
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-base md:text-lg font-medium text-purple-900 truncate">
                                {founder.FounderName}
                              </p>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </dd>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
