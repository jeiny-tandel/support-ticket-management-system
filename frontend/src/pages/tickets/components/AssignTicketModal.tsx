import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Select, Alert, Spin, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAppDispatch } from '../../../hooks';
import { assignTicket, fetchTicketSummary } from '../../../store';
import { getUsersApi, type BackendUserResponse } from '../../../api';
import { USER_ROLES } from '../../../constants/roles';
import type { Ticket, TicketUserSummary } from '../../../types';
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

  const currentAssignee =
    ticket?.assignedToId && typeof ticket.assignedToId === 'object'
      ? ticket.assignedToId
      : null;
  const currentAssigneeId =
    currentAssignee?._id ||
    (typeof ticket?.assignedToId === 'string' ? ticket.assignedToId : null);

  const [agents, setAgents] = useState<BackendUserResponse[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(currentAssigneeId);
  const [selectedAgent, setSelectedAgent] = useState<
    BackendUserResponse | TicketUserSummary | null
  >(currentAssignee);
  const [prevTicketId, setPrevTicketId] = useState<string | null>(ticket?._id ?? null);
  const [prevOpen, setPrevOpen] = useState<boolean>(open);

  const [initialTotal, setInitialTotal] = useState<number | null>(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Sync state during render when modal opens or ticket changes (prevents cascading renders)
  if (open !== prevOpen || ticket?._id !== prevTicketId) {
    setPrevOpen(open);
    setPrevTicketId(ticket?._id ?? null);
    if (open) {
      setSelectedAgentId(currentAssigneeId);
      setSelectedAgent(currentAssignee);
      setIsLoadingInitial(true);
      setFetchError(null);
      setSubmitError(null);
    }
  }

  // Counter reference to discard out-of-order stale search responses
  const searchReqIdRef = useRef<number>(0);
  // Timer reference for debounced remote search queries
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((value: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setIsSearching(true);
    const reqId = ++searchReqIdRef.current;

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await getUsersApi({
          role: USER_ROLES.SUPPORT_AGENT,
          search: value.trim() || undefined,
          limit: 50, // Respect backend maximum limit
        });

        if (reqId === searchReqIdRef.current) {
          setAgents(res.items);
        }
      } catch (err: unknown) {
        if (reqId === searchReqIdRef.current) {
          const msg =
            err && typeof err === 'object' && 'message' in err
              ? String((err as { message: unknown }).message)
              : 'Unable to load support agents. Please verify user management permissions.';
          setFetchError(msg);
        }
      } finally {
        if (reqId === searchReqIdRef.current) {
          setIsSearching(false);
        }
      }
    }, 350);
  }, []);

  // Ensure currently selected or assigned agent is always preserved in options list
  const combinedAgents = useMemo(() => {
    const list = [...agents];
    if (
      selectedAgent &&
      !list.some(
        (a) =>
          (a._id || a.id) ===
          (selectedAgent._id || ('id' in selectedAgent ? selectedAgent.id : undefined)),
      )
    ) {
      list.unshift({
        _id: selectedAgent._id,
        name: selectedAgent.name,
        email: selectedAgent.email,
        role: USER_ROLES.SUPPORT_AGENT,
      });
    }
    return list;
  }, [agents, selectedAgent]);

  const handleSelectAgent = (agentId: string) => {
    setSelectedAgentId(agentId);
    const chosen = combinedAgents.find((a) => (a._id || a.id) === agentId) || null;
    if (chosen) {
      setSelectedAgent(chosen);
    }
  };

  useEffect(() => {
    if (!open) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      searchReqIdRef.current += 1;
      return;
    }

    const reqId = ++searchReqIdRef.current;

    getUsersApi({
      role: USER_ROLES.SUPPORT_AGENT,
      limit: 50,
    })
      .then((res) => {
        if (reqId === searchReqIdRef.current) {
          setAgents(res.items);
          setInitialTotal(res.total);
          setIsLoadingInitial(false);
        }
      })
      .catch((err: unknown) => {
        if (reqId === searchReqIdRef.current) {
          const msg =
            err && typeof err === 'object' && 'message' in err
              ? String((err as { message: unknown }).message)
              : 'Unable to load support agents. Please verify user management permissions.';
          setFetchError(msg);
          setIsLoadingInitial(false);
        }
      });

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      searchReqIdRef.current += 1;
    };
  }, [open]);

  const handleCancel = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    searchReqIdRef.current += 1;
    setSelectedAgentId(null);
    setSelectedAgent(null);
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

      {isLoadingInitial ? (
        <div className="py-8 flex flex-col items-center justify-center gap-2">
          <Spin size="default" />
          <p className="text-xs text-gray-500 m-0">Loading available Support Agents...</p>
        </div>
      ) : initialTotal === 0 && !fetchError ? (
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
              placeholder="Search support agent by name or email..."
              value={selectedAgentId}
              onChange={handleSelectAgent}
              onSearch={handleSearch}
              showSearch
              filterOption={false}
              loading={isSearching}
              notFoundContent={
                isSearching ? (
                  <div className="py-2 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                    <Spin size="small" />
                    <span>Searching agents...</span>
                  </div>
                ) : (
                  <div className="py-2 text-center text-xs text-gray-400">
                    No matching support agents found
                  </div>
                )
              }
              className="w-full h-10"
              disabled={isSubmitting || (initialTotal === 0 && !isLoadingInitial)}
              options={combinedAgents.map((agent) => ({
                label: `${agent.name} (${agent.email})`,
                value: agent._id || agent.id || '',
              }))}
            />
            <p className="text-xs text-gray-400 mt-1.5 mb-0">
              Only active Support Agent accounts can be assigned. Type to search all agents across the system.
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
              disabled={isSubmitting || !selectedAgentId}
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

