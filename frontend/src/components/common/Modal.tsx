import React from "react";
import { Modal as AntModal, type ModalProps as AntModalProps } from "antd";
import { Button } from "./Button";

export interface ModalProps extends Omit<AntModalProps, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | string;
  okText?: React.ReactNode;
  cancelText?: React.ReactNode;
  onOk?: (e: React.MouseEvent<HTMLElement>) => void;
  isSubmitting?: boolean;
  okDanger?: boolean;
  okDisabled?: boolean;
}

const getMaxWidthClass = (size?: string): string => {
  switch (size) {
    case "sm":
      return "max-w-sm";
    case "md":
      return "max-w-md";
    case "lg":
      return "max-w-lg";
    case "xl":
      return "max-w-xl";
    default:
      return size || "max-w-md";
  }
};

export const Modal: React.FC<ModalProps> = ({
  title,
  subtitle,
  icon,
  maxWidth = "md",
  className = "",
  destroyOnClose = true,
  centered = true,
  footer = null,
  children,
  onOk,
  okText,
  cancelText = "Cancel",
  isSubmitting = false,
  okDanger = false,
  okDisabled = false,
  onCancel,
  ...rest
}) => {
  const maxWidthClass = getMaxWidthClass(maxWidth);

  const renderHeader = () => {
    if (!title && !subtitle && !icon) return undefined;

    if (icon || subtitle) {
      return (
        <div className="flex items-start gap-2.5">
          {icon && <div className="shrink-0 mt-0.5">{icon}</div>}
          <div className="min-w-0 flex-1">
            {typeof title === "string" ? (
              <span className="text-base font-bold text-gray-900 block leading-tight">
                {title}
              </span>
            ) : (
              title
            )}
            {subtitle && (
              <span className="text-xs text-gray-500 font-normal block mt-0.5">
                {subtitle}
              </span>
            )}
          </div>
        </div>
      );
    }

    return typeof title === "string" ? (
      <span className="text-lg font-bold text-gray-900">{title}</span>
    ) : (
      title
    );
  };

  const renderFooter = () => {
    if (footer !== undefined && footer !== null) {
      return footer;
    }
    if (footer === null && !onOk) {
      return null;
    }
    if (onOk) {
      return (
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
          <Button
            type="default"
            onClick={(e) =>
              onCancel?.(e as unknown as React.MouseEvent<HTMLButtonElement>)
            }
            disabled={isSubmitting}
            className="h-9 px-4 text-xs font-medium"
          >
            {cancelText}
          </Button>
          <Button
            type="primary"
            danger={okDanger}
            onClick={onOk}
            loading={isSubmitting}
            disabled={isSubmitting || okDisabled}
            className="h-9 px-4 text-xs font-medium"
          >
            {okText || "Confirm"}
          </Button>
        </div>
      );
    }
    return null;
  };

  return (
    <AntModal
      title={renderHeader()}
      destroyOnClose={destroyOnClose}
      centered={centered}
      footer={renderFooter()}
      onCancel={onCancel}
      className={`${maxWidthClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </AntModal>
  );
};

export default Modal;
