import React from 'react';
import { Modal as AntModal, type ModalProps as AntModalProps } from 'antd';
import { Button } from './Button';

export interface ModalProps extends Omit<AntModalProps, 'title'> {
  /** Modal header title */
  title?: React.ReactNode;
  /** Optional secondary explanatory text below title */
  subtitle?: React.ReactNode;
  /** Optional header icon or leading badge */
  icon?: React.ReactNode;
  /** Preset max-width sizing ('sm' | 'md' | 'lg' | 'xl') or custom Tailwind class */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | string;
  /** Optional confirmation button text if using standard modal footer */
  okText?: React.ReactNode;
  /** Optional cancel button text if using standard modal footer */
  cancelText?: React.ReactNode;
  /** Standard confirmation callback */
  onOk?: (e: React.MouseEvent<HTMLElement>) => void;
  /** Loading state for actions */
  isSubmitting?: boolean;
  /** Danger styling for confirmation button */
  okDanger?: boolean;
  /** Disabled state for confirmation button */
  okDisabled?: boolean;
}

const getMaxWidthClass = (size?: string): string => {
  switch (size) {
    case 'sm':
      return 'max-w-sm';
    case 'md':
      return 'max-w-md';
    case 'lg':
      return 'max-w-lg';
    case 'xl':
      return 'max-w-xl';
    default:
      return size || 'max-w-md';
  }
};

/**
 * Reusable modal foundation for SolviX extending Ant Design Modal.
 * Standardizes centering, backdrop behavior, unmount cleanup, header composition,
 * and sizing presets across all platform modal workflows.
 */
export const Modal: React.FC<ModalProps> = ({
  title,
  subtitle,
  icon,
  maxWidth = 'md',
  className = '',
  destroyOnClose = true,
  centered = true,
  footer = null,
  children,
  onOk,
  okText,
  cancelText = 'Cancel',
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
            {typeof title === 'string' ? (
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

    return typeof title === 'string' ? (
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
            onClick={(e) => onCancel?.(e as unknown as React.MouseEvent<HTMLButtonElement>)}
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
            {okText || 'Confirm'}
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
