import React, { useEffect, useState } from 'react';
import { Select, Alert, Spin, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAppDispatch } from '../../../hooks';
import { assignTicket, fetchTicketSummary } from '../../../store';
import { getUsersApi, type BackendUserResponse } from '../../../api';
import { USER_ROLES } from '../../../constants/roles';
import type { Ticket } from '../../../types';
import { Button, Modal } from '../../../components/common';

interface AssignTicketModalProps {
  ticket: Ticket | null;
  open: boolean;
  onClose: () => void;
  onSuccess: (updatedTicket?: Ticket) => void;
}

export const AssignTicketModal: React.FC<AssignTicketModalProps> = ({
  ticket,
  open,
  onClose,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const currentAssigneeId = ticket?.assignedToId
    ? typeof ticket.assignedToId === 'object'
      ? ticket.assignedToId._id
      : ticket.assignedToId
    : null;

  const [agents, setAgents] = useState<BackendUserResponse[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(currentAssigneeId);
  const [isLoadingAgents, setIsLoadingAgents] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let isMounted = true;

    getUsersApi({ role: USER_ROLES.SUPPORT_AGENT })
      .then((supportAgents) => {
        if (isMounted) {
          setAgents(supportAgents);
          setIsLoadingAgents(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg =
            err && typeof err === 'object' && 'message' in err
              ? String((err as { message: unknown }).message)
              : 'Unable to load support agents. Please verify user management permissions.';
          setFetchError(msg);
          setIsLoadingAgents(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [open]);

  const handleCancel = () => {
    setSelectedAgentId(null);
    setSubmitError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!ticket || !selectedAgentId) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const resultAction = await dispatch(
      assignTicket({
        ticketId: ticket._id,
        payload: { assignedToId: selectedAgentId },
      }),
    );

    setIsSubmitting(false);

    if (assignTicket.fulfilled.match(resultAction)) {
      message.success('Ticket assigned successfully');
      dispatch(fetchTicketSummary());
      handleCancel();
      onSuccess(resultAction.payload);
    } else {
      const msg =
        resultAction.payload ?? 'Failed to assign ticket. Please try again.';
      setSubmitError(msg);
    }
  };

  return (
    <Modal
      title="Assign Ticket"
      subtitle={
        ticket ? (
          <span>
            Ticket: <strong className="text-gray-700">{ticket.title}</strong>
          </span>
        ) : undefined
      }
      open={open}
      onCancel={handleCancel}
      maxWidth="md"
    >
      {fetchError && (
        <Alert
          type="error"
          showIcon
          message={fetchError}
          className="mb-4 text-xs"
        />
      )}

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

      {isLoadingAgents ? (
        <div className="py-8 flex flex-col items-center justify-center gap-2">
          <Spin size="default" />
          <p className="text-xs text-gray-500 m-0">Loading available Support Agents...</p>
        </div>
      ) : agents.length === 0 && !fetchError ? (
        <div className="py-4">
          <Alert
            type="warning"
            showIcon
            message="No Support Agents Found"
            description="There are currently no registered Support Agent accounts in the system. Please register a Support Agent before assigning tickets."
            className="text-xs"
          />
        </div>
      ) : (
        <div className="space-y-4 pt-2">
          <div>
            <label
              htmlFor="agent-select"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Select Support Agent
            </label>
            <Select
              id="agent-select"
              placeholder="Choose a Support Agent"
              value={selectedAgentId}
              onChange={(val) => setSelectedAgentId(val)}
              className="w-full h-10"
              disabled={isSubmitting || agents.length === 0}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '')
                  .toString()
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={agents.map((agent) => ({
                label: `${agent.name} (${agent.email})`,
                value: agent._id || agent.id || '',
              }))}
            />
            <p className="text-xs text-gray-400 mt-1.5 mb-0">
              Only active Support Agent accounts can be assigned.
            </p>
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
              disabled={isSubmitting || !selectedAgentId || agents.length === 0}
              icon={<UserOutlined />}
            >
              Confirm Assignment
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
