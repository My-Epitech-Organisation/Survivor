"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { InputWithLabel } from "@/components/ui/inputWithLabel";
import { DialogClose } from "@radix-ui/react-dialog";
import { Event } from "@/types/event";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Label } from "./ui/label";
import { getBackendUrl } from "@/lib/config";

interface AdminEventFormProps {
  defaultData?: Event;
  onSubmit: (data: Event) => void;
}

export default function AdminEventForm({
  defaultData,
  onSubmit,
}: AdminEventFormProps) {
  const initialFormData: Event = {
    id: 0,
    name: "",
    dates: new Date().toISOString().split("T")[0],
    location: "",
    description: "",
    event_type: "",
    target_audience: "",
    pictureURL: "",
  };

  const [formData, setFormData] = useState<Event>(
    defaultData || initialFormData
  );
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [audiences, setAudiences] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);

  const fetchOptions = async () => {
    try {
      const result = await api.get<Event[]>({ endpoint: "/events/" });
      const eventsData = result.data;

      if (eventsData) {
        const uniqueTypes = [
          ...new Set(
            eventsData.map((event) => event.event_type).filter(Boolean)
          ),
        ];
        const uniqueAudiences = [
          ...new Set(
            eventsData.map((event) => event.target_audience).filter(Boolean)
          ),
        ];
        const uniqueLocations = [
          ...new Set(eventsData.map((event) => event.location).filter(Boolean)),
        ];

        setEventTypes(uniqueTypes);
        setAudiences(uniqueAudiences);
        setLocations(uniqueLocations);
      }
    } catch (error) {
      console.error("Error fetching options:", error);
    }
  };

  useEffect(() => {
    fetchOptions();
    if (defaultData) {
      const formattedData = {
        ...defaultData,
        dates: defaultData.dates
          ? defaultData.dates.split("T")[0]
          : new Date().toISOString().split("T")[0],
      };
      setFormData(formattedData);
      if (defaultData.pictureURL) {
        setPreview(defaultData.pictureURL);
      }
    }
  }, [defaultData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;

    const fieldMappings: Record<string, string> = {
      "event-name": "name",
      "event-dates": "dates",
      "event-location": "location",
      "event-type": "event_type",
      "event-audience": "target_audience",
      "event-description": "description",
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
            const res = await api.post<{ url: string }>("/media/upload/", {
              url: base64String,
            });
            if (res && res.data && res.data.url) {
              const imageUrl = res.data.url;
              setFormData((prev) => ({ ...prev, pictureURL: imageUrl }));
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
      const requiredFields = [
        "name",
        "dates",
        "location",
        "description",
        "event_type",
        "target_audience",
      ];

      const missingFields = requiredFields.filter(
        (field) =>
          !formData[field as keyof Event] ||
          (typeof formData[field as keyof Event] === "string" &&
            (formData[field as keyof Event] as string).trim() === "")
      );

      if (missingFields.length > 0) {
        toast("Save error", {
          className: "!text-red-500",
          description: (
            <span className="text-red-500">
              Please fill all required fields: {[...missingFields].join(", ")}
            </span>
          ),
        });
        return;
      }

      const submissionData = { ...formData };
      console.debug("Submitting event:", submissionData);
      onSubmit(submissionData);
    } catch (error) {
      console.error("Error submitting event:", error);
    }
  };

  return (
    <>
      <div className="space-y-8">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 relative">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Event Information
              </h2>
            </div>
          </div>

          {/* Event image upload section */}
          <div className="mb-6 flex flex-col items-center">
            <div className="w-full mb-4">
              <Label htmlFor="event-image" className="mb-2 block">
                Event Image
              </Label>
              <div className="flex flex-col items-center gap-3">
                {preview && (
                  <div className="w-full max-h-60 overflow-hidden rounded-lg mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        preview.startsWith("/")
                          ? `${getBackendUrl()}${preview}`
                          : preview
                      }
                      alt="Event preview"
                      className="w-full h-auto object-cover rounded-lg"
                    />
                  </div>
                )}
                <input
                  type="file"
                  id="event-image"
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
              label="Name"
              id="event-name"
              placeholder="Enter event name"
              className="md:col-span-2 cursor-pointer"
              value={formData.name}
              onChange={handleInputChange}
              required
            />

            <InputWithLabel
              label="Date"
              id="event-dates"
              type="date"
              placeholder="Enter event date"
              className="cursor-pointer"
              value={
                typeof formData.dates === "string"
                  ? formData.dates.split("T")[0]
                  : formData.dates
              }
              onChange={handleInputChange}
              required
            />

            <div className="flex flex-col gap-2">
              <Label htmlFor="event-location">Location *</Label>
              <div className="flex gap-2">
                <select
                  id="event-location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select a location</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Or enter a new location"
                  className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  onChange={(e) => {
                    if (e.target.value) {
                      setFormData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }));
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="event-type">Event Type *</Label>
              <div className="flex gap-2">
                <select
                  id="event-type"
                  value={formData.event_type}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      event_type: e.target.value,
                    }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select event type</option>
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Or enter a new type"
                  className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  onChange={(e) => {
                    if (e.target.value) {
                      setFormData((prev) => ({
                        ...prev,
                        event_type: e.target.value,
                      }));
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="event-audience">Target Audience *</Label>
              <div className="flex gap-2">
                <select
                  id="event-audience"
                  value={formData.target_audience}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      target_audience: e.target.value,
                    }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select target audience</option>
                  {audiences.map((audience) => (
                    <option key={audience} value={audience}>
                      {audience}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Or enter a new audience"
                  className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  onChange={(e) => {
                    if (e.target.value) {
                      setFormData((prev) => ({
                        ...prev,
                        target_audience: e.target.value,
                      }));
                    }
                  }}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="event-description" className="mb-2 block">
                Description *
              </Label>
              <textarea
                id="event-description"
                placeholder="Enter event description"
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
