"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { ReactNode } from "react";

interface PasswordInputProps {
  label?: string;
  labelRight?: ReactNode;
  name?: string;
  placeholder?: string;
  value?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export function PasswordInput({
  label = "Password",
  labelRight,
  name,
  placeholder,
  value,
  error,
  required = false,
  disabled = false,
  onChange,
  onBlur,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <Input
      label={label}
      labelRight={labelRight}
      name={name}
      type={show ? "text" : "password"}
      placeholder={placeholder}
      value={value}
      error={error}
      required={required}
      disabled={disabled}
      leftIcon={<Lock className="h-4 w-4" />}
      rightSlot={
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((s) => !s)}
          className="text-neutral-400 hover:text-neutral-600 focus:outline-none"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
      onChange={onChange}
      onBlur={onBlur}
    />
  );
}
