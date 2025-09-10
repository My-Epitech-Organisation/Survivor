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
    award: "text-app-orange-primary bg-app-orange-light border-app-orange-light",
    launch: "text-app-red-primary bg-app-red-primary/10 border-app-red-primary/20",
    partnership: "text-app-green-primary bg-app-green-light border-app-green-light",
    funding: "text-app-yellow-primary bg-app-yellow-light border-app-yellow-light",
    default: "text-app-text-secondary bg-app-surface-hover border-app-border-light",
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
          image_url: newsDetail.image_url || "",
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
        className="group bg-app-surface rounded-xl shadow-sm hover:shadow-lg border border-app-border-light overflow-hidden transition-all duration-300 cursor-pointer hover:-translate-y-1 flex flex-col h-full"
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
          <h3 className="font-semibold text-lg text-app-text-primary mb-3 line-clamp-2 group-hover:text-jeb-hover transition-colors flex-1">
            {item.title}
          </h3>

          {/* Metadata */}
          <div className="flex items-center justify-between text-sm text-app-text-secondary mt-auto">
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
        <div className="h-1 bg-gradient-to-r from-jeb-one to-jeb-nine transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
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
            <DialogClose className="absolute top-4 right-4 z-50 rounded-full p-2 text-app-text-secondary hover:text-app-text-primary hover:bg-app-surface-hover transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-app-ring focus:ring-offset-2 focus:ring-offset-transparent cursor-pointer backdrop-blur-sm">
              <X className="h-6 w-6" />
              <span className="sr-only">Close</span>
            </DialogClose>

            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-jeb-one to-jeb-nine text-white p-6">
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
              {selectedNews?.image_url && (
                <div className="relative h-64 sm:h-80 bg-app-surface-hover">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${getBackendUrl()}${selectedNews.image_url}`}
                    alt={selectedNews.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              )}

              {/* Description */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-app-text-primary mb-4 flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-jeb-primary" />
                  Article Details
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
                        <em className="italic text-app-text-primary">{children}</em>
                      ),
                      code: ({ children }) => (
                        <code className="bg-app-surface-hover px-1.5 py-0.5 rounded text-sm font-mono text-app-text-primary">
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
              <div className="absolute inset-0 bg-app-surface/80 backdrop-blur-sm flex justify-center items-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-3 border-jeb-primary border-t-transparent"></div>
                  <p className="text-sm text-app-text-secondary">
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
