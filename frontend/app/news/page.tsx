"use client";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import NewsCard from "@/components/NewsCard";
import { useEffect, useState } from "react";
import { NewsItem, NewsFilter } from "@/types/news";
import { authenticatedFetch } from "@/lib/api";
import { Filter, Trash2 } from "lucide-react";

export default function News() {
  const [error, setError] = useState<string | null>(null);

  const [newsList, setNewsList] = useState<NewsItem[]>([]);

  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  useEffect(() => {
    const fillFilterFields = (data: NewsItem[]) => {
      let tempCategories: string[] = [];
      let tempLocations: string[] = [];

      data.forEach((item) => {
        if (!tempCategories.includes(item.category)) {
          tempCategories = [...tempCategories, item.category];
        }
        if (!tempLocations.includes(item.location)) {
          tempLocations = [...tempLocations, item.location];
        }
      });

      setCategories(tempCategories);
      setLocations(tempLocations);
    };

    const fetchNews = async () => {
      const response = await authenticatedFetch("/news/");

      if (!response.ok) {
        setError("Error fetching news");
        return;
      }

      const data: NewsItem[] = await response.json();

      setNewsList(data);
      fillFilterFields(data);
    };

    fetchNews();
  }, []);

  const resetSelects = () => {
    setSelectedLocation(null);
    const locationSelect = document.getElementById(
      "locationSelect"
    ) as HTMLSelectElement;
    if (locationSelect) {
      locationSelect.value = "none";
    }

    setSelectedCategory(null);
    const categorySelect = document.getElementById(
      "categorySelect"
    ) as HTMLSelectElement;
    if (categorySelect) {
      categorySelect.value = "none";
    }
  };

  const filterNews = () => {
    return newsList.filter((item) => {
      if (selectedCategory && selectedCategory != item.category) return false;
      if (selectedLocation && selectedLocation != item.location) return false;
      return true;
    });
  };

  const filteredNews = filterNews();

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-app-gradient-from to-app-gradient-to flex flex-col">
        <Navigation />

        <main className="flex-1 w-full max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-app-text-primary mb-6">
              News
            </h1>

            <div className="bg-app-surface rounded-lg shadow p-6 mb-6 flex flex-col gap-6">
              <div className="flex gap-2 items-center">
                <Filter />
                <h2>Filters</h2>
              </div>
              <div className="flex flex-col lg:justify-start lg:flex-row md:flex-row gap-8 ">
                <select
                  name="Locations"
                  id="locationSelect"
                  className="cursor-pointer hover:bg-app-surface-hover border rounded-md p-2 w-full"
                >
                  <option
                    value="none"
                    key="none"
                    id="locationNone"
                    onClick={() => setSelectedLocation(null)}
                  >
                    None
                  </option>
                  {locations.map((item, index) => (
                    <option
                      value={item}
                      key={index}
                      onClick={() => setSelectedLocation(item)}
                    >
                      {item}
                    </option>
                  ))}
                </select>

                <select
                  name="Categories"
                  id="categorySelect"
                  className="cursor-pointer hover:bg-app-surface-hover border rounded-md p-2 w-full"
                >
                  <option
                    value="none"
                    key="none"
                    id="categoryNone"
                    onClick={() => setSelectedCategory(null)}
                  >
                    None
                  </option>
                  {categories.map((item, index) => (
                    <option
                      value={item}
                      key={index}
                      onClick={() => setSelectedCategory(item)}
                    >
                      {item}
                    </option>
                  ))}
                </select>

                <div
                  className="whitespace-nowrap flex justify-center items-center font-small text-app-text-secondary gap-2 cursor-pointer p-2 px-3 border rounded-md hover:bg-app-surface-hover"
                  onClick={resetSelects}
                >
                  Clear filters
                  <Trash2 />
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-md border border-red-200 text-red-600 text-sm bg-red-50 p-4 mx-12">
                {error}
              </div>
            )}

            {/* Place for the filters */}

            <div className="grid lg:grid-cols-3 sm:grid-cols-1 md:grid-cols-2 gap-6">
              {filteredNews.map((news) => (
                <NewsCard key={news.id} item={news} />
              ))}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
