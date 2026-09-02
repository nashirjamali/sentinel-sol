import { cn } from "@/lib/utils";

type TextFieldProps = {
  placeholder?: string;
  name?: string;
  type?: string;
};

export function TextField({
  placeholder = "Enter your email",
  name,
  type = "email",
}: TextFieldProps) {
  return (
    <input
      className={cn(
        "box-border block w-full max-w-[352px] rounded-xl border-2 border-neutrals-6 bg-transparent px-4 py-3 font-body text-caption text-neutrals-2 outline-none placeholder:text-neutrals-4 focus:border-primary-1 dark:text-neutrals-8",
      )}
      type={type}
      name={name}
      placeholder={placeholder}
    />
  );
}
