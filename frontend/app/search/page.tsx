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
  Users,
  TrendingUp,
  CheckCircle,
  Eye,
  Calendar1,
  TableProperties,
  Filter,
  ChevronDown,
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
import {
  ItemEntity,
  SearchItem,
  SearchResponse,
  NewsSearchEntity,
  EventSearchEntity,
  ProjectSearchEntity,
  SearchProjectFounder,
} from "@/types/search";

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SearchItem | null>(null);
  const [itemDetails, setItemDetails] = useState<ItemEntity | null>(null);
  const [selectedType, setSelectedType] = useState<string>("");

  const isEvent = (entity: ItemEntity): entity is EventSearchEntity => {
    return entity.result_type === "event";
  };

  const isNewsItem = (entity: ItemEntity): entity is NewsSearchEntity => {
    return entity.result_type === "news";
  };

  const isProject = (entity: ItemEntity): entity is ProjectSearchEntity => {
    return entity.result_type === "project";
  };

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
        return "text-app-blue-primary bg-app-blue-muted";
      case "event":
        return "text-app-green-primary bg-app-green-light";
      case "news":
        return "text-app-orange-primary bg-app-orange-light";
      default:
        return "text-app-blue-primary bg-app-blue-muted";
    }
  };

  const clearInput = () => {
    const inputField = document.getElementById(
      "search-bar"
    ) as HTMLInputElement;
    if (inputField) {
      inputField.value = "";
    }
    setSelectedType("");
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
      const params = new URLSearchParams({
        search: searchQuery,
      });

      if (selectedType) {
        params.append("type", selectedType);
      }

      searchUrl = `/search/?${params.toString()}`;
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
    <div className="min-h-screen bg-gradient-to-br from-jeb-gradient-from to-jeb-gradient-to/50 flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="font-heading text-3xl font-bold text-app-text-primary mb-8">
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
                className="rounded-lg border shadow py-2 px-6 w-full hover:border-app-text-muted transition-colors active:border-jeb-primary"
              />

              <div className="flex gap-3 justify-end w-full sm:w-fit">
                <div className="relative w-full sm:w-fit">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <Filter className="w-4 h-4 text-app-text-secondary" />
                  </div>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="rounded-lg border shadow py-2 pl-10 pr-10 hover:border-app-text-muted transition-colors text-app-text-muted cursor-pointer appearance-none leading-normal"
                  >
                    <option value="">All Types</option>
                    <option value="project">Projects</option>
                    <option value="event">Events</option>
                    <option value="news">News</option>
                  </select>
                  <div className="absolute left-32 top-1/3 pointer-events-none">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex gap-2">
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
              </div>
            </form>
          </div>

          {/* Search Results Section */}
          {searchResults && (
            <div className="p-6 w-full">
              <div className="flex justify-between items-center mb-4 gap-6">
                <h2 className="font-heading text-xl font-semibold text-app-text-primary">
                  Search Results ({searchResults.count} results)
                </h2>

                {/* Pagination Controls at the top */}
                {(searchResults.previous || searchResults.next) && (
                  <div className="flex gap-2 flex-col sm:flex-row">
                    {searchResults.previous && (
                      <button
                        onClick={handlePreviousPage}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-jeb-primary text-app-white rounded-lg hover:bg-jeb-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    )}

                    {searchResults.next && (
                      <button
                        onClick={handleNextPage}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-jeb-primary text-app-white rounded-lg hover:bg-jeb-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:cursor-pointer"
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
                    className="rounded-lg shadow p-4 bg-app-surface hover:bg-app-surface-hover cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-lg"
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
                      <button className="flex items-center gap-1 text-xs bg-jeb-primary text-app-white hover:bg-jeb-hover px-2 py-1 rounded transition-colors cursor-pointer">
                        <Eye className="w-3 h-3" />
                        View Details
                      </button>
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-app-text-primary mb-2">
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
                        className="flex items-center gap-2 px-4 py-2 bg-jeb-primary text-app-white rounded-lg hover:bg-jeb-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:cursor-pointer"
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
                        className="flex items-center gap-2 px-4 py-2 bg-jeb-primary text-app-white rounded-lg hover:bg-jeb-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:cursor-pointer"
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
                  <DialogTitle className="font-heading text-2xl font-bold leading-tight pr-8">
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
                        <div className="flex flex-wrap gap-4 text-sm text-app-text-secondary">
                          <div className="flex items-center gap-2">
                            <Calendar1 className="w-4 h-4" />
                            <span>
                              {new Date(itemDetails.dates).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{itemDetails.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TableProperties className="w-4 h-4" />
                            <span>{itemDetails.event_type}</span>
                          </div>
                        </div>

                        {/* Event Description */}
                        <div className="mt-6 pt-6 border-t border-app-border">
                          <h3 className="font-heading text-lg font-semibold text-app-text-primary mb-4">
                            Description
                          </h3>
                          <div className="prose prose-gray max-w-none">
                            <ReactMarkdown
                              components={{
                                h1: ({ children }) => (
                                  <h1 className="text-xl font-bold text-app-text-primary mb-3">
                                    {children}
                                  </h1>
                                ),
                                h2: ({ children }) => (
                                  <h2 className="text-lg font-semibold text-app-text-primary mb-2">
                                    {children}
                                  </h2>
                                ),
                                h3: ({ children }) => (
                                  <h3 className="text-base font-medium text-app-text-primary mb-2">
                                    {children}
                                  </h3>
                                ),
                                p: ({ children }) => (
                                  <p className="text-app-text-secondary mb-3 leading-relaxed">
                                    {children}
                                  </p>
                                ),
                                ul: ({ children }) => (
                                  <ul className="list-disc list-inside mb-3 text-app-text-secondary space-y-1">
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="list-decimal list-inside mb-3 text-app-text-secondary space-y-1">
                                    {children}
                                  </ol>
                                ),
                                strong: ({ children }) => (
                                  <strong className="font-semibold text-app-text-primary">
                                    {children}
                                  </strong>
                                ),
                                em: ({ children }) => (
                                  <em className="italic text-app-text-secondary">
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

                    {selectedItem.type === "news" &&
                      isNewsItem(itemDetails) && (
                        <div className="space-y-6">
                          {/* News Metadata */}
                          <div className="flex flex-wrap gap-4 text-sm text-app-text-secondary">
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
                          <div className="mt-6 pt-6 border-t border-app-border">
                            <h3 className="font-heading text-lg font-semibold text-app-text-primary mb-4">
                              Article Content
                            </h3>
                            <div className="prose prose-gray max-w-none">
                              <ReactMarkdown
                                components={{
                                  h1: ({ children }) => (
                                    <h1 className="text-xl font-bold text-app-text-primary mb-3">
                                      {children}
                                    </h1>
                                  ),
                                  h2: ({ children }) => (
                                    <h2 className="text-lg font-semibold text-app-text-primary mb-2">
                                      {children}
                                    </h2>
                                  ),
                                  h3: ({ children }) => (
                                    <h3 className="text-base font-medium text-app-text-primary mb-2">
                                      {children}
                                    </h3>
                                  ),
                                  p: ({ children }) => (
                                    <p className="text-app-text-secondary mb-3 leading-relaxed">
                                      {children}
                                    </p>
                                  ),
                                  ul: ({ children }) => (
                                    <ul className="list-disc list-inside mb-3 text-app-text-secondary space-y-1">
                                      {children}
                                    </ul>
                                  ),
                                  ol: ({ children }) => (
                                    <ol className="list-decimal list-inside mb-3 text-app-text-secondary space-y-1">
                                      {children}
                                    </ol>
                                  ),
                                  strong: ({ children }) => (
                                    <strong className="font-semibold text-app-text-primary">
                                      {children}
                                    </strong>
                                  ),
                                  em: ({ children }) => (
                                    <em className="italic text-app-text-secondary">
                                      {children}
                                    </em>
                                  ),
                                  code: ({ children }) => (
                                    <code className="bg-app-surface-hover px-1.5 py-0.5 rounded text-sm font-mono text-app-text-primary">
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
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-app-blue-primary/10 text-app-blue-primary border border-app-blue-primary/20">
                                <Building className="w-4 h-4" />
                                {itemDetails.sector}
                              </span>
                            )}
                            {itemDetails.project_status && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-app-green-primary/10 text-app-green-primary border border-app-green-primary/20">
                                <CheckCircle className="w-4 h-4" />
                                {itemDetails.project_status}
                              </span>
                            )}
                            {itemDetails.maturity && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-app-purple-primary/10 text-app-purple-primary border border-app-purple-primary/20">
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
                                  <h3 className="font-heading text-sm font-semibold text-app-text-primary mb-1">
                                    Address
                                  </h3>
                                  <p className="text-app-text-primary">
                                    {itemDetails.address}
                                  </p>
                                </div>
                              )}
                              {itemDetails.name && (
                                <div>
                                  <h3 className="font-heading text-sm font-semibold text-app-text-primary mb-1">
                                    Project Name
                                  </h3>
                                  <p className="text-app-text-primary">
                                    {itemDetails.name}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="space-y-4">
                              {itemDetails.website_url && (
                                <div>
                                  <h3 className="font-heading text-sm font-semibold text-gray-700 mb-1">
                                    Website
                                  </h3>
                                  <a
                                    href={itemDetails.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-app-blue-primary hover:text-app-blue-primary/80 transition-colors"
                                  >
                                    {itemDetails.website_url}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Project Description */}
                          {itemDetails.description && (
                            <div className="mt-6 pt-6 border-t border-app-border">
                              <h3 className="font-heading text-lg font-semibold text-app-text-primary mb-4">
                                Description
                              </h3>
                              <div className="prose prose-gray max-w-none">
                                <ReactMarkdown
                                  components={{
                                    h1: ({ children }) => (
                                      <h1 className="text-xl font-bold text-app-text-primary mb-3">
                                        {children}
                                      </h1>
                                    ),
                                    h2: ({ children }) => (
                                      <h2 className="text-lg font-semibold text-app-text-primary mb-2">
                                        {children}
                                      </h2>
                                    ),
                                    h3: ({ children }) => (
                                      <h3 className="text-base font-medium text-app-text-primary mb-2">
                                        {children}
                                      </h3>
                                    ),
                                    p: ({ children }) => (
                                      <p className="text-app-text-secondary mb-3 leading-relaxed">
                                        {children}
                                      </p>
                                    ),
                                    ul: ({ children }) => (
                                      <ul className="list-disc list-inside mb-3 text-app-text-secondary space-y-1">
                                        {children}
                                      </ul>
                                    ),
                                    ol: ({ children }) => (
                                      <ol className="list-decimal list-inside mb-3 text-app-text-secondary space-y-1">
                                        {children}
                                      </ol>
                                    ),
                                    strong: ({ children }) => (
                                      <strong className="font-semibold text-app-text-primary">
                                        {children}
                                      </strong>
                                    ),
                                    em: ({ children }) => (
                                      <em className="italic text-app-text-secondary">
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
                              <div className="mt-6 pt-6 border-t border-app-border">
                                <h3 className="font-heading text-lg font-semibold text-app-text-primary mb-4 flex items-center gap-2">
                                  <Users className="w-5 h-5 text-app-blue-primary" />
                                  Team Members
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {itemDetails.founders.map(
                                    (
                                      founder: SearchProjectFounder,
                                      index: number
                                    ) => (
                                      <div
                                        key={index}
                                        className="bg-app-surface-hover rounded-lg p-4 border border-app-border"
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className="w-12 h-12 bg-app-blue-primary/10 rounded-full flex items-center justify-center">
                                            <Users className="w-6 h-6 text-app-blue-primary" />
                                          </div>
                                          <div>
                                            <p className="font-medium text-app-text-primary">
                                              {founder.name}
                                            </p>
                                            <p className="text-sm text-app-text-secondary">
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
                    <p className="text-app-text-secondary">
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
