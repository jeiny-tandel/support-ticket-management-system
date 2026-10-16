import React, { useState } from 'react';
import { Select, Alert, Tag, message } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import {
  TICKET_STATUSES,
  type Ticket,
  type TicketStatus,
} from '../../../types';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { selectUserRole, updateTicketStatus, fetchTicketSummary } from '../../../store';
import { Button, Modal } from '../../../components/common';

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
  const dispatch = useAppDispatch();
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

    const resultAction = await dispatch(
      updateTicketStatus({
        ticketId: ticket._id,
        payload: { status: selectedStatus },
      }),
    );

    setIsSubmitting(false);

    if (updateTicketStatus.fulfilled.match(resultAction)) {
      message.success(
        isClosed && isAdmin
          ? 'Ticket reopened and status updated successfully'
          : 'Ticket status updated successfully',
      );
      dispatch(fetchTicketSummary());
      handleCancel();
      onSuccess(resultAction.payload);
    } else {
      const msg =
        resultAction.payload ?? 'Failed to update ticket status. Please try again.';
      setSubmitError(msg);
    }
  };

  return (
    <Modal
      title="Update Ticket Status"
      subtitle={
        ticket ? (
          <div className="truncate max-w-md mt-0.5">
            Ticket: <strong className="text-gray-700">{ticket.title}</strong>
          </div>
        ) : undefined
      }
      open={open}
      onCancel={handleCancel}
      maxWidth="md"
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
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600">Current Status:</span>
          {ticket && (
            <Tag color={STATUS_CONFIG[ticket.status]?.color || 'default'} className="m-0 font-medium">
              {STATUS_CONFIG[ticket.status]?.label || ticket.status}
            </Tag>
          )}
        </div>

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

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <Button
            type="default"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
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
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UpdateStatusModal;
