"use client";

interface TextInputProps {
  label: string;
  placeholder?: string;
  type?: "text" | "password" | "email" | "number" | "date";
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  name?: string;
  defaultValue?: string;
}

export const TextInput = ({ label, placeholder, type = "text", value, onChange, disabled, name, defaultValue }: TextInputProps) => {
  return (
    <div className="mb-5">
      <label className="block text-sm font-bold text-[#0B0B0B] dark:text-zinc-400 mb-2">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        disabled={disabled}
        className={`w-full border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-[#050505] px-4 py-3 rounded-xl text-[#0B0B0B] dark:text-zinc-300 placeholder-gray-400 dark:placeholder-zinc-600 transition-colors focus:outline-none ${
          disabled
            ? "opacity-70 cursor-not-allowed"
            : "focus:border-[#00B4D8] dark:focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8]"
        }`}
      />
    </div>
  );
};