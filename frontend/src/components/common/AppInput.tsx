import React from 'react';
import { Input as AntInput, type InputProps as AntInputProps } from 'antd';

export interface AppInputProps extends AntInputProps {
  /** Optional label displayed above the input */
  label?: React.ReactNode;
  /** Visual indicator for required fields */
  required?: boolean;
  /** Validation error message displayed below the input (activates error status) */
  error?: string | null;
  /** Optional helper text shown when there are no errors */
  helperText?: string;
  /** When true, renders an Ant Design Password input with visibility toggle */
  isPassword?: boolean;
  /** Optional wrapper container CSS class */
  containerClassName?: string;
}

/**
 * Reusable input component wrapping Ant Design Input and Input.Password.
 * Provides accessible labels, helper text, and error presentation.
 */
export const AppInput: React.FC<AppInputProps> = ({
  label,
  required = false,
  error,
  helperText,
  isPassword = false,
  containerClassName = '',
  status,
  id,
  ...rest
}) => {
  const inputStatus = error ? 'error' : status;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`.trim()}>
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

export default AppInput;
