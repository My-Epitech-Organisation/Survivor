import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function InputWithLabel({ label, ...inputProps }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="grid w-full max-w-sm items-center gap-3">
      <Label htmlFor={inputProps.id}>{label}</Label>
      <Input {...inputProps} />
    </div>
  )
}
