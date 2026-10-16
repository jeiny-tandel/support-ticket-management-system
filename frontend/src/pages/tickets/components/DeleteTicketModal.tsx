import React, { useState } from 'react';
import { Form, Input, Alert, message } from 'antd';
import { ExclamationCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAppDispatch } from '../../../hooks';
import { deleteTicket, fetchTicketSummary } from '../../../store';
import type { Ticket } from '../../../types';
import { Button, Modal } from '../../../components/common';

const { TextArea } = Input;

export interface DeleteTicketModalProps {
  open: boolean;
  ticket: Ticket | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const DeleteTicketModal: React.FC<DeleteTicketModalProps> = ({
  open,
  ticket,
  onClose,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const [reason, setReason] = useState<string>('');
  const [touched, setTouched] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const trimmedReason = reason.trim();
  const validationError =
    touched && !trimmedReason ? 'A deletion reason is required.' : null;

  const handleCancel = () => {
    setReason('');
    setTouched(false);
    setSubmitError(null);
    onClose();
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!ticket) return;

    if (!trimmedReason) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const resultAction = await dispatch(
      deleteTicket({
        ticketId: ticket._id,
        payload: { reason: trimmedReason },
      }),
    );

    setSubmitting(false);

    if (deleteTicket.fulfilled.match(resultAction)) {
      message.success('Ticket deleted successfully');
      dispatch(fetchTicketSummary());
      setReason('');
      setTouched(false);
      onClose();
      onSuccess();
    } else {
      const errorMsg =
        resultAction.payload ?? 'Failed to delete ticket. Please try again.';
      setSubmitError(errorMsg);
    }
  };

  return (
    <Modal
      title="Delete Support Ticket"
      subtitle="Soft-delete this ticket and move it to the deleted tickets archive."
      icon={
        <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-semibold text-base shrink-0">
          <ExclamationCircleOutlined />
        </div>
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
          className="my-3 text-xs rounded-lg"
          closable
          onClose={() => setSubmitError(null)}
        />
      )}

      {ticket && (
        <div className="my-3 p-3 bg-gray-50/80 rounded-lg border border-gray-200/70 text-xs">
          <div className="mb-1">
            <span className="font-semibold text-gray-800 line-clamp-1">
              {ticket.title}
            </span>
          </div>
          <p className="text-gray-500 line-clamp-2 m-0 text-[11px]">
            {ticket.description}
          </p>
        </div>
      )}

      <form onSubmit={handleDelete} className="space-y-4">
        <Form.Item
          label={
            <div className="flex items-center justify-between w-full">
              <span className="font-medium text-gray-700 text-xs">
                Reason for Deletion <span className="text-rose-500">*</span>
              </span>
              <span className="text-[11px] text-gray-400 font-normal">
                Mandatory
              </span>
            </div>
          }
          layout="vertical"
          required
          validateStatus={validationError ? 'error' : ''}
          help={validationError}
          className="mb-4"
        >
          <TextArea
            id="deletionReason"
            name="deletionReason"
            placeholder="Explain why this ticket is being deleted (e.g. duplicate request, customer cancelled, invalid submission)..."
            rows={4}
            maxLength={1000}
            showCount
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onBlur={() => setTouched(true)}
            disabled={submitting}
            className="rounded-lg text-sm"
          />
        </Form.Item>

        <div className="bg-amber-50/80 border border-amber-200/70 rounded-lg p-3 text-xs text-amber-800">
          <p className="m-0 font-medium">Notice:</p>
          <p className="m-0 text-[11px] text-amber-700 mt-0.5">
            This ticket will be removed from active queues and dashboard statistics,
            but all history and comments will remain safely preserved in MongoDB for
            auditing.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
          <Button
            type="default"
            onClick={handleCancel}
            disabled={submitting}
            className="h-9 px-4 text-xs font-medium"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            danger
            htmlType="submit"
            icon={<DeleteOutlined />}
            loading={submitting}
            disabled={submitting}
            className="h-9 px-4 text-xs font-medium bg-rose-600 hover:bg-rose-700 border-rose-600"
          >
            Delete Ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
};
