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
} from "lucide-react";
import { authenticatedFetch } from "@/lib/api";

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

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

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
          {isLoading && (
            <div className="p-6 w-full">
              <div className="text-center text-app-text-secondary">
                Loading search results...
              </div>
            </div>
          )}

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

              <div className="flex flex-col gap-4">
                {searchResults.results.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-lg shadow p-4 bg-app-surface"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                          item.type
                        )}`}
                      >
                        {getTypeIcon(item.type)}
                        {getTypeLabel(item.type)}
                      </span>
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

              {/* <div className="bg-white rounded-lg p-4 mt-6 shadow">
                <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                  {JSON.stringify(searchResults.results, null, 2)}
                </pre>
              </div> */}

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

      <Footer />
    </div>
  );
}
