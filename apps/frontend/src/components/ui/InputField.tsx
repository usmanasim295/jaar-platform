"use client";

import React, { useState } from "react";
import {
  Controller,
  Control,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";
import { Currency, EyeOpenIcon } from "../assets/icons";
import { EyeClosed } from "lucide-react";

interface InputFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  type?: "text" | "email" | "password" | "number" | "checkbox" | "radio";
  label?: string;
  placeholder?: string;
  rules?: RegisterOptions<T, Path<T>>;
  className?: string;
  inputClassName?: string;
  error?: string;
  value?: string | number;
  radioValue?: string | number;
  onChange?: (value: any) => void;
  placeholderAnimate?: boolean;
  onInput?: (e: React.FormEvent<HTMLInputElement>) => void;
}

const InputField = <T extends FieldValues>({
  name,
  control,
  label,
  type = "text",
  placeholder,
  rules,
  className = "",
  inputClassName = "",
  error,
  value,
  radioValue,
  onChange,
  placeholderAnimate = false,
  onInput,
}: InputFieldProps<T>) => {
  const inputId = `${name}-${type}`;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`${className}`}>
      {label && type !== "checkbox" && (
        <label htmlFor={inputId} className="block text-sm font-medium mb-2">
          {label}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => {
          if (type === "checkbox") {
            return (
              <label className="flex items-center gap-2">
                <input
                  id={inputId}
                  type="checkbox"
                  checked={!!field.value}
                  onChange={(e) => {
                    field.onChange(e.target.checked);
                    onChange?.(e.target.checked);
                  }}
                  className="w-4 h-4"
                />
                <span>{label}</span>
              </label>
            );
          }

          if (type === "radio") {
            return (
              <label className="flex items-center gap-2">
                <input
                  id={inputId}
                  type="radio"
                  value={radioValue}
                  checked={field.value === radioValue}
                  onChange={() => {
                    field.onChange(radioValue);
                    onChange?.(radioValue);
                  }}
                  className="w-4 h-4"
                />
                <span>{label}</span>
              </label>
            );
          }
          const isPassword = type === "password";
          const inputType = isPassword
            ? showPassword
              ? "text"
              : "password"
            : type;
          return (
            <div className="relative">
              {type === "number" && (
                <div className="absolute left-4 top-10 -translate-y-1/2 text-gray-500">
                  <Currency />
                </div>
              )}

              <input
                id={inputId}
                type={inputType}
                placeholder={placeholderAnimate ? " " : placeholder}
                value={field.value || ""}
                min={type === "number" ? 0 : undefined}
                onChange={(e) => {
                  const value =
                    type === "number" ? Number(e.target.value) : e.target.value;
                  field.onChange(value);
                  onChange?.(value);
                }}
                onInput={onInput}
                onBlur={field.onBlur}
                className={`peer relative z-1 w-full ${
                  type === "number" ? "pl-8" : "px-4"
                } py-2 pt-5 border-2 rounded-[10px] focus:outline-none text-(--primary-black) ${
                  error
                    ? "border-red-500 ring-red-200"
                    : "border-(--light-grey)"
                } ${inputClassName}`}
              />

              {isPassword && (
                <button
                  type="button"
                  className="absolute z-[2] right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  tabIndex={-1}
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeClosed /> : <EyeOpenIcon />}
                </button>
              )}

              {placeholderAnimate && (
                <label
                  htmlFor={inputId}
                  className={`absolute z-0 left-4 top-1 text-(--gray-2) text-sm transition-all
                  ${
                    type === "number"
                      ? "top-1 text-xs text-(--grey-text)" // always up for number
                      : "peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-(--grey-text) peer-focus:top-1 peer-focus:text-xs peer-focus:text-(--grey-text)"
                  }`}
                >
                  {placeholder}
                </label>
              )}
            </div>
          );
        }}
      />
      {error && (
        <div className="relative text-[10px] text-red-500">
          <span className="absolute -bottom-3.5 right-3 ">{error}</span>
        </div>
      )}{" "}
    </div>
  );
};

export default InputField;
