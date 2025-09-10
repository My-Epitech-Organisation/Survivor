"use client";

import AdminNavigation from "@/components/AdminNavigation";
import { useState, useEffect } from "react";
import { TbLoader3 } from "react-icons/tb";
import { FaSortDown, FaSortUp, FaSort } from "react-icons/fa";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { NewsDetailItem } from "@/types/news";
import { Newspaper } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import AdminNews from "@/components/AdminNews";
import AdminNewsForm from "@/components/AdminNewsForm";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import Footer from "@/components/Footer";

type SortColumn =
  | "id"
  | "title"
  | "category"
  | "news_date"
  | "location"
  | "startup_id"
  | null;
type SortDirection = "asc" | "desc" | null;

export default function AdminNewsPage() {
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [newsList, setNewsList] = useState<NewsDetailItem[] | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterLocation, setFilterLocation] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    if (newsList) {
      const uniqueCategories = [
        ...new Set(newsList.map((news) => news.category)),
      ];
      const uniqueLocations = [
        ...new Set(newsList.map((news) => news.location)),
      ];

      setCategories(uniqueCategories);
      setLocations(uniqueLocations);
    }
  }, [newsList]);

  const fetchNews = async () => {
    setIsDataLoading(true);
    try {
      const resp = (await api.get<NewsDetailItem[]>({ endpoint: "/news/" }))
        .data;
      setNewsList(resp);
    } catch (error) {
      console.error(error);
    }
    setIsDataLoading(false);
  };

  const handleSort = (column: SortColumn) => {
    let newDirection: SortDirection = "asc";

    // cycle through: null -> asc -> desc -> null
    if (sortColumn === column) {
      if (sortDirection === null) {
        newDirection = "asc";
      } else if (sortDirection === "asc") {
        newDirection = "desc";
      } else {
        newDirection = null;
        setSortColumn(null);
        setSortDirection(null);
        return;
      }
    } else {
      newDirection = "asc";
    }

    setSortColumn(column);
    setSortDirection(newDirection);
  };

  const normalizeText = (text: string): string => {
    if (typeof text !== "string") return "";

    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[''´`]/g, "")
      .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "");
  };

  const getSortedNewsList = () => {
    if (!newsList) return null;

    let filteredList = [...newsList];
    if (filterCategory) {
      filteredList = filteredList.filter(
        (news) => news.category === filterCategory
      );
    }
    if (filterLocation) {
      filteredList = filteredList.filter(
        (news) => news.location === filterLocation
      );
    }

    if (sortColumn && sortDirection) {
      filteredList.sort((a, b) => {
        let valueA, valueB;

        switch (sortColumn) {
          case "id":
            valueA = a.id;
            valueB = b.id;
            break;
          case "title":
            valueA = normalizeText(a.title);
            valueB = normalizeText(b.title);
            break;
          case "category":
            valueA = normalizeText(a.category);
            valueB = normalizeText(b.category);
            break;
          case "news_date":
            valueA = new Date(a.news_date).getTime();
            valueB = new Date(b.news_date).getTime();
            break;
          case "location":
            valueA = normalizeText(a.location);
            valueB = normalizeText(b.location);
            break;
          case "startup_id":
            valueA = a.startup_id;
            valueB = b.startup_id;
            break;
          default:
            return 0;
        }

        if (sortDirection === "asc") {
          return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        } else {
          return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
        }
      });
    }

    return filteredList;
  };

  const handleEditNewsSubmit = (
    id: number,
    data: NewsDetailItem,
    btnAction: HTMLButtonElement | null
  ) => {
    api
      .put(`/news/${id}/`, data)
      .then((response) => {
        console.debug("News edited successfully:", response.data);
        if (btnAction) {
          btnAction.click();
        }
        fetchNews();
        toast("News updated", {
          description: "The news has been updated successfully.",
        });
      })
      .catch((error) => {
        toast("Edit error", {
          className: "!text-red-500",
          description: (
            <span className="text-red-500">
              An error occurred while editing news: {String(error)}
            </span>
          ),
        });
        console.error("Error editing news:", error);
      });
  };

  const handleDeleteNewsSubmit = (
    newsId: number,
    btnAction: HTMLButtonElement | null
  ) => {
    api
      .delete(`/news/${newsId}/`)
      .then((response) => {
        console.debug("News deleted successfully:", response.data);
        if (btnAction) {
          btnAction.click();
        }
        fetchNews();
        toast("News deleted", {
          description: "The news has been deleted successfully.",
        });
      })
      .catch((error) => {
        toast("Delete error", {
          className: "!text-red-500",
          description: (
            <span className="text-red-500">
              An error occurred while deleting news: {String(error)}
            </span>
          ),
        });
        console.error("Error deleting news:", error);
      });
  };

  const handleCreateNews = (data: NewsDetailItem) => {
    const newsData = {
      title: data.title,
      category: data.category,
      news_date: data.news_date,
      location: data.location,
      startup_id: data.startup_id || 0,
      description: data.description,
      image_url: data.image_url,
    };

    console.debug("Sending news data to backend:", newsData);
    api
      .post("/news/", newsData)
      .then((response) => {
        console.debug("News created successfully:", response.data);
        fetchNews();
        toast("News created", {
          description: "The news has been created successfully.",
        });
      })
      .catch((error) => {
        toast("Create error", {
          className: "!text-red-500",
          description: (
            <span className="text-red-500">
              An error occurred while creating news: {String(error)}
            </span>
          ),
        });
        console.error("Error creating news:", error);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-jeb-gradient-from to-jeb-gradient-to/50">
      <AdminNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isDataLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <TbLoader3 className="size-12 animate-spin text-jeb-primary mb-4" />
            <p className="text-app-text-secondary text-lg">Loading news...</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-app-text-primary mb-6">
                News Management
              </h1>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="bg-jeb-primary text-white px-4 py-2 rounded-md hover:bg-jeb-hover font-bold transition-colors cursor-pointer">
                    Add News
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px] md:max-w-[60dvw] max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-heading flex items-center gap-2">
                      Create new News
                    </DialogTitle>
                  </DialogHeader>
                  <AdminNewsForm onSubmit={(data) => handleCreateNews(data)} />
                </DialogContent>
              </Dialog>
            </div>

            {/* Filters */}
            <div className="bg-app-surface rounded-lg p-4 mb-6 flex flex-wrap gap-4">
              <div className="flex flex-col w-64">
                <label className="text-sm font-medium mb-1 text-app-text-secondary">
                  Category
                </label>
                <select
                  className="border border-app-border rounded-md p-2 bg-app-surface hover:border-app-text-muted transition-colors"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col w-64">
                <label className="text-sm font-medium mb-1 text-app-text-secondary">
                  Location
                </label>
                <select
                  className="border border-app-border rounded-md p-2 bg-app-surface hover:border-app-text-muted transition-colors"
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                >
                  <option value="">All Locations</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="text-app-text-secondary hover:text-app-text-primary px-4 py-2 rounded-md transition-colors self-end cursor-pointer"
                onClick={() => {
                  setFilterCategory("");
                  setFilterLocation("");
                }}
              >
                Clear All Filters
              </button>
            </div>

            {/* News content */}
            <div className="max-w-7xl mx-auto bg-app-surface rounded-2xl p-5">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="text-center cursor-pointer hover:bg-app-surface-hover transition-colors"
                      onClick={() => handleSort("id")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        ID
                        {sortColumn === "id" &&
                          (sortDirection === "asc" ? (
                            <FaSortUp />
                          ) : sortDirection === "desc" ? (
                            <FaSortDown />
                          ) : null)}
                        {sortColumn !== "id" && (
                          <FaSort className="text-gray-300" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-center border-l cursor-pointer hover:bg-app-surface-hover transition-colors"
                      onClick={() => handleSort("title")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Title
                        {sortColumn === "title" &&
                          (sortDirection === "asc" ? (
                            <FaSortUp />
                          ) : sortDirection === "desc" ? (
                            <FaSortDown />
                          ) : null)}
                        {sortColumn !== "title" && (
                          <FaSort className="text-app-text-muted" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-center border-l cursor-pointer hover:bg-app-surface-hover transition-colors"
                      onClick={() => handleSort("category")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Category
                        {sortColumn === "category" &&
                          (sortDirection === "asc" ? (
                            <FaSortUp />
                          ) : sortDirection === "desc" ? (
                            <FaSortDown />
                          ) : null)}
                        {sortColumn !== "category" && (
                          <FaSort className="text-app-text-muted" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-center border-l cursor-pointer hover:bg-app-surface-hover transition-colors"
                      onClick={() => handleSort("news_date")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Date
                        {sortColumn === "news_date" &&
                          (sortDirection === "asc" ? (
                            <FaSortUp />
                          ) : sortDirection === "desc" ? (
                            <FaSortDown />
                          ) : null)}
                        {sortColumn !== "news_date" && (
                          <FaSort className="text-app-text-muted" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-center border-l cursor-pointer hover:bg-app-surface-hover transition-colors"
                      onClick={() => handleSort("location")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Location
                        {sortColumn === "location" &&
                          (sortDirection === "asc" ? (
                            <FaSortUp />
                          ) : sortDirection === "desc" ? (
                            <FaSortDown />
                          ) : null)}
                        {sortColumn !== "location" && (
                          <FaSort className="text-app-text-muted" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="text-center border-l cursor-pointer hover:bg-app-surface-hover transition-colors"
                      onClick={() => handleSort("startup_id")}
                    >
                      <div className="flex items-center justify-center gap-1">
                        Startup ID
                        {sortColumn === "startup_id" &&
                          (sortDirection === "asc" ? (
                            <FaSortUp />
                          ) : sortDirection === "desc" ? (
                            <FaSortDown />
                          ) : null)}
                        {sortColumn !== "startup_id" && (
                          <FaSort className="text-app-text-muted" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-center border-l">
                      Settings
                    </TableHead>
                    <TableHead className="text-center border-l">
                      Delete
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getSortedNewsList()?.map((newsItem) => {
                    return (
                      <AdminNews
                        key={newsItem.id}
                        news={newsItem}
                        editCB={handleEditNewsSubmit}
                        deleteCB={handleDeleteNewsSubmit}
                      />
                    );
                  })}
                </TableBody>
              </Table>
              {(!newsList || newsList.length === 0) && (
                <div className="flex items-center justify-center py-12 gap-3">
                  <Newspaper className="w-8 h-8 text-app-text-muted" />
                  <span className="text-app-text-muted text-lg font-medium">
                    No news found
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
