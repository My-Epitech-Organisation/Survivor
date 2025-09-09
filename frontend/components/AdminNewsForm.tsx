"use client"
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { InputWithLabel } from "@/components/ui/inputWithLabel";
import { DialogClose } from "@radix-ui/react-dialog";
import { NewsDetailItem } from "@/types/news";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Label } from "./ui/label";
import { getBackendUrl } from "@/lib/config";

interface AdminNewsFormProps {
  defaultData?: NewsDetailItem;
  onSubmit: (data: NewsDetailItem) => void;
}

export default function AdminNewsForm({
  defaultData,
  onSubmit,
}: AdminNewsFormProps) {
  const initialFormData: NewsDetailItem = {
    id: 0,
    title: "",
    category: "",
    news_date: new Date().toISOString().split('T')[0],
    location: "",
    startup_id: 0,
    description: "",
    image_url: ""
  };

  const [formData, setFormData] = useState<NewsDetailItem>(
    defaultData || initialFormData
  );
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);

  const fetchOptions = async () => {
    try {
      const result = (await api.get<NewsDetailItem[]>({endpoint: "/news/"}));
      const newsData = result.data;

      if (newsData) {
        const uniqueCategories = [...new Set(newsData.map(news => news.category))];
        const uniqueLocations = [...new Set(newsData.map(news => news.location))];

        setCategories(uniqueCategories);
        setLocations(uniqueLocations);
      }
    } catch (error) {
      console.error("Error fetching options:", error);
    }
  };

  useEffect(() => {
    fetchOptions();
    if (defaultData) {
      setFormData(defaultData);
      if (defaultData.image_url) {
        setPreview(defaultData.image_url);
      }
    }
  }, [defaultData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;

    const fieldMappings: Record<string, string> = {
      "news-title": "title",
      "news-category": "category",
      "news-date": "news_date",
      "news-location": "location",
      "news-startup-id": "startup_id",
      "news-description": "description"
    };

    const fieldName = fieldMappings[id] || id;
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];

      try {
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);

        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = reader.result as string;
          try {
            const res = await api.post<{ url: string }>("/media/upload/", { url: base64String });
            if (res && res.data && res.data.url) {
              const imageUrl = res.data.url;
              setFormData(prev => ({ ...prev, image_url: imageUrl }));
              toast.success("Image uploaded successfully");
            } else {
              throw new Error("API didn't return an image url");
            }
          } catch (error) {
            console.error("Error uploading image:", error);
            toast.error("Failed to upload image");
          }
        };
        reader.readAsDataURL(selectedFile);
      } catch (error) {
        console.error("Error processing image:", error);
        toast.error("Failed to process image");
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const requiredFields = ["title", "category", "news_date", "location", "description"];

      const missingFields = requiredFields.filter(
        (field) =>
          !formData[field as keyof NewsDetailItem] ||
          (typeof formData[field as keyof NewsDetailItem] === "string" &&
          (formData[field as keyof NewsDetailItem] as string).trim() === "")
      );

      if (missingFields.length > 0) {
        toast("Save error", {
          className: "!text-red-500",
          description: (
            <span className="text-red-500">
              Please fill all required fields: {[
                ...missingFields,
              ].join(", ")}
            </span>
          ),
        });
        return;
      }

      const submissionData = { ...formData };
      if (!submissionData.startup_id) {
        submissionData.startup_id = 0;
      }

      console.debug("Submitting news:", submissionData);
      onSubmit(submissionData);

    } catch (error) {
      console.error("Error submitting news:", error);
    }
  };

  return (
    <>
      <div className="space-y-8">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 relative">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">News Information</h2>
            </div>
          </div>

          {/* News image upload section */}
          <div className="mb-6 flex flex-col items-center">
            <div className="w-full mb-4">
              <Label htmlFor="news-image" className="mb-2 block">News Image</Label>
              <div className="flex flex-col items-center gap-3">
                {preview && (
                  <div className="w-full max-h-60 overflow-hidden rounded-lg mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview.startsWith('/') ? `${getBackendUrl()}${preview}` : preview}
                      alt="News preview"
                      className="w-full h-auto object-cover rounded-lg"
                    />
                  </div>
                )}
                <input
                  type="file"
                  id="news-image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-app-blue-primary file:text-white
                    hover:file:bg-app-blue-primary-hover"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <InputWithLabel
              label="Title"
              id="news-title"
              placeholder="Enter news title"
              className="md:col-span-2 cursor-pointer"
              value={formData.title}
              onChange={handleInputChange}
              required
            />

            <div className="flex flex-col gap-2">
              <Label htmlFor="news-category">Category *</Label>
              <div className="flex gap-2">
                <select
                  id="news-category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Or enter a new category"
                  className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  onChange={(e) => {
                    if (e.target.value) {
                      setFormData(prev => ({ ...prev, category: e.target.value }));
                    }
                  }}
                />
              </div>
            </div>

            <InputWithLabel
              label="Date"
              id="news-date"
              type="date"
              placeholder="Enter news date"
              className="cursor-pointer"
              value={formData.news_date.split('T')[0]}
              onChange={handleInputChange}
              required
            />

            <div className="flex flex-col gap-2">
              <Label htmlFor="news-location">Location *</Label>
              <div className="flex gap-2">
                <select
                  id="news-location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select a location</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Or enter a new location"
                  className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  onChange={(e) => {
                    if (e.target.value) {
                      setFormData(prev => ({ ...prev, location: e.target.value }));
                    }
                  }}
                />
              </div>
            </div>

            <InputWithLabel
              label="Startup ID (Optional)"
              id="news-startup-id"
              type="number"
              placeholder="Enter startup ID if applicable"
              className="cursor-pointer"
              value={formData.startup_id ? formData.startup_id.toString() : ""}
              onChange={(e) => setFormData(prev => ({ ...prev, startup_id: parseInt(e.target.value) || 0 }))}
            />

            <div className="md:col-span-2">
              <Label htmlFor="news-description" className="mb-2 block">Description *</Label>
              <textarea
                id="news-description"
                placeholder="Enter news description"
                className="min-h-[150px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                value={formData.description}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col-reverse sm:flex-row justify-end gap-4">
        <DialogClose asChild>
          <Button
            variant="outline"
            className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-lg"
          >
            Cancel
          </Button>
        </DialogClose>
        <Button
          className="w-full sm:w-auto px-6 py-2 bg-app-blue-primary hover:bg-app-blue-primary-hover text-white rounded-lg font-semibold shadow"
          onClick={handleSubmit}
        >
          Save
        </Button>
      </div>
    </>
  );
}
