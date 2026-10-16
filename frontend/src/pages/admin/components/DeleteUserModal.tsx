import React, { useState } from 'react';
import { Alert, message, Tag } from 'antd';
import {
  DeleteOutlined,
  WarningOutlined,
  CrownOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { deleteUserApi, type BackendUserResponse } from '../../../api';
import { USER_ROLES } from '../../../constants/roles';
import { Button, Modal } from '../../../components/common';

export interface DeleteUserModalProps {
  open: boolean;
  user: BackendUserResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
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

  const isAdmin = user.role === USER_ROLES.ADMIN;

  const handleClose = () => {
    if (isSubmitting) return;
    setErrorMessage(null);
    onClose();
  };

  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await deleteUserApi(user._id);
      message.success(`User "${user.name}" has been deleted successfully`);
      onClose();
      onSuccess();
    } catch (err: unknown) {
      const defaultMsg = 'Failed to delete user. Please try again.';
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
      title="Delete User Account"
      subtitle="Permanently remove this user account from the system."
      icon={
        <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 font-semibold text-base shadow-2xs">
          <DeleteOutlined />
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
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-200/80">
          <div className="w-10 h-10 rounded-full bg-rose-100 border border-rose-200 text-rose-700 font-bold flex items-center justify-center text-sm shrink-0">
            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 text-sm truncate">
                {user.name}
              </span>
              <Tag
                color={isAdmin ? 'gold' : 'purple'}
                className={`m-0 text-[10px] font-semibold px-2 py-0 rounded-full border ${
                  isAdmin
                    ? 'border-amber-300 bg-amber-50 text-amber-800'
                    : 'border-purple-200 bg-purple-50 text-purple-700'
                }`}
              >
                {isAdmin ? (
                  <CrownOutlined className="mr-0.5 text-amber-500 text-[10px]" />
                ) : (
                  <SafetyCertificateOutlined className="mr-0.5 text-purple-600 text-[10px]" />
                )}
                {isAdmin ? 'Administrator' : 'Support Agent'}
              </Tag>
            </div>
            <span className="text-xs text-gray-500 block truncate mt-0.5">
              {user.email}
            </span>
          </div>
        </div>

        {/* Warning & Consequences Explanation */}
        <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200 text-xs flex gap-3 text-rose-950">
          <WarningOutlined className="text-rose-600 text-base shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold block text-rose-900">
              Permanent Account Deletion
            </span>
            <p className="text-rose-800 m-0 leading-relaxed text-[11px]">
              This operation cannot be undone. Any active tickets currently assigned to this user will be unassigned and safely returned to the open queue. Historical tickets and comments created by this user will be preserved for auditing.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
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
            danger
            onClick={handleConfirmDelete}
            loading={isSubmitting}
            disabled={isSubmitting}
            className="h-9 px-5 text-xs font-semibold rounded-lg shadow-2xs"
          >
            Delete User
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteUserModal;
