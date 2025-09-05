"use client";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import NewsCard from "@/components/NewsCard";
import { useEffect, useState } from "react";
import { NewsItem } from "@/types/news";
import { authenticatedFetch } from "@/lib/api";

export default function News() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      const response = await authenticatedFetch("/news/");

      if (!response.ok) {
        setError("Error fetching news");
        return;
      }

      const data = await response.json();

      setNewsList(data);
    };
    fetchNews();
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-app-gradient-from to-app-gradient-to">
        <Navigation />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-app-text-primary mb-6">
              News
            </h1>

            {error && (
              <div className="rounded-md border border-red-200 text-red-600 text-sm bg-red-50 p-4 mx-12">
                {error}
              </div>
            )}

            {/* Place for the filters */}

            <div className="grid lg:grid-cols-3 sm:grid-cols-1 md:grid-cols-2 gap-6">
              {newsList.map((news) => (
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
