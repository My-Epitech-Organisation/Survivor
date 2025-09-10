"use client";

import React from "react";
import Link from "next/link";
import { MostLikedProject } from "@/services/ProjectService";

interface MostLikedProjectsProps {
  projects: MostLikedProject[];
}

export default function MostLikedProjects({
  projects,
}: MostLikedProjectsProps) {
  if (!projects || projects.length === 0) {
    return (
      <div className="bg-app-surface rounded-lg shadow-md p-8 text-center border border-app-border-light">
        <div className="w-16 h-16 bg-gradient-to-br from-jeb-light to-jeb-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-jeb-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>
        <h3 className="font-heading text-lg font-semibold text-app-text-primary mb-2">
          No Liked Projects Yet
        </h3>
        <p className="text-app-text-secondary">
          Be the first to discover and like amazing projects!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project, index) => (
        <div
          key={index}
          className="bg-app-surface rounded-lg shadow-md p-6 hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] border border-app-border-light hover:border-jeb-primary/30 relative overflow-hidden"
        >
          <div className="flex items-start justify-between relative">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm relative
                  ${
                    index === 0
                      ? "bg-gradient-to-r from-jeb-eight to-jeb-nine text-app-white shadow-lg"
                      : index === 1
                      ? "bg-gradient-to-r from-jeb-seven to-jeb-eight text-app-white shadow-md"
                      : index === 2
                      ? "bg-gradient-to-r from-jeb-six to-jeb-seven text-app-white shadow-sm"
                      : "bg-jeb-light text-jeb-primary"
                  }
                `}
                >
                  {index + 1}
                </div>
                <h3 className="font-heading text-lg font-semibold text-app-text-primary group-hover:text-jeb-primary transition-colors">
                  {project.ProjectName}
                </h3>
              </div>

              <p className="text-app-text-secondary text-sm mb-3 line-clamp-2">
                {project.ProjectDescription || "No description available."}
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-jeb-light text-jeb-primary">
                  {project.ProjectSector}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-app-blue-light text-app-blue-primary">
                  {project.ProjectMaturity}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-app-yellow-light text-app-yellow-primary">
                  {project.ProjectStatus}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 ml-4">
              <div className="flex items-center gap-1 text-jeb-primary bg-jeb-light/50 px-3 py-1 rounded-full group-hover:bg-jeb-light transition-colors">
                <svg
                  className="w-4 h-4 fill-current group-hover:scale-110 transition-transform"
                  viewBox="0 0 24 24"
                >
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="font-semibold text-sm">
                  {project.likes_count || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
