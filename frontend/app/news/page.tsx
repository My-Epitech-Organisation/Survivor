"use client";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import NewsCard from "@/components/NewsCard";
import NewsFilters from "@/components/NewsFilters";
import { useEffect, useState, useCallback } from "react";
import { NewsItem } from "@/types/news";
import { authenticatedFetch } from "@/lib/api";

export default function News() {
  const [error, setError] = useState<string | null>(null);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  const [activeFilters, setActiveFilters] = useState({
    categories: [] as string[],
    locations: [] as string[],
    dateRange: null as string | null,
  });

  useEffect(() => {
    const fetchNews = async () => {
      const response = await authenticatedFetch("/news/");

      if (!response.ok) {
        setError("Error fetching news");
        return;
      }

      const data: NewsItem[] = await response.json();

      setNewsList(data);

      // Extract unique categories and locations
      const uniqueCategories = [...new Set(data.map((item) => item.category))];
      const uniqueLocations = [...new Set(data.map((item) => item.location))];

      setCategories(uniqueCategories);
      setLocations(uniqueLocations);
    };

    fetchNews();
  }, []);

  const handleFiltersChange = useCallback(
    (filters: {
      categories: string[];
      locations: string[];
      dateRange: string | null;
    }) => {
      setActiveFilters(filters);
    },
    []
  );

  const getFilteredNews = () => {
    return newsList.filter((item) => {
      const categoryMatch =
        activeFilters.categories.length === 0 ||
        activeFilters.categories.includes(item.category);

      const locationMatch =
        activeFilters.locations.length === 0 ||
        activeFilters.locations.includes(item.location);

      // Date filtering logic
      const dateMatch =
        !activeFilters.dateRange ||
        checkDateRange(item.news_date, activeFilters.dateRange);

      return categoryMatch && locationMatch && dateMatch;
    });
  };

  const checkDateRange = (newsDate: string, dateRange: string): boolean => {
    const now = new Date();
    const itemDate = new Date(newsDate);

    switch (dateRange) {
      case "last_week":
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return itemDate >= lastWeek;
      case "last_month":
        const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return itemDate >= lastMonth;
      case "last_3_months":
        const last3Months = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return itemDate >= last3Months;
      case "last_6_months":
        const last6Months = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        return itemDate >= last6Months;
      case "last_year":
        const lastYear = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        return itemDate >= lastYear;
      default:
        return true;
    }
  };

  const filteredNews = getFilteredNews();

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-app-gradient-from to-app-gradient-to flex flex-col">
        <Navigation />

        <main className="flex-1 py-6">
          <div className="max-w-[90rem] mx-auto px-4 sm:px-6">
            <h1 className="text-3xl font-bold text-app-text-primary mb-6">
              News
            </h1>

            <div className="mb-8">
              <NewsFilters
                categories={categories}
                locations={locations}
                onFiltersChange={handleFiltersChange}
              />
            </div>

            {error && (
              <div className="rounded-md border border-red-200 text-red-600 text-sm bg-red-50 p-4 mb-6">
                {error}
              </div>
            )}

            <div className="grid lg:grid-cols-3 sm:grid-cols-1 md:grid-cols-2 gap-6">
              {filteredNews.map((news) => (
                <NewsCard key={news.id} item={news} />
              ))}
            </div>

            {filteredNews.length === 0 && !error && (
              <div className="text-center py-12">
                <p className="text-app-text-secondary text-lg">
                  No news found matching your filters.
                </p>
                <p className="text-app-text-muted text-sm mt-2">
                  Try adjusting your filter criteria.
                </p>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
