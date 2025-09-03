"use client"
import { ProjectDetailsProps } from "@/types/project";
import { FaGithub, FaRegUser } from "react-icons/fa6";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Founder } from "@/types/founders";
import { getBackendUrl } from "@/lib/config";
import { FaLinkedinIn, FaInstagram, FaFacebook, FaXTwitter, FaLink } from "react-icons/fa6";

export default function ProjectDetails(props: ProjectDetailsProps) {
  const backendUrl = getBackendUrl();

  return (
    <div className="max-w-none mx-auto space-y-6 sm:space-y-12 py-2 sm:py-4">
      {/* Hero Section */}
      <div className="text-center space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8 bg-gradient-to-r from-blue-50 to-indigo-50 py-6 sm:py-8 md:py-10 lg:py-12 px-3 sm:px-4 md:px-6 lg:px-8 rounded-lg sm:rounded-xl lg:rounded-2xl">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-gray-900 tracking-tight">{props.ProjectName}</h1>
        {props.ProjectDescription && (
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto leading-relaxed font-light">
            {props.ProjectDescription}
          </p>
        )}

        {/* Status Badges */}
        <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 flex-wrap mt-4 sm:mt-6 lg:mt-8">
          {props.ProjectSector && (
            <div className="bg-white rounded-full px-3 sm:px-4 md:px-5 lg:px-6 py-1.5 sm:py-2 md:py-2.5 lg:py-3 shadow-sm border">
              <span className="text-blue-700 font-medium text-xs sm:text-sm md:text-base">{props.ProjectSector}</span>
            </div>
          )}
          {props.ProjectStatus && (
            <div className="bg-white rounded-full px-3 sm:px-4 md:px-5 lg:px-6 py-1.5 sm:py-2 md:py-2.5 lg:py-3 shadow-sm border">
              <span className="text-green-700 font-medium text-xs sm:text-sm md:text-base">{props.ProjectStatus}</span>
            </div>
          )}
          {props.ProjectMaturity && (
            <div className="bg-white rounded-full px-3 sm:px-4 md:px-5 lg:px-6 py-1.5 sm:py-2 md:py-2.5 lg:py-3 shadow-sm border">
              <span className="text-purple-700 font-medium text-xs sm:text-sm md:text-base">{props.ProjectMaturity}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">

        {/* Project Information */}
        <div className="space-y-6 sm:space-y-8">
          <div className="bg-white rounded-lg md:rounded-xl p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 shadow-sm border">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6 md:mb-8 flex items-center gap-1.5 sm:gap-2 md:gap-3">
              <div className="w-1 sm:w-1.5 md:w-2 h-5 sm:h-6 md:h-8 bg-blue-500 rounded-full"></div>
              Project Info
            </h2>

            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              {props.ProjectId && (
                <div>
                  <dt className="text-xs sm:text-xs md:text-sm font-medium text-gray-500 mb-0.5 sm:mb-1 md:mb-2">Project ID</dt>
                  <dd className="text-sm sm:text-base md:text-lg text-gray-900">#{props.ProjectId}</dd>
                </div>
              )}

              {props.ProjectLegalStatus && (
                <div>
                  <dt className="text-xs sm:text-xs md:text-sm font-medium text-gray-500 mb-0.5 sm:mb-1 md:mb-2">Legal Status</dt>
                  <dd className="text-sm sm:text-base md:text-lg text-gray-900">{props.ProjectLegalStatus}</dd>
                </div>
              )}

              <div>
                <dt className="text-xs sm:text-xs md:text-sm font-medium text-gray-500 mb-0.5 sm:mb-1 md:mb-2">Created</dt>
                <dd className="text-sm sm:text-base md:text-lg text-gray-900">
                  {new Date(props.ProjectCreatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </dd>
              </div>
            </div>
          </div>

          {/* Current Needs */}
          {props.ProjectNeeds && (
            <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 lg:p-8 xl:p-10 shadow-sm border">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
                <div className="w-1.5 md:w-2 h-6 md:h-8 bg-red-500 rounded-full"></div>
                Current Needs
              </h2>
              <div className="bg-red-50 rounded-lg p-4 md:p-6">
                <p className="text-base md:text-lg text-red-800 leading-relaxed">{props.ProjectNeeds}</p>
              </div>
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="space-y-8">
          <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 lg:p-8 xl:p-10 shadow-sm border">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6 md:mb-8 flex items-center gap-2 md:gap-3">
              <div className="w-1.5 md:w-2 h-6 md:h-8 bg-emerald-500 rounded-full"></div>
              Contact
            </h2>

            <div className="space-y-4 md:space-y-6">
              <div>
                <dt className="text-xs md:text-sm font-medium text-gray-500 mb-1 md:mb-2">Email</dt>
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
                <dt className="text-xs md:text-sm font-medium text-gray-500 mb-1 md:mb-2">Phone</dt>
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
                  <dt className="text-xs md:text-sm font-medium text-gray-500 mb-1 md:mb-2">Address</dt>
                  <dd className="text-base md:text-lg text-gray-900">{props.ProjectAddress}</dd>
                </div>
              )}

              {props.ProjectWebsite && (
                <div>
                  <dt className="text-xs md:text-sm font-medium text-gray-500 mb-1 md:mb-2">Website</dt>
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
                  <dt className="text-xs md:text-sm font-medium text-gray-500 mb-1 md:mb-2">Social</dt>
                  <dd className="text-base md:text-lg">
                  <a
                    href={props.ProjectSocial}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 transition-colors break-all"
                  >
                    {
                    (() => {
                      try {
                        const url = new URL(props.ProjectSocial);
                        const domain = url.hostname.replace('www.', '');

                        if (domain.includes('facebook')) return <FaFacebook/>;
                        if (domain.includes('twitter') || domain.includes('x.com')) return <FaXTwitter/>;
                        if (domain.includes('instagram')) return <FaInstagram/>;
                        if (domain.includes('linkedin')) return <FaLinkedinIn/>;
                        if (domain.includes('github')) return <FaGithub/>;

                        return <FaLink/>;
                      } catch (e) {
                        return props.ProjectSocial;
                      }
                    })()
                    }
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
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6 md:mb-8 flex items-center gap-2 md:gap-3">
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
                    {props.ProjectFounders.map((founder: Founder, index: number) => {
                      console.log("Founder picture URL:", founder.FounderPictureURL);
                      return (
                        <div key={index} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-purple-50 rounded-lg">
                          <div className=" bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <Avatar className="w-10 md:w-12 h-10 md:h-12 text-purple-600">
                                <AvatarImage src={backendUrl + founder.FounderPictureURL} />
                                <AvatarFallback>
                                  <FaRegUser />
                                </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-base md:text-lg font-medium text-purple-900 truncate">{founder.FounderName}</p>
                          </div>
                        </div>
                      );
                    })}
                  </dd>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
