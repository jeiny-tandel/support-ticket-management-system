import React, { useState } from 'react';
import { Modal, Select, Alert, Tag, message } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { updateTicketStatusApi } from '../../../api';
import {
  TICKET_STATUSES,
  type Ticket,
  type TicketStatus,
} from '../../../types';
import { useAppSelector } from '../../../hooks';
import { selectUserRole } from '../../../store';
import { AppButton } from '../../../components/common';

interface UpdateStatusModalProps {
  ticket: Ticket | null;
  open: boolean;
  onClose: () => void;
  onSuccess: (updatedTicket?: Ticket) => void;
}

const STATUS_CONFIG: Record<
  TicketStatus,
  { label: string; color: string; description: string }
> = {
  OPEN: {
    label: 'Open',
    color: 'blue',
    description: 'Awaiting triage or initial investigation',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: 'orange',
    description: 'Actively being investigated or worked on',
  },
  RESOLVED: {
    label: 'Resolved',
    color: 'green',
    description: 'Resolution provided; awaiting verification or sign-off',
  },
  CLOSED: {
    label: 'Closed',
    color: 'default',
    description: 'Ticket completed, verified, and finalized',
  },
};

export const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  ticket,
  open,
  onClose,
  onSuccess,
}) => {
  const userRole = useAppSelector(selectUserRole);
  const isAdmin = userRole === 'ADMIN';

  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>(
    ticket?.status || 'OPEN',
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isClosed = ticket?.status === 'CLOSED';
  const isAgent = userRole === 'SUPPORT_AGENT';
  const isProhibitedForAgent = isAgent && isClosed;

  const handleCancel = () => {
    setSubmitError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!ticket || !selectedStatus) return;

    if (selectedStatus === ticket.status) {
      handleCancel();
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const updatedTicket = await updateTicketStatusApi(ticket._id, {
        status: selectedStatus,
      });
      message.success(
        isClosed && isAdmin
          ? 'Ticket reopened and status updated successfully'
          : 'Ticket status updated successfully',
      );
      handleCancel();
      onSuccess(updatedTicket);
    } catch (err: unknown) {
      let msg = 'Failed to update ticket status. Please try again.';
      if (err && typeof err === 'object') {
        if ('response' in err && (err as { response?: { data?: { message?: unknown } } }).response?.data?.message) {
          const backendMsg = (err as { response: { data: { message: unknown } } }).response.data.message;
          msg = Array.isArray(backendMsg) ? backendMsg.join(', ') : String(backendMsg);
        } else if ('message' in err) {
          msg = String((err as { message: unknown }).message);
        }
      }
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex flex-col">
          <span className="text-lg font-bold text-gray-900">Update Ticket Status</span>
          {ticket && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500 font-normal truncate max-w-xs">
                Ticket: <strong className="text-gray-700">{ticket.title}</strong>
              </span>
              <span className="text-[11px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                #{ticket._id.slice(-6).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
      centered
      className="max-w-md"
    >
      {submitError && (
        <Alert
          type="error"
          showIcon
          message={submitError}
          className="mb-4 text-xs"
          closable
          onClose={() => setSubmitError(null)}
        />
      )}

      {isProhibitedForAgent && (
        <Alert
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          message="Closed Ticket"
          description="Support agents cannot update or reopen closed tickets. Contact an administrator to reopen this ticket."
          className="mb-4 text-xs"
        />
      )}

      {isClosed && isAdmin && (
        <Alert
          type="info"
          showIcon
          message="Reopening Ticket"
          description="This ticket is currently Closed. Selecting an active status will reopen the ticket."
          className="mb-4 text-xs"
        />
      )}

      <div className="space-y-4 pt-2">
        {/* Current status display */}
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600">Current Status:</span>
          {ticket && (
            <Tag color={STATUS_CONFIG[ticket.status]?.color || 'default'} className="m-0 font-medium">
              {STATUS_CONFIG[ticket.status]?.label || ticket.status}
            </Tag>
          )}
        </div>

        {/* Status Selection */}
        <div>
          <label
            htmlFor="ticket-status-select"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            New Status
          </label>
          <Select<TicketStatus>
            id="ticket-status-select"
            value={selectedStatus}
            onChange={(val) => setSelectedStatus(val)}
            disabled={isSubmitting || isProhibitedForAgent}
            className="w-full h-10"
            options={TICKET_STATUSES.map((status) => ({
              label: (
                <div className="flex items-center justify-between py-0.5">
                  <div className="flex items-center gap-2">
                    <Tag color={STATUS_CONFIG[status].color} className="m-0 text-xs">
                      {STATUS_CONFIG[status].label}
                    </Tag>
                    <span className="text-xs text-gray-400">
                      — {STATUS_CONFIG[status].description}
                    </span>
                  </div>
                </div>
              ),
              value: status,
            }))}
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <AppButton
            type="default"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </AppButton>
          <AppButton
            type="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={
              isSubmitting ||
              isProhibitedForAgent ||
              !selectedStatus ||
              selectedStatus === ticket?.status
            }
            icon={<CheckCircleOutlined />}
          >
            Update Status
          </AppButton>
        </div>
      </div>
    </Modal>
  );
};

export default UpdateStatusModal;
