"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MostLikedProjects from "@/components/MostLikedProjects";
import { ProjectService, MostLikedProject } from "@/services/ProjectService";

export default function Home() {
  const [mostLikedProjects, setMostLikedProjects] = useState<
    MostLikedProject[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMostLikedProjects = async () => {
      try {
        setIsLoading(true);
        const projects = await ProjectService.getMostLikedProjects(5);
        setMostLikedProjects(projects);
      } catch (error) {
        console.error("Error fetching most liked projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMostLikedProjects();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-jeb-gradient-from to-jeb-gradient-to/50 flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-app-text-primary mb-6">
            Welcome to{" "}
            <span className="font-black italic text-jeb-primary">JEB</span>
          </h1>
          <p className="text-xl text-app-text-secondary max-w-3xl mx-auto mb-8">
            Your comprehensive platform for managing projects, staying updated
            with news, discovering events, and finding exactly what you need
            with our advanced search.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Link href="/projects" className="group">
            <div className="bg-app-surface rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 group-hover:scale-105">
              <div className="w-12 h-12 bg-app-blue-muted rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-app-blue-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="font-heading text-xl font-semibold text-app-text-primary mb-2">
                Projects
              </h3>
              <p className="text-app-text-secondary">
                Explore and manage your projects with powerful tools and
                collaboration features.
              </p>
            </div>
          </Link>

          <Link href="/news" className="group">
            <div className="bg-app-surface rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 group-hover:scale-105">
              <div className="w-12 h-12 bg-app-green-light rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-app-green-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
              <h3 className="font-heading text-xl font-semibold text-app-text-primary mb-2">
                News
              </h3>
              <p className="text-app-text-secondary">
                Stay informed with the latest updates, announcements, and
                industry insights.
              </p>
            </div>
          </Link>

          <Link href="/events" className="group">
            <div className="bg-app-surface rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 group-hover:scale-105">
              <div className="w-12 h-12 bg-app-purple-light rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-app-purple-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-heading text-xl font-semibold text-app-text-primary mb-2">
                Events
              </h3>
              <p className="text-app-text-secondary">
                Discover upcoming events, workshops, and networking
                opportunities.
              </p>
            </div>
          </Link>

          <Link href="/search" className="group">
            <div className="bg-app-surface rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 group-hover:scale-105">
              <div className="w-12 h-12 bg-app-orange-light rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-app-orange-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="font-heading text-xl font-semibold text-app-text-primary mb-2">
                Advanced Search
              </h3>
              <p className="text-app-text-secondary">
                Find exactly what you&apos;re looking for with our powerful
                search capabilities.
              </p>
            </div>
          </Link>

          <Link href="/about" className="group">
            <div className="bg-app-surface rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 group-hover:scale-105">
              <div className="w-12 h-12 bg-app-indigo-light rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-app-indigo-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-heading text-xl font-semibold text-app-text-primary mb-2">
                About
              </h3>
              <p className="text-app-text-secondary">
                Learn more about JEB, our mission, and the team behind the
                platform.
              </p>
            </div>
          </Link>
        </div>

        {/* Most Liked Projects Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h2 className="font-heading text-3xl font-bold text-app-text-primary">
                Most <span className="text-jeb-primary">Liked</span> Projects
              </h2>
            </div>
            <p className="text-app-text-secondary max-w-2xl mx-auto">
              Discover the community's favorite projects and see what's trending
              in the JEB ecosystem.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-app-surface rounded-lg shadow-md p-6 animate-pulse"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-jeb-light rounded-full"></div>
                          <div className="h-5 bg-app-border-light rounded w-48"></div>
                        </div>
                        <div className="space-y-2 mb-3">
                          <div className="h-4 bg-app-border-light rounded w-full"></div>
                          <div className="h-4 bg-app-border-light rounded w-3/4"></div>
                        </div>
                        <div className="flex gap-2 mb-3">
                          <div className="h-6 bg-app-border-light rounded-full w-16"></div>
                          <div className="h-6 bg-app-border-light rounded-full w-20"></div>
                          <div className="h-6 bg-app-border-light rounded-full w-18"></div>
                        </div>
                        <div className="flex gap-4">
                          <div className="h-4 bg-app-border-light rounded w-24"></div>
                          <div className="h-4 bg-app-border-light rounded w-16"></div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 ml-4">
                        <div className="flex items-center gap-1">
                          <div className="w-5 h-5 bg-app-border-light rounded"></div>
                          <div className="h-4 bg-app-border-light rounded w-8"></div>
                        </div>
                        <div className="w-5 h-5 bg-app-border-light rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <MostLikedProjects projects={mostLikedProjects} />
            )}

            {!isLoading && mostLikedProjects.length > 0 && (
              <div className="text-center mt-8">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 bg-jeb-primary text-app-white px-6 py-3 rounded-lg font-medium hover:bg-jeb-hover transition-colors"
                >
                  View All Projects
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-app-surface rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="font-heading text-2xl font-bold text-app-text-primary mb-4">
              Ready to get started?
            </h2>
            <p className="text-app-text-secondary mb-6">
              Choose any section above to begin exploring what JEB has to offer.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/projects"
                className="bg-jeb-primary text-app-white px-6 py-3 rounded-lg font-medium hover:bg-jeb-hover transition-colors"
              >
                View Projects
              </Link>
              <Link
                href="/search"
                className="border border-jeb-primary text-jeb-primary px-6 py-3 rounded-lg font-medium hover:text-jeb-hover hover:bg-jeb-light transition-colors"
              >
                Try Search
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
