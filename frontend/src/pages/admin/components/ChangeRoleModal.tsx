import React, { useState } from 'react';
import { Alert, message, Tag } from 'antd';
import {
  CrownOutlined,
  SafetyCertificateOutlined,
  ArrowRightOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { updateUserApi, type BackendUserResponse } from '../../../api';
import { USER_ROLES } from '../../../constants/roles';
import { Button, Modal } from '../../../components/common';
import { getAvatarInitial } from '../../../utils';

export interface ChangeRoleModalProps {
  open: boolean;
  user: BackendUserResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ChangeRoleModal: React.FC<ChangeRoleModalProps> = ({
  open,
  user,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!user) {
    return null;
  }

  const isPromoting = user.role === USER_ROLES.SUPPORT_AGENT;
  const currentRoleLabel = isPromoting ? 'Support Agent' : 'Administrator';
  const destinationRole = isPromoting ? USER_ROLES.ADMIN : USER_ROLES.SUPPORT_AGENT;
  const destinationRoleLabel = isPromoting ? 'Administrator' : 'Support Agent';

  const handleClose = () => {
    if (isSubmitting) return;
    setErrorMessage(null);
    onClose();
  };

  const handleConfirmRoleChange = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await updateUserApi(user._id, {
        role: destinationRole,
      });

      const successNotice = isPromoting
        ? `Successfully promoted ${user.name} to Administrator`
        : `Role updated to Support Agent for ${user.name}`;
      message.success(successNotice);

      onClose();
      onSuccess();
    } catch (err: unknown) {
      const defaultMsg = isPromoting
        ? 'Failed to promote user to Administrator. Please try again.'
        : 'Failed to update user role. Please try again.';
      const errorMsg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : defaultMsg;
      setErrorMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={isPromoting ? 'Promote to Administrator' : 'Change Role to Support Agent'}
      subtitle={
        isPromoting
          ? 'Elevate this team member account to full administrative permissions.'
          : 'Adjust access level down to standard support agent permissions.'
      }
      icon={
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center font-semibold text-base shadow-2xs ${
            isPromoting
              ? 'bg-amber-50 border border-amber-200 text-amber-600'
              : 'bg-purple-50 border border-purple-200 text-purple-600'
          }`}
        >
          {isPromoting ? <CrownOutlined /> : <SafetyCertificateOutlined />}
        </div>
      }
      open={open}
      onCancel={handleClose}
      maxWidth="md"
    >
      {errorMessage && (
        <Alert
          type="error"
          showIcon
          message={errorMessage}
          className="my-3 text-xs rounded-xl border border-rose-100 bg-rose-50/70"
          closable
          onClose={() => setErrorMessage(null)}
        />
      )}

      <div className="space-y-4 pt-2">
        {/* Target user information */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200/80">
          <div className="w-10 h-10 rounded-full bg-purple-100 border border-purple-200 text-purple-700 font-bold flex items-center justify-center text-sm shrink-0">
            {getAvatarInitial(user.name)}
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-semibold text-gray-900 text-sm block truncate">
              {user.name}
            </span>
            <span className="text-xs text-gray-500 block truncate">
              {user.email}
            </span>
          </div>
        </div>

        {/* Visual Role Transition */}
        <div className="p-3.5 rounded-xl bg-purple-50/40 border border-purple-100 flex items-center justify-between gap-3">
          <div className="flex-1 text-center p-2.5 rounded-lg bg-white border border-gray-200 shadow-2xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Current Role
            </span>
            <Tag
              color="purple"
              className="m-0 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-purple-200/80 bg-purple-50 text-purple-700"
            >
              <SafetyCertificateOutlined className="mr-1 text-[11px]" />
              {currentRoleLabel}
            </Tag>
          </div>

          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <ArrowRightOutlined className="text-xs font-bold" />
          </div>

          <div className="flex-1 text-center p-2.5 rounded-lg bg-white border border-purple-200 shadow-2xs">
            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block mb-1.5">
              Destination Role
            </span>
            <Tag
              color={isPromoting ? 'gold' : 'purple'}
              className={`m-0 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                isPromoting
                  ? 'border-amber-300 bg-amber-50 text-amber-800'
                  : 'border-purple-200 bg-purple-50 text-purple-700'
              }`}
            >
              {isPromoting ? (
                <CrownOutlined className="mr-1 text-amber-500 text-[11px]" />
              ) : (
                <SafetyCertificateOutlined className="mr-1 text-purple-600 text-[11px]" />
              )}
              {destinationRoleLabel}
            </Tag>
          </div>
        </div>

        {/* Privilege Explanation */}
        {isPromoting ? (
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs flex gap-3 text-amber-950">
            <SafetyCertificateOutlined className="text-amber-600 text-base shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block text-amber-900">
                Elevated Management Privileges
              </span>
              <p className="text-amber-800 m-0 leading-relaxed text-[11px]">
                Promoting this user grants full access to create and manage user accounts, assign roles, view platform-wide reports, and configure system preferences.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs flex gap-3 text-amber-950">
            <WarningOutlined className="text-amber-600 text-base shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block text-amber-900">
                Revoke Administrative Privileges
              </span>
              <p className="text-amber-800 m-0 leading-relaxed text-[11px]">
                Demoting this user will revoke their access to manage user accounts, oversee ticket administration, and access administrative settings.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
          <Button
            type="default"
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-9 px-4 text-xs font-semibold rounded-lg text-gray-700 hover:text-gray-900 border-gray-200"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleConfirmRoleChange}
            loading={isSubmitting}
            disabled={isSubmitting}
            className={`h-9 px-5 text-xs font-semibold rounded-lg shadow-2xs ${
              isPromoting
                ? 'bg-amber-600 hover:bg-amber-700 border-amber-600 text-white'
                : 'bg-purple-600 hover:bg-purple-700 border-purple-600 text-white'
            }`}
          >
            {isPromoting ? 'Confirm Promotion' : 'Confirm Role Change'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ChangeRoleModal;
