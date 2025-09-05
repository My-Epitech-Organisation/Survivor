import { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaTrashAlt } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { InputWithLabel } from "@/components/ui/inputWithLabel";
import { DialogClose } from "@radix-ui/react-dialog";
import { FormProjectDetails } from "@/types/project";

interface AdminProjectFormProps {
  defaultData?: FormProjectDetails;
  onSubmit: (data: FormProjectDetails) => void;
}

export default function AdminProjectForm({ defaultData, onSubmit }: AdminProjectFormProps) {
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

  const [formData, setFormData] = useState<FormProjectDetails>(defaultData || initialFormData);

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
      console.log("Form data to be submitted:", formData);

      const formattedAddress = address + ", " + zipcode + " " + location;
      const updatedFormData = {
        ...formData,
        ProjectAddress: formattedAddress
      };

      console.log("Submitting project:", updatedFormData);

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
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
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
            />
            <InputWithLabel
              label="Startup Description"
              id="startup-description"
              placeholder="Enter Startup description"
              className="md:col-span-2"
              value={formData.ProjectDescription}
              onChange={handleInputChange}
            />
            <InputWithLabel
              label="Startup Sector"
              id="startup-sector"
              placeholder="Enter Startup sector"
              value={formData.ProjectSector}
              onChange={handleInputChange}
            />
            <InputWithLabel
              label="Startup Maturity"
              id="startup-maturity"
              placeholder="Enter Startup maturity"
              value={formData.ProjectMaturity}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Startup Location */}
        <div className="pt-2 border-t border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
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
            />
            <InputWithLabel
              label="Startup Zip Code"
              id="startup-zip-code"
              type="number"
              placeholder="Enter Startup zip code"
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
            />
            <InputWithLabel
              label="Startup Location"
              id="startup-location"
              placeholder="Enter Startup location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <InputWithLabel
              label="Startup Legal Status"
              id="startup-legal-status"
              placeholder="Enter Startup legal status"
              value={formData.ProjectLegalStatus}
              onChange={handleInputChange}
            />
            <InputWithLabel
              label="Startup Created"
              id="startup-created"
              type="date"
              placeholder="Enter Startup created date"
              value={formData.ProjectCreatedAt}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Founders - This would need to be developed as a separate component */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Founders</h3>
            <button
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-1.5 rounded-full transition-colors"
              onClick={() => console.log("Add founder")}
            >
              <FaPlus size={14} />
            </button>
          </div>
          <div className="bg-gray-50 rounded-md p-4 flex items-center justify-center">
            <p className="text-gray-500 text-sm">
              No founders added yet. Click the plus icon to add founders.
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="pt-2 border-t border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
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
            />
            <InputWithLabel
              label="Project Phone"
              id="project-phone"
              type="tel"
              placeholder="Enter Project phone"
              value={formData.ProjectPhone}
              onChange={handleInputChange}
            />
            <InputWithLabel
              label="Project Website"
              id="project-website"
              placeholder="Enter Project website"
              className="md:col-span-2"
              value={formData.ProjectWebsite}
              onChange={handleInputChange}
            />
            <InputWithLabel
              label="Project Social"
              id="project-social"
              placeholder="Enter Project social media links"
              className="md:col-span-2"
              value={formData.ProjectSocial}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Additional Information */}
        <div className="pt-2 border-t border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Additional Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
            <InputWithLabel
              label="Project Needs"
              id="project-needs"
              placeholder="Enter Project needs"
              value={formData.ProjectNeeds}
              onChange={handleInputChange}
            />
            <InputWithLabel
              label="Project Status"
              id="project-status"
              placeholder="Enter Project status"
              value={formData.ProjectStatus}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
        <DialogClose asChild>
          <Button
            variant="outline"
            className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700"
            onClick={() => {
              console.log("Cancel adding project");
            }}
          >
            Cancel
          </Button>
        </DialogClose>
        <Button
          className="w-full sm:w-auto px-6 py-2 bg-app-blue-primary hover:bg-app-blue-primary-hover text-white rounded-lg hover:text-white"
          onClick={handleSubmitProject}
        >
          Save Project
        </Button>
      </div>
    </>
  );
}
