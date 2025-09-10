import { useState, useEffect, useRef } from "react";
import { FaPlus, FaTrashAlt, FaUpload, FaEdit } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { InputWithLabel } from "@/components/ui/inputWithLabel";
import { DialogClose } from "@radix-ui/react-dialog";
import { FormProjectDetails } from "@/types/project";
import { MinimalFounder } from "@/types/founders";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getBackendUrl } from "@/lib/config";
import { toast } from "sonner";

interface AdminProjectFormProps {
  defaultData?: FormProjectDetails;
  onSubmit: (data: FormProjectDetails) => void;
}

function AddFoundersSection({
  founders,
  onUpdateFounders,
}: {
  founders?: MinimalFounder[];
  onUpdateFounders: (founders: MinimalFounder[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const editCloseRef = useRef<HTMLButtonElement>(null);

  const [newFounder, setNewFounder] = useState<MinimalFounder>({
    name: "",
    picture: "",
  });

  const [editFounder, setEditFounder] = useState<{
    index: number;
    founder: MinimalFounder;
  }>({
    index: -1,
    founder: {
      name: "",
      picture: "",
    },
  });

  const handleEditFounder = (founder: MinimalFounder, index: number) => {
    setEditFounder({
      index,
      founder: { ...founder },
    });
  };

  const handleSaveEdit = () => {
    if (editFounder.founder.name === "") {
      toast("Founder error", {
        className: "!text-red-500",
        description: (
          <span className="text-red-500">Please set a founder name</span>
        ),
      });
      return;
    }

    if (editFounder.index !== -1 && founders) {
      const updatedFounders = [...founders];
      updatedFounders[editFounder.index] = editFounder.founder;
      onUpdateFounders(updatedFounders);
      editCloseRef.current?.click();
    }
  };

  return (
    <div className="pt-2 border-t border-app-border">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-heading text-lg font-semibold text-app-text-primary">
          Founders
        </h3>
        <Dialog>
          <DialogTrigger asChild>
            <button className="bg-jeb-primary hover:bg-jeb-hover text-white p-2 rounded-full transition-colors cursor-pointer">
              <FaPlus size={14} />
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">
                Add New Founder
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <InputWithLabel
                label="Name"
                id="founder-name"
                placeholder="Enter founder name"
                value={newFounder.name}
                onChange={(e) =>
                  setNewFounder((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
              <div className="space-y-2">
                <label className="text-sm font-medium text-app-text-secondary">
                  Profile Image
                </label>
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage
                      src={`${getBackendUrl()}${newFounder.picture}`}
                    />
                    <AvatarFallback>
                      {newFounder.name?.charAt(0) || "UK"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div>
                      <input
                        type="file"
                        className="hidden"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const reader = new FileReader();
                              reader.onloadend = async () => {
                                const base64String = reader.result as string;

                                const res = await api.post<{ url: string }>(
                                  "/media/upload/",
                                  { url: base64String }
                                );

                                if (res.data) {
                                  setNewFounder((prev) => ({
                                    ...prev,
                                    picture: `${res?.data?.url ?? ""}`,
                                  }));
                                } else {
                                  throw new Error(
                                    "API didn't return an avatar url image"
                                  );
                                }
                              };
                              reader.readAsDataURL(file);
                            } catch (error) {
                              console.error("Error uploading image:", error);
                            }
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        className="w-full cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <FaUpload className="mr-2" />
                        Upload Photo
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button
                  className="cursor-pointer font-bold"
                  variant="outline"
                  onClick={() => {
                    setNewFounder({
                      name: "",
                      picture: "",
                    });
                    closeRef.current?.click();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="cursor-pointer bg-jeb-primary hover:bg-jeb-hover font-bold"
                  onClick={() => {
                    if (newFounder.name === "") {
                      toast("Founder error", {
                        className: "!text-red-500",
                        description: (
                          <span className="text-red-500">
                            Please set a founder name:
                          </span>
                        ),
                      });
                      return;
                    }
                    const newFounderWithId = {
                      ...newFounder,
                    } as MinimalFounder;

                    const updatedFounders = [
                      ...(founders || []),
                      newFounderWithId,
                    ];
                    onUpdateFounders(updatedFounders);

                    setNewFounder({
                      name: "",
                      picture: "",
                    });
                    closeRef.current?.click();
                  }}
                >
                  Add Founder
                </Button>
                <DialogClose ref={closeRef} className="hidden" />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-app-surface-hover rounded-lg p-4">
        {!founders || founders.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-app-text-secondary text-sm">
              No founders added yet. Click the plus icon to add founders.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {founders &&
              founders.map((founder, id) => (
                <div
                  key={id}
                  className="bg-app-surface p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-app-border relative group"
                >
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button
                          className="opacity-0 group-hover:opacity-100 bg-jeb-five hover:bg-jeb-six text-jeb-nine p-1.5 rounded-full transition-all cursor-pointer"
                          onClick={() => handleEditFounder(founder, id)}
                        >
                          <FaEdit size={14} />
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="font-heading">
                            Edit Founder
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <InputWithLabel
                            label="Name"
                            id="founder-name-edit"
                            placeholder="Enter founder name"
                            value={editFounder.founder.name}
                            onChange={(e) =>
                              setEditFounder((prev) => ({
                                ...prev,
                                founder: {
                                  ...prev.founder,
                                  name: e.target.value,
                                },
                              }))
                            }
                            required
                          />
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-app-text-secondary">
                              Profile Image
                            </label>
                            <div className="flex items-center space-x-4">
                              <Avatar className="w-16 h-16">
                                <AvatarImage
                                  src={`${getBackendUrl()}${
                                    editFounder.founder.picture
                                  }`}
                                />
                                <AvatarFallback>
                                  {editFounder.founder.name?.charAt(0) || "UK"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div>
                                  <input
                                    type="file"
                                    className="hidden"
                                    ref={editFileInputRef}
                                    accept="image/*"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        try {
                                          const reader = new FileReader();
                                          reader.onloadend = async () => {
                                            const base64String =
                                              reader.result as string;

                                            const res = await api.post<{
                                              url: string;
                                            }>("/media/upload/", {
                                              url: base64String,
                                            });

                                            if (res.data) {
                                              setEditFounder((prev) => ({
                                                ...prev,
                                                founder: {
                                                  ...prev.founder,
                                                  picture: `${
                                                    res?.data?.url ?? ""
                                                  }`,
                                                },
                                              }));
                                            } else {
                                              throw new Error(
                                                "API didn't return an avatar url image"
                                              );
                                            }
                                          };
                                          reader.readAsDataURL(file);
                                        } catch (error) {
                                          console.error(
                                            "Error uploading image:",
                                            error
                                          );
                                        }
                                      }
                                    }}
                                  />
                                  <Button
                                    variant="outline"
                                    className="w-full cursor-pointer"
                                    onClick={() =>
                                      editFileInputRef.current?.click()
                                    }
                                  >
                                    <FaUpload className="mr-2" />
                                    Upload Photo
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end gap-3 mt-4">
                            <Button
                              className="cursor-pointer font-bold"
                              variant="outline"
                              onClick={() => {
                                editCloseRef.current?.click();
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              className="cursor-pointer font-bold bg-jeb-primary hover:bg-jeb-hover"
                              onClick={handleSaveEdit}
                            >
                              Save Changes
                            </Button>
                            <DialogClose
                              ref={editCloseRef}
                              className="hidden"
                            />
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <button
                      className="opacity-0 group-hover:opacity-100 bg-app-purple-primary hover:bg-app-purple-primary/80 text-app-white p-1.5 rounded-full transition-all cursor-pointer"
                      onClick={() => {
                        const updatedFounders = founders
                          ? founders.filter((_, idx) => idx !== id)
                          : [];
                        onUpdateFounders(updatedFounders);
                      }}
                    >
                      <FaTrashAlt size={14} />
                    </button>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={`${getBackendUrl()}${founder.picture}`}
                      />
                      <AvatarFallback>
                        {founder.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-heading font-medium text-app-text-primary">
                        {founder.name}
                      </h4>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminProjectForm({
  defaultData,
  onSubmit,
}: AdminProjectFormProps) {
  const initialFormData: FormProjectDetails = {
    ProjectName: "",
    ProjectDescription: "",
    ProjectSector: "",
    ProjectMaturity: "",
    ProjectAddress: "",
    ProjectLegalStatus: "",
    ProjectCreatedAt: "",
    ProjectFounders: [],
    ProjectEmail: "",
    ProjectPhone: "",
    ProjectWebsite: "",
    ProjectSocial: "",
    ProjectNeeds: "",
    ProjectStatus: "",
  };

  const [formData, setFormData] = useState<FormProjectDetails>(
    defaultData || initialFormData
  );

  useEffect(() => {
    if (defaultData) {
      setFormData(defaultData);
    }
  }, [defaultData]);

  const [location, setLocation] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [zipcode, setZipcode] = useState<string>("");

  useEffect(() => {
    if (defaultData?.ProjectAddress) {
      const addressParts = defaultData.ProjectAddress.split(", ");
      if (addressParts.length === 2) {
        setAddress(addressParts[0]);
        const locationParts = addressParts[1].split(" ");
        if (locationParts.length >= 2) {
          setZipcode(locationParts[0]);
          setLocation(locationParts.slice(1).join(" "));
        }
      }
    }
  }, [defaultData?.ProjectAddress]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    const fieldMappings: Record<string, string> = {
      "startup-name": "ProjectName",
      "startup-description": "ProjectDescription",
      "startup-sector": "ProjectSector",
      "startup-maturity": "ProjectMaturity",
      "startup-legal-status": "ProjectLegalStatus",
      "startup-created": "ProjectCreatedAt",
      "project-email": "ProjectEmail",
      "project-phone": "ProjectPhone",
      "project-website": "ProjectWebsite",
      "project-social": "ProjectSocial",
      "project-needs": "ProjectNeeds",
      "project-status": "ProjectStatus",
    };

    const fieldName = fieldMappings[id] || id;
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };
  const handleSubmitProject = async () => {
    try {
      const requiredFields = [
        "ProjectName",
        "ProjectDescription",
        "ProjectSector",
        "ProjectMaturity",
        "ProjectLegalStatus",
        "ProjectCreatedAt",
        "ProjectEmail",
        "ProjectPhone",
        "ProjectWebsite",
        "ProjectSocial",
        "ProjectNeeds",
        "ProjectStatus",
      ];

      const missingFields = requiredFields.filter(
        (field) =>
          !formData[field as keyof FormProjectDetails] ||
          (typeof formData[field as keyof FormProjectDetails] === "string" &&
            (formData[field as keyof FormProjectDetails] as string).trim() ===
              "")
      );

      const missingLocationFields: string[] = [];
      if (address.trim() === "") missingLocationFields.push("Address");
      if (zipcode.trim() === "") missingLocationFields.push("Zip Code");
      if (location.trim() === "") missingLocationFields.push("Location");

      if (missingFields.length > 0 || missingLocationFields.length > 0) {
        toast("Save error", {
          className: "!text-red-500",
          description: (
            <span className="text-red-500">
              Please fill all required fields:{" "}
              {[...missingFields, ...missingLocationFields].join(", ")}
            </span>
          ),
        });
        return;
      }

      const formattedAddress = address + ", " + zipcode + " " + location;
      const updatedFormData = {
        ...formData,
        ProjectAddress: formattedAddress,
      };
      if (updatedFormData.ProjectFounders.length == 0) {
        toast("Save error", {
          className: "!text-red-500",
          description: (
            <span className="text-red-500">You need to add founder(s)</span>
          ),
        });
        return;
      }

      console.debug("Submitting project:", updatedFormData);

      onSubmit(updatedFormData);
    } catch (error) {
      console.error("Error submitting project:", error);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Startup Basic Information */}
        <div>
          <h3 className="font-heading text-lg font-semibold text-app-text-primary mb-3">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
            <InputWithLabel
              label="Startup Name"
              id="startup-name"
              placeholder="Enter Startup name"
              className="md:col-span-2"
              value={formData.ProjectName}
              onChange={handleInputChange}
              required
            />
            <InputWithLabel
              label="Startup Description"
              id="startup-description"
              placeholder="Enter Startup description"
              className="md:col-span-2"
              value={formData.ProjectDescription}
              onChange={handleInputChange}
              required
            />
            <InputWithLabel
              label="Startup Sector"
              id="startup-sector"
              placeholder="Enter Startup sector"
              value={formData.ProjectSector}
              onChange={handleInputChange}
              required
            />
            <InputWithLabel
              label="Startup Maturity"
              id="startup-maturity"
              placeholder="Enter Startup maturity"
              value={formData.ProjectMaturity}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        {/* Startup Location */}
        <div className="pt-2 border-t border-gray-100">
          <h3 className="font-heading text-lg font-semibold text-app-text-primary mb-3">
            Location & Legal Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
            <InputWithLabel
              label="Startup Address"
              id="startup-address"
              placeholder="Enter Startup address"
              className="md:col-span-2"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
            <InputWithLabel
              label="Startup Zip Code"
              id="startup-zip-code"
              type="number"
              placeholder="Enter Startup zip code"
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
              required
            />
            <InputWithLabel
              label="Startup Location"
              id="startup-location"
              placeholder="Enter Startup location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
            <InputWithLabel
              label="Startup Legal Status"
              id="startup-legal-status"
              placeholder="Enter Startup legal status"
              value={formData.ProjectLegalStatus}
              onChange={handleInputChange}
              required
            />
            <InputWithLabel
              label="Startup Created"
              id="startup-created"
              type="date"
              placeholder="Enter Startup created date"
              value={formData.ProjectCreatedAt}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        {/* Founders */}
        <AddFoundersSection
          founders={formData.ProjectFounders}
          onUpdateFounders={(updatedFounders) => {
            setFormData((prev) => ({
              ...prev,
              ProjectFounders: updatedFounders,
            }));
          }}
        />
        {/* Contact Information */}
        <div className="pt-2 border-t border-app-border">
          <h3 className="font-heading text-lg font-semibold text-app-text-primary mb-3">
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
            <InputWithLabel
              label="Project Email"
              id="project-email"
              type="email"
              placeholder="Enter Project email"
              value={formData.ProjectEmail}
              onChange={handleInputChange}
              required
            />
            <InputWithLabel
              label="Project Phone"
              id="project-phone"
              type="tel"
              placeholder="Enter Project phone"
              value={formData.ProjectPhone}
              onChange={handleInputChange}
              required
            />
            <InputWithLabel
              label="Project Website"
              id="project-website"
              placeholder="Enter Project website"
              className="md:col-span-2"
              value={formData.ProjectWebsite}
              onChange={handleInputChange}
              required
            />
            <InputWithLabel
              label="Project Social"
              id="project-social"
              placeholder="Enter Project social media links"
              className="md:col-span-2"
              value={formData.ProjectSocial}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        {/* Additional Information */}
        <div className="pt-2 border-t border-app-border">
          <h3 className="font-heading text-lg font-semibold text-app-text-primary mb-3">
            Additional Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
            <InputWithLabel
              label="Project Needs"
              id="project-needs"
              placeholder="Enter Project needs"
              value={formData.ProjectNeeds}
              onChange={handleInputChange}
              required
            />
            <InputWithLabel
              label="Project Status"
              id="project-status"
              placeholder="Enter Project status"
              value={formData.ProjectStatus}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
        <DialogClose asChild>
          <Button
            variant="outline"
            className="cursor-pointer w-full sm:w-auto px-6 py-2 border border-app-border text-app-text-secondary font-bold hover:bg-app-surface-hover"
            onClick={() => {}}
          >
            Cancel
          </Button>
        </DialogClose>
        <Button
          className="cursor-pointer w-full sm:w-auto px-6 py-2 bg-jeb-primary hover:bg-jeb-hover text-white rounded-lg font-bold"
          onClick={handleSubmitProject}
        >
          Save Project
        </Button>
      </div>
    </>
  );
}
