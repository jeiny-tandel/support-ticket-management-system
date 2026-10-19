import React from "react";
import { Input as AntInput, type InputProps as AntInputProps } from "antd";

export interface InputProps extends AntInputProps {
  label?: React.ReactNode;
  required?: boolean;
  error?: string | null;
  helperText?: string;
  isPassword?: boolean;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  required = false,
  error,
  helperText,
  isPassword = false,
  containerClassName = "",
  status,
  id,
  ...rest
}) => {
  const inputStatus = error ? "error" : status;

  return (
    <div
      className={`flex flex-col gap-1.5 w-full ${containerClassName}`.trim()}
    >
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-gray-700 select-none"
        >
          {label}
          {required && (
            <span className="ml-1 text-red-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {isPassword ? (
        <AntInput.Password id={id} status={inputStatus} {...rest} />
      ) : (
        <AntInput id={id} status={inputStatus} {...rest} />
      )}

      {error ? (
        <span className="text-xs text-red-600 font-normal leading-tight">
          {error}
        </span>
      ) : helperText ? (
        <span className="text-xs text-gray-500 font-normal leading-tight">
          {helperText}
        </span>
      ) : null}
    </div>
  );
};

export default Input;
