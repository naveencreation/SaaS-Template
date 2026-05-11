"use client";

import { ReactNode } from "react";

interface InputProps {
  label?: string;
  labelRight?: ReactNode;
  name: string;
  type?: string;
  placeholder?: string;
  value?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export function Input({
  label,
  labelRight,
  name,
  type = "text",
  placeholder,
  value,
  error,
  required = false,
  disabled = false,
  leftIcon,
  rightSlot,
  onChange,
  onBlur,
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <div className="mb-1 flex items-center justify-between">
          <label
            htmlFor={name}
            className="block text-sm font-medium text-neutral-700"
          >
            {label}
            {required && <span className="ml-1 text-error-solid">*</span>}
          </label>
          {labelRight && (
            <span className="text-sm">{labelRight}</span>
          )}
        </div>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
            {leftIcon}
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onChange={onChange}
          onBlur={onBlur}
          className={`w-full rounded-md border text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            leftIcon ? "pl-10" : "px-3"
          } ${rightSlot ? "pr-10" : "pr-3"} py-2 ${
            error
              ? "border-error-solid focus:border-error-solid"
              : "border-neutral-300 focus:border-primary-500"
          }`}
        />
        {rightSlot && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {rightSlot}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-error-text">{error}</p>}
    </div>
  );
}
