"use client";

import { Mail } from "lucide-react";
import { Input } from "@/components/ui/Input";

interface EmailInputProps {
  label?: string;
  name?: string;
  placeholder?: string;
  value?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export function EmailInput({
  label = "Email",
  name = "email",
  placeholder = "you@example.com",
  value,
  error,
  required = false,
  disabled = false,
  onChange,
  onBlur,
}: EmailInputProps) {
  return (
    <Input
      label={label}
      name={name}
      type="email"
      placeholder={placeholder}
      value={value}
      error={error}
      required={required}
      disabled={disabled}
      leftIcon={<Mail className="h-4 w-4" />}
      onChange={onChange}
      onBlur={onBlur}
    />
  );
}
