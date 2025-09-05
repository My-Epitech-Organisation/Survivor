"use client";

import { NewsCardProps, NewsItem, NewsDetailItem } from "@/types/news";
import {
  Trophy,
  Rocket,
  Handshake,
  CircleDollarSign,
  Newspaper,
  MapPin,
  Calendar,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { authenticatedFetch } from "@/lib/api";
import { getBackendUrl } from "@/lib/config";
import ReactMarkdown from "react-markdown";

function getCategoryIcon(cat: string) {
  const icons = {
    award: <Trophy className="w-5 h-5" />,
    launch: <Rocket className="w-5 h-5" />,
    partnership: <Handshake className="w-5 h-5" />,
    funding: <CircleDollarSign className="w-5 h-5" />,
    default: <Newspaper className="w-5 h-5" />,
  };
  return icons[cat.toLowerCase() as keyof typeof icons] || icons.default;
}

function getCategoryColor(cat: string) {
  const colors: Record<string, string> = {
    award: "text-orange-600 bg-orange-50 border-orange-200",
    launch: "text-red-600 bg-red-50 border-red-200",
    partnership: "text-green-600 bg-green-50 border-green-200",
    funding: "text-yellow-600 bg-yellow-50 border-yellow-200",
    default: "text-gray-600 bg-gray-50 border-gray-200",
  };
  return colors[cat.toLowerCase()] || colors.default;
}

export default function NewsCard({ item }: NewsCardProps) {
  const [selectedNews, setSelectedNews] = useState<NewsDetailItem | null>(null);
  const [loading, setLoading] = useState(false);

  const selectItem = async (item: NewsItem) => {
    setLoading(true);
    try {
      const response = await authenticatedFetch(`/news/${item.id}/`);
      if (response.ok) {
        const newsDetail = await response.json();
        const selectedItem: NewsDetailItem = {
          ...item,
          description: newsDetail.description,
          pictureURL: newsDetail.image_url || "",
        };
        setSelectedNews(selectedItem);
      }
    } catch (error) {
      console.error("Error fetching news details:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div
        onClick={() => selectItem(item)}
        className="group bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 cursor-pointer hover:-translate-y-1 flex flex-col h-full"
      >
        {/* Category Badge */}
        <div className="p-4 pb-0">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${getCategoryColor(
              item.category
            )}`}
          >
            {getCategoryIcon(item.category)}
            <span className="capitalize">{item.category}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pt-3 flex-1 flex flex-col">
          <h3 className="font-semibold text-lg text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors flex-1">
            {item.title}
          </h3>

          {/* Metadata */}
          <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>{item.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{new Date(item.news_date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Hover effect border */}
        <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
      </div>

      <Dialog
        open={selectedNews !== null}
        onOpenChange={() => setSelectedNews(null)}
      >
        <DialogContent
          className="lg:max-w-4xl w-full max-h-[90vh] overflow-hidden p-0"
          showCloseButton={false}
        >
          <div className="flex flex-col h-full max-h-[90vh]">
            {/* Custom Close Button */}
            <DialogClose className="absolute top-4 right-4 z-50 rounded-full p-2 text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer backdrop-blur-sm">
              <X className="h-6 w-6" />
              <span className="sr-only">Close</span>
            </DialogClose>

            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-white/20 border border-white/30`}
                  >
                    {getCategoryIcon(selectedNews?.category || "")}
                    <span className="capitalize text-white">
                      {selectedNews?.category}
                    </span>
                  </div>
                </div>
                <DialogTitle className="text-2xl font-bold leading-tight pr-8">
                  {selectedNews?.title}
                </DialogTitle>

                {/* Quick info in header */}
                <div className="flex items-center gap-6 mt-3 text-white/90">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedNews?.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {selectedNews?.news_date &&
                        new Date(selectedNews.news_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </DialogHeader>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto">
              {selectedNews?.pictureURL && (
                <div className="relative h-64 sm:h-80 bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getBackendUrl() + selectedNews.pictureURL}
                    alt={selectedNews.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              )}

              {/* Description */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-blue-600" />
                  Article Details
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
                        <em className="italic text-gray-700">{children}</em>
                      ),
                      code: ({ children }) => (
                        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800">
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {selectedNews?.description || "No description available."}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex justify-center items-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-600 border-t-transparent"></div>
                  <p className="text-sm text-gray-600">
                    Loading article details...
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
