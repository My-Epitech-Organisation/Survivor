import {
    Select,
    SelectContent,
    SelectGroup,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Roles } from "@/types/role";

interface SelectWithLabelProps {
    label: string;
    id?: string;
    value?: string;
    onValueChange?: (value: Roles) => void;
    children: React.ReactNode;
    disabled?: boolean;
    className?: string;
}

export function SelectWithLabel({
    label,
    id,
    value,
    onValueChange,
    children,
    disabled,
    className,
}: SelectWithLabelProps) {
    return (
        <div className={`grid w-full max-w-sm items-center gap-3 ${className ?? ""}`}>
            <Label htmlFor={id}>{label}</Label>
            <Select value={value} onValueChange={onValueChange} disabled={disabled}>
                <SelectTrigger id={id}>
                    <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {children}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
}
