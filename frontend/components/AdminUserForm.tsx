import { useState, useEffect, useRef } from "react";
import { FaPlus, FaTrashAlt, FaUpload, FaEdit } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { InputWithLabel } from "@/components/ui/inputWithLabel";
import { DialogClose } from "@radix-ui/react-dialog";
import { FormUser } from "@/types/user";
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
import { toast } from "sonner"
import { SelectWithLabel } from "./ui/selectWithLabel";
import { SelectItem, SelectLabel } from "@/components/ui/select";
import InputAvatar from "./ui/InputAvatar";
import { Label } from "./ui/label";
import {Combobox} from "./ui/comboBox"
import { Founder } from "@/types/founders";

interface AdminUserFormProps {
  defaultData?: FormUser;
  onSubmit: (data: FormUser) => void;
}

export default function AdminUserForm({
  defaultData,
  onSubmit,
}: AdminUserFormProps) {
  const initialFormData: FormUser = {
    name: "",
    role: "user",
    email: "",
    founder: undefined,
    userImag: undefined
  };
  const [formData, setFormData] = useState<FormUser>(
    defaultData || initialFormData
  );

  const [foundersAvailable, setFoundersAvailable] = useState<Founder[] | null>();
  const [isLoading, setIsLoading] = useState<boolean>(true);


  const fetchAvailableFounders = async () => {
    try {
      setIsLoading(true);
      const result = (await api.get<Founder[]>({endpoint: `/founders/?founder_available=true`}));
      console.log(result)
      setFoundersAvailable(result.data);
    } catch (error) {
      console.log(error)
    }
    setIsLoading(false);
  }


  useEffect(() => {
    fetchAvailableFounders();
    if (defaultData) {
      setFormData(defaultData);
    }
  }, [defaultData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    const fieldMappings: Record<string, string> = {
      "user-name": "name",
      "user-email": "email",
      "user-img": "img",
      "user-role": "role",
      "user-founderId": "founderId",
      "user-startupId": "startupId",
    };

    const fieldName = fieldMappings[id] || id;
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };
  const handleSubmitProject = async () => {
    try {
      const requiredFields = [
        "name",
        "email",
        "role",
      ];

      const missingFields = requiredFields.filter(
        (field) =>
          !formData[field as keyof FormUser] ||
          (typeof formData[field as keyof FormUser] === "string" &&
        (formData[field as keyof FormUser] as string).trim() === "")
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

      const updatedFormData = {
        ...formData,
      };

      console.debug("Submitting project:", updatedFormData);

      onSubmit(updatedFormData);
    } catch (error) {
      console.error("Error submitting project:", error);
    }
  };

  return (
    <>
      <div className="space-y-8">
        {/* User Information */}
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 relative">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <InputAvatar
                defaultChar={formData.name.charAt(0)}
                variente="modifiable"
                size={24}
                url={formData.userImag}
                onChange={(imgUrl: string) =>
                  setFormData((prev) => ({ ...prev, userImag: imgUrl }))
                }
              />
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{formData.name || "User Information"}</h2>
                <span className="text-xs text-gray-500">Profile picture</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
            <InputWithLabel
              label="User Name"
              id="user-name"
              placeholder="Enter a username"
              className="md:col-span-2 cursor-pointer"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <InputWithLabel
              label="Email"
              id="user-email"
              type="email"
              placeholder="Enter an email"
              className="md:col-span-2 cursor-pointer"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <SelectWithLabel
              label="Role"
              id="user-role"
              className="cursor-pointer"
              value={formData.role}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, role: value }))
              }
            >
              <SelectLabel>Role</SelectLabel>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="founder">Founder</SelectItem>
              <SelectItem value="investor">Investor</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectWithLabel>
            <Combobox
              placeholder="Select a founder"
              elements={
                foundersAvailable?.map((founder) => ({
                  label: founder.FounderName,
                  value: String(founder.FounderID),
                  url: founder.FounderPictureURL,
                })) || []
              }
              variante="withAvatar"
              notFound="Founder not found"
              onChange={async (value) => {
                try {
                  const result = await api.get<Founder | null>({ endpoint: `/founders/${value}` });
                  setFormData((prev) => ({ ...prev, founder: result.data ?? undefined }));
                } catch (error) {
                  console.error(error);
                }
              }}
            />
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
          onClick={handleSubmitProject}
        >
          Save
        </Button>
      </div>
    </>
  );
}
