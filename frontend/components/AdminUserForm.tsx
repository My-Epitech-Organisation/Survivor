import { useState, useEffect, useRef } from "react";
import { FaPlus, FaTrashAlt, FaUpload, FaEdit } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { InputWithLabel } from "@/components/ui/inputWithLabel";
import { DialogClose } from "@radix-ui/react-dialog";
import { FormUser } from "@/types/user";
import { Roles } from "@/types/role";
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
import { Investor } from "@/types/investor";

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
    investor: undefined,
    userImage: undefined,
    is_active: undefined
  };
  const [formData, setFormData] = useState<FormUser>(
    defaultData || initialFormData
  );

  const [foundersAvailable, setFoundersAvailable] = useState<Founder[] | null>();
  const [investosrAvailable, setInvestorsAvailable] = useState<Investor[] | null>();
  const [isLoadingFounder, setIsLoadingFounder] = useState<boolean>(true);
  const [isLoadingInvestor, setIsLoadingInvestor] = useState<boolean>(true);


  const fetchAvailableFounders = async () => {
    try {
      setIsLoadingFounder(true);
      const result = (await api.get<Founder[]>({endpoint: `/founders/?founder_available=true`}));
      let available = Array.isArray(result.data) ? result.data : [];
      // Ajoute le founder actuel si il n'est pas déjà dans la liste
      if (
        defaultData?.founder &&
        defaultData.founder.FounderID &&
        !available.some(f => f.FounderID === defaultData.founder?.FounderID)
      ) {
        available = [...available, defaultData.founder];
      }
      setFoundersAvailable(available);
    } catch (error) {
      console.error(error)
    }
    setIsLoadingFounder(false);
  }


  const fetchAvailableInvestors = async () => {
    try {
      setIsLoadingInvestor(true);
      const result = (await api.get<Investor[]>({endpoint: `/investors/?investor_available=true`}));
      setInvestorsAvailable(result.data);
    } catch (error) {
      console.error(error)
    }
    setIsLoadingInvestor(false);
  }


  useEffect(() => {
    fetchAvailableFounders();
    fetchAvailableInvestors();
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

      const cleanedFormData = { ...formData };
      switch (formData.role) {
        case "founder":
          cleanedFormData.investor = undefined;
          break;
        case "investor":
          cleanedFormData.founder = undefined;
          break;
        case "admin":
        case "user":
          cleanedFormData.founder = undefined;
          cleanedFormData.investor = undefined;
          break;
      }

      console.debug("Submitting project:", cleanedFormData);

      onSubmit(cleanedFormData);
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
                url={formData.userImage}
                onChange={(imgUrl: string) =>
                  setFormData((prev) => ({ ...prev, userImage: imgUrl }))
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
            <div className="flex flex-col md:col-span-1 gap-4">
              <Label htmlFor="user-active" className="mb-1 cursor-pointer">
              Is active
              </Label>
              <input
              type="checkbox"
              id="user-active"
              checked={!!formData.is_active}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
              }
              className="h-5 w-5 accent-blue-600"
              />
            </div>
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
            {formData.role === "founder" && (
              <>
                <div className="grid w-full max-w-sm items-center gap-3">
                  <Label htmlFor="founder-combobox">Founder</Label>
                  <Combobox
                    id="founder-combobox"
                    variante="withAvatar"
                    defaultValue={String(formData.founder?.FounderID)}
                    defaultLabel={formData.founder?.FounderName}
                    placeholder="Select a founder"
                    elements={
                      foundersAvailable?.map((founder) => ({
                        label: founder.FounderName,
                        value: String(founder.FounderID),
                      })) || []
                    }
                    notFound="Founder not found"
                    onChange={async (value) => {
                      setFormData((prev) => ({ ...prev, investor: undefined }));
                      if (value) {
                        try {
                          const result = await api.get<Founder | null>({ endpoint: `/founders/${value}` });
                          setFormData((prev) => ({ ...prev, founder: result.data ?? undefined }));
                        } catch (error) {
                          console.error(error);
                        }
                      } else {
                        setFormData((prev) => ({ ...prev, founder: undefined }));
                      }
                    }}
                  />
                </div>
              </>
            )}
            {formData.role === "investor" && (
              <div className="grid w-full max-w-sm items-center gap-3">
                <Label htmlFor="investor-combobox">Investor</Label>
                <Combobox
                  id="investor-combobox"
                  defaultValue={String(formData.investor?.id)}
                  defaultLabel={formData.investor?.name}
                  placeholder="Select a investor"
                  elements={
                    investosrAvailable?.map((investor) => ({
                      label: investor.name,
                      value: String(investor.id),
                    })) || []
                  }
                  notFound="Investor not found"
                  onChange={async (value) => {
                    setFormData((prev) => ({ ...prev, founder: undefined }));
                    if (value) {
                      try {
                        const result = await api.get<Investor | null>({ endpoint: `/investors/${value}` });
                        setFormData((prev) => ({ ...prev, investor: result.data ?? undefined }));
                      } catch (error) {
                        console.error(error);
                      }
                    } else {
                      setFormData((prev) => ({ ...prev, investor: undefined }));
                    }
                  }}
                />
                </div>
            )}
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
