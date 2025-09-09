"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  Search,
  X,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Newspaper,
  Building,
  MapPin,
  Clock,
  Users,
  TrendingUp,
  CheckCircle,
  Target,
  Eye,
} from "lucide-react";
import { authenticatedFetch } from "@/lib/api";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import { getBackendUrl } from "@/lib/config";
import { Event } from "@/types/event";
import { NewsDetailItem } from "@/types/news";
import { ProjectDetailsProps } from "@/types/project";

interface SearchItem {
  title: string;
  description: string;
  score: number;
  id: number;
  type: string;
  entity: any;
}

interface SearchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SearchItem[];
}

type DetailedItem = Event | NewsDetailItem | ProjectDetailsProps;

// Type guards for entity data
const isEvent = (item: any): boolean => {
  return (
    item &&
    item.result_type === "event" &&
    "dates" in item &&
    "event_type" in item
  );
};

const isNews = (item: any): boolean => {
  return (
    item &&
    item.result_type === "news" &&
    "news_date" in item &&
    "category" in item
  );
};

const isProject = (item: any): boolean => {
  return (
    item &&
    item.result_type === "project" &&
    "sector" in item &&
    "maturity" in item
  );
};

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SearchItem | null>(null);
  const [itemDetails, setItemDetails] = useState<any>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "project":
        return <Building className="w-4 h-4" />;
      case "event":
        return <Calendar className="w-4 h-4" />;
      case "news":
        return <Newspaper className="w-4 h-4" />;
      default:
        return <Building className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "project":
        return "Project";
      case "event":
        return "Event";
      case "news":
        return "News";
      default:
        return "Project";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "project":
        return "text-blue-600 bg-blue-100";
      case "event":
        return "text-green-600 bg-green-100";
      case "news":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-blue-600 bg-blue-100";
    }
  };

  const clearInput = () => {
    const inputField = document.getElementById(
      "search-bar"
    ) as HTMLInputElement;
    if (inputField) {
      inputField.value = "";
    }
  };

  const sendQuery = async (url?: string) => {
    let searchUrl: string;

    if (url) {
      searchUrl = url;
    } else {
      const inputField = document.getElementById(
        "search-bar"
      ) as HTMLInputElement;

      if (!inputField || !inputField.value.trim()) {
        return;
      }

      const searchQuery = inputField.value.trim();
      searchUrl = `/search/?search=${encodeURIComponent(searchQuery)}`;
    }

    setIsLoading(true);

    try {
      const response = await authenticatedFetch(searchUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSearchResults(data);
      console.log("Search results:", data);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousPage = async () => {
    if (searchResults?.previous) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      await sendQuery(searchResults.previous);
    }
  };

  const handleNextPage = async () => {
    if (searchResults?.next) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      await sendQuery(searchResults.next);
    }
  };

  const handleItemClick = (item: SearchItem) => {
    setSelectedItem(item);
    setItemDetails(item.entity);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-app-gradient-from to-app-gradient-to flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-app-text-primary mb-8">
            Advanced Search
          </h1>
          <div className="p-6 w-full">
            <form
              className="flex justify-between gap-4 flex-col sm:flex-row items-center"
              onSubmit={(e) => {
                e.preventDefault();
                sendQuery();
              }}
            >
              <input
                type="text"
                name="search-bar"
                id="search-bar"
                placeholder="Search for any event, news or project"
                className="rounded-lg border shadow py-2 px-6 w-full hover:border-app-text-muted transition-colors"
              />
              <div className="flex gap-2 justify-end w-full sm:w-fit">
                <button
                  type="button"
                  className="rounded-full border shadow p-2 w-auto cursor-pointer text-app-text-secondary hover:border-app-text-muted transition-colors"
                  onClick={clearInput}
                >
                  <X />
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-full border shadow p-2 w-auto cursor-pointer text-app-text-secondary disabled:opacity-50 disabled:cursor-not-allowed hover:border-app-text-muted transition-colors"
                >
                  <Search />
                </button>
              </div>
            </form>
          </div>

          {/* Search Results Section */}
          {searchResults && (
            <div className="p-6 w-full">
              <div className="flex justify-between items-center mb-4 gap-6">
                <h2 className="text-xl font-semibold text-app-text-primary">
                  Search Results ({searchResults.count} results)
                </h2>

                {/* Pagination Controls at the top */}
                {(searchResults.previous || searchResults.next) && (
                  <div className="flex gap-2 flex-col sm:flex-row">
                    {searchResults.previous && (
                      <button
                        onClick={handlePreviousPage}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    )}

                    {searchResults.next && (
                      <button
                        onClick={handleNextPage}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:cursor-pointer"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Loading placeholder under Search Results header */}
              {isLoading && (
                <div className="text-center text-app-text-secondary mb-4">
                  Loading search results...
                </div>
              )}

              <div className="flex flex-col gap-4">
                {searchResults.results.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handleItemClick(item)}
                    className="rounded-lg shadow p-4 bg-app-surface hover:bg-app-surface-hover cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                          item.type
                        )}`}
                      >
                        {getTypeIcon(item.type)}
                        {getTypeLabel(item.type)}
                      </span>
                      <button className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">
                        <Eye className="w-3 h-3" />
                        View Details
                      </button>
                    </div>
                    <h3 className="text-lg font-semibold text-app-text-primary mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-app-text-secondary">
                      {item.description.substring(0, 300)}
                      {item.description.length > 300 && <span>...</span>}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pagination Controls at the bottom as well */}
              {(searchResults.previous || searchResults.next) && (
                <div className="flex justify-end gap-2 items-center mt-6">
                  <div>
                    {searchResults.previous ? (
                      <button
                        onClick={handlePreviousPage}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    ) : (
                      <div></div>
                    )}
                  </div>

                  <div>
                    {searchResults.next ? (
                      <button
                        onClick={handleNextPage}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:cursor-pointer"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <div></div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Detailed View Dialog */}
      <Dialog
        open={selectedItem !== null}
        onOpenChange={() => {
          setSelectedItem(null);
          setItemDetails(null);
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-4xl w-full max-h-[90vh] overflow-hidden p-0"
        >
          {/* Custom Close Button */}
          <DialogClose className="absolute top-4 right-4 z-50 rounded-full p-2 text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer backdrop-blur-sm">
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </DialogClose>
          {selectedItem && (
            <div className="flex flex-col h-full max-h-[90vh]">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-white/20 border border-white/30 text-white`}
                    >
                      {getTypeIcon(selectedItem.type)}
                      <span className="capitalize">
                        {getTypeLabel(selectedItem.type)}
                      </span>
                    </span>
                  </div>
                  <DialogTitle className="text-2xl font-bold leading-tight pr-8">
                    {selectedItem.title}
                  </DialogTitle>
                </DialogHeader>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {itemDetails ? (
                  <div className="p-6">
                    {selectedItem.type === "event" && isEvent(itemDetails) && (
                      <div className="space-y-6">
                        {/* Event Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                                Date
                              </h3>
                              <p className="text-gray-900">
                                {new Date(
                                  itemDetails.dates
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                                Location
                              </h3>
                              <p className="text-gray-900">
                                {itemDetails.location}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                                Type
                              </h3>
                              <p className="text-gray-900">
                                {itemDetails.event_type}
                              </p>
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                                Event Name
                              </h3>
                              <p className="text-gray-900">
                                {itemDetails.name}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Event Description */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Description
                          </h3>
                          <div className="prose prose-gray max-w-none">
                            <ReactMarkdown
                              components={{
                                h1: ({ children }) => (
                                  <h1 className="text-xl font-bold text-gray-900 mb-3">
                                    {children}
                                  </h1>
                                ),
                                h2: ({ children }) => (
                                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                                    {children}
                                  </h2>
                                ),
                                h3: ({ children }) => (
                                  <h3 className="text-base font-medium text-gray-700 mb-2">
                                    {children}
                                  </h3>
                                ),
                                p: ({ children }) => (
                                  <p className="text-gray-600 mb-3 leading-relaxed">
                                    {children}
                                  </p>
                                ),
                                ul: ({ children }) => (
                                  <ul className="list-disc list-inside mb-3 text-gray-600 space-y-1">
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="list-decimal list-inside mb-3 text-gray-600 space-y-1">
                                    {children}
                                  </ol>
                                ),
                                strong: ({ children }) => (
                                  <strong className="font-semibold text-gray-800">
                                    {children}
                                  </strong>
                                ),
                                em: ({ children }) => (
                                  <em className="italic text-gray-700">
                                    {children}
                                  </em>
                                ),
                              }}
                            >
                              {itemDetails.description ||
                                "No description available."}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedItem.type === "news" && isNews(itemDetails) && (
                      <div className="space-y-6">
                        {/* News Metadata */}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{itemDetails.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(
                                itemDetails.news_date
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Newspaper className="w-4 h-4" />
                            <span className="capitalize">
                              {itemDetails.category}
                            </span>
                          </div>
                        </div>

                        {/* News Description */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Article Content
                          </h3>
                          <div className="prose prose-gray max-w-none">
                            <ReactMarkdown
                              components={{
                                h1: ({ children }) => (
                                  <h1 className="text-xl font-bold text-gray-900 mb-3">
                                    {children}
                                  </h1>
                                ),
                                h2: ({ children }) => (
                                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                                    {children}
                                  </h2>
                                ),
                                h3: ({ children }) => (
                                  <h3 className="text-base font-medium text-gray-700 mb-2">
                                    {children}
                                  </h3>
                                ),
                                p: ({ children }) => (
                                  <p className="text-gray-600 mb-3 leading-relaxed">
                                    {children}
                                  </p>
                                ),
                                ul: ({ children }) => (
                                  <ul className="list-disc list-inside mb-3 text-gray-600 space-y-1">
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="list-decimal list-inside mb-3 text-gray-600 space-y-1">
                                    {children}
                                  </ol>
                                ),
                                strong: ({ children }) => (
                                  <strong className="font-semibold text-gray-800">
                                    {children}
                                  </strong>
                                ),
                                em: ({ children }) => (
                                  <em className="italic text-gray-700">
                                    {children}
                                  </em>
                                ),
                                code: ({ children }) => (
                                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800">
                                    {children}
                                  </code>
                                ),
                              }}
                            >
                              {itemDetails.description ||
                                "No content available."}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedItem.type === "project" &&
                      isProject(itemDetails) && (
                        <div className="space-y-6">
                          {/* Project Status Badges */}
                          <div className="flex flex-wrap gap-3">
                            {itemDetails.sector && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200">
                                <Building className="w-4 h-4" />
                                {itemDetails.sector}
                              </span>
                            )}
                            {itemDetails.project_status && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 border border-green-200">
                                <CheckCircle className="w-4 h-4" />
                                {itemDetails.project_status}
                              </span>
                            )}
                            {itemDetails.maturity && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700 border border-purple-200">
                                <TrendingUp className="w-4 h-4" />
                                {itemDetails.maturity}
                              </span>
                            )}
                          </div>

                          {/* Project Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              {itemDetails.address && (
                                <div>
                                  <h3 className="text-sm font-semibold text-gray-700 mb-1">
                                    Address
                                  </h3>
                                  <p className="text-gray-900">
                                    {itemDetails.address}
                                  </p>
                                </div>
                              )}
                              {itemDetails.name && (
                                <div>
                                  <h3 className="text-sm font-semibold text-gray-700 mb-1">
                                    Project Name
                                  </h3>
                                  <p className="text-gray-900">
                                    {itemDetails.name}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="space-y-4">
                              {itemDetails.website_url && (
                                <div>
                                  <h3 className="text-sm font-semibold text-gray-700 mb-1">
                                    Website
                                  </h3>
                                  <a
                                    href={itemDetails.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                  >
                                    {itemDetails.website_url}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Project Description */}
                          {itemDetails.description && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Description
                              </h3>
                              <div className="prose prose-gray max-w-none">
                                <ReactMarkdown
                                  components={{
                                    h1: ({ children }) => (
                                      <h1 className="text-xl font-bold text-gray-900 mb-3">
                                        {children}
                                      </h1>
                                    ),
                                    h2: ({ children }) => (
                                      <h2 className="text-lg font-semibold text-gray-800 mb-2">
                                        {children}
                                      </h2>
                                    ),
                                    h3: ({ children }) => (
                                      <h3 className="text-base font-medium text-gray-700 mb-2">
                                        {children}
                                      </h3>
                                    ),
                                    p: ({ children }) => (
                                      <p className="text-gray-600 mb-3 leading-relaxed">
                                        {children}
                                      </p>
                                    ),
                                    ul: ({ children }) => (
                                      <ul className="list-disc list-inside mb-3 text-gray-600 space-y-1">
                                        {children}
                                      </ul>
                                    ),
                                    ol: ({ children }) => (
                                      <ol className="list-decimal list-inside mb-3 text-gray-600 space-y-1">
                                        {children}
                                      </ol>
                                    ),
                                    strong: ({ children }) => (
                                      <strong className="font-semibold text-gray-800">
                                        {children}
                                      </strong>
                                    ),
                                    em: ({ children }) => (
                                      <em className="italic text-gray-700">
                                        {children}
                                      </em>
                                    ),
                                  }}
                                >
                                  {itemDetails.description}
                                </ReactMarkdown>
                              </div>
                            </div>
                          )}

                          {/* Project Team */}
                          {itemDetails.founders &&
                            itemDetails.founders.length > 0 && (
                              <div className="mt-6 pt-6 border-t border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                  <Users className="w-5 h-5 text-blue-500" />
                                  Team Members
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {itemDetails.founders.map(
                                    (founder: any, index: number) => (
                                      <div
                                        key={index}
                                        className="bg-gray-50 rounded-lg p-4 border"
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Users className="w-6 h-6 text-blue-600" />
                                          </div>
                                          <div>
                                            <p className="font-medium text-gray-900">
                                              {founder.name}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                              Team Member
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="flex justify-center items-center py-12">
                    <p className="text-gray-600">
                      Failed to load details. Please try again.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
