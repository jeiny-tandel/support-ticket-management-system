import React, { useEffect, useMemo, useState } from 'react';
import { Table, Tag, Input, Alert, Tooltip, Segmented } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  UserAddOutlined,
  ReloadOutlined,
  SearchOutlined,
  EditOutlined,
  ClearOutlined,
  TeamOutlined,
  MailOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
  CrownOutlined,
  SwapOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { getUsersApi, type BackendUserResponse } from '../../api';
import { Button, PageHeader } from '../../components/common';
import { AgentFormModal, ChangeRoleModal, DeleteUserModal } from './components';
import { USER_ROLES, type UserRole } from '../../constants/roles';
import { useAppSelector } from '../../hooks';
import { selectCurrentUser } from '../../store';

const AVATAR_PALETTES = [
  { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200/80' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200/80' },
  { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200/80' },
  { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200/80' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200/80' },
  { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200/80' },
  { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200/80' },
];

const getAvatarPalette = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[index];
};

export const AgentsPage: React.FC = () => {
  const currentUser = useAppSelector(selectCurrentUser);
  const [users, setUsers] = useState<BackendUserResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingAgent, setEditingAgent] = useState<BackendUserResponse | null>(null);

  const [roleModalOpen, setRoleModalOpen] = useState<boolean>(false);
  const [userForRoleChange, setUserForRoleChange] = useState<BackendUserResponse | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<BackendUserResponse | null>(null);

  const handleCreateAgent = () => {
    setEditingAgent(null);
    setModalOpen(true);
  };

  const handleEditAgent = (agent: BackendUserResponse) => {
    setEditingAgent(agent);
    setModalOpen(true);
  };

  const handleOpenRoleModal = (user: BackendUserResponse) => {
    setUserForRoleChange(user);
    setRoleModalOpen(true);
  };

  const handleOpenDeleteModal = (user: BackendUserResponse) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingAgent(null);
  };

  const handleCloseRoleModal = () => {
    setRoleModalOpen(false);
    setUserForRoleChange(null);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };

  useEffect(() => {
    let isMounted = true;

    getUsersApi()
      .then((data) => {
        if (isMounted) {
          setUsers(data);
          setErrorMessage(null);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg =
            err && typeof err === 'object' && 'message' in err
              ? String((err as { message: unknown }).message)
              : 'Unable to load users. Please try again.';
          setErrorMessage(msg);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  const handleRefresh = () => {
    setLoading(true);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(1);
  };

  const totalCount = users.length;
  const agentCount = useMemo(
    () => users.filter((u) => u.role === USER_ROLES.SUPPORT_AGENT).length,
    [users],
  );
  const adminCount = useMemo(
    () => users.filter((u) => u.role === USER_ROLES.ADMIN).length,
    [users],
  );

  const filteredUsers = useMemo(() => {
    let list = users;

    if (roleFilter !== 'ALL') {
      list = list.filter((user) => user.role === roleFilter);
    }

    const query = searchQuery.trim().toLowerCase();
    if (!query) return list;

    return list.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query),
    );
  }, [users, roleFilter, searchQuery]);

  const columns: ColumnsType<BackendUserResponse> = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'name',
      width: 280,
      render: (_: string, record: BackendUserResponse) => {
        const isCurrent =
          currentUser?.id === record._id || currentUser?.id === record.id;
        const initial = record.name ? record.name.charAt(0).toUpperCase() : '?';
        const palette = getAvatarPalette(record.name || record._id);

        return (
          <div className="flex items-center gap-3 py-1">
            <div
              className={`w-9 h-9 rounded-full ${palette.bg} border ${palette.border} ${palette.text} flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs`}
            >
              {initial}
            </div>
            <div className="min-w-0 flex items-center gap-2">
              <span className="font-semibold text-gray-900 text-sm leading-snug block truncate">
                {record.name}
              </span>
              {isCurrent && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200 shrink-0">
                  You
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Email Address',
      dataIndex: 'email',
      key: 'email',
      width: 280,
      render: (email: string) => (
        <span className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-600 font-normal select-all">
          <MailOutlined className="text-gray-400 text-xs shrink-0" />
          <span className="truncate">{email}</span>
        </span>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 180,
      render: (role: string) => {
        if (role === USER_ROLES.ADMIN) {
          return (
            <Tag
              color="gold"
              className="m-0 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-300 bg-amber-50 text-amber-800 inline-flex items-center gap-1.5 shadow-2xs"
            >
              <CrownOutlined className="text-amber-500 text-[11px]" />
              <span>Administrator</span>
            </Tag>
          );
        }

        return (
          <Tag
            color="purple"
            className="m-0 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-purple-200/80 bg-purple-50/80 text-purple-700 inline-flex items-center gap-1.5"
          >
            <SafetyCertificateOutlined className="text-purple-600 text-[11px]" />
            <span>Support Agent</span>
          </Tag>
        );
      },
    },
    {
      title: 'Joined Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (createdAt?: string) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap tabular-nums">
          <CalendarOutlined className="text-[11px] text-gray-400" />
          {createdAt
            ? new Date(createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : '—'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      align: 'center',
      render: (_: unknown, record: BackendUserResponse) => {
        const isCurrent =
          currentUser?.id === record._id || currentUser?.id === record.id;
        const isAgent = record.role === USER_ROLES.SUPPORT_AGENT;

        return (
          <div className="flex items-center justify-center gap-1">
            <Tooltip title="Edit user profile">
              <Button
                type="text"
                size="small"
                onClick={() => handleEditAgent(record)}
                icon={
                  <EditOutlined className="text-gray-400 hover:text-purple-600 text-sm" />
                }
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-purple-50 transition-colors text-gray-500 hover:text-purple-700"
                aria-label="Edit user"
              />
            </Tooltip>

            {isAgent ? (
              <Tooltip title="Promote to Administrator">
                <Button
                  type="text"
                  size="small"
                  onClick={() => handleOpenRoleModal(record)}
                  icon={
                    <CrownOutlined className="text-amber-500 hover:text-amber-600 text-sm" />
                  }
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-amber-50 transition-colors text-amber-600"
                  aria-label="Promote to Administrator"
                />
              </Tooltip>
            ) : isCurrent ? (
              <Tooltip title="You cannot change your own role">
                <Button
                  type="text"
                  size="small"
                  disabled
                  icon={
                    <CrownOutlined className="text-gray-300 text-sm" />
                  }
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 cursor-not-allowed opacity-60"
                  aria-label="Cannot change own role"
                />
              </Tooltip>
            ) : (
              <Tooltip title="Change role to Support Agent">
                <Button
                  type="text"
                  size="small"
                  onClick={() => handleOpenRoleModal(record)}
                  icon={
                    <SwapOutlined className="text-purple-500 hover:text-purple-700 text-sm" />
                  }
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-purple-50 transition-colors text-purple-600"
                  aria-label="Change role to Support Agent"
                />
              </Tooltip>
            )}

            {isCurrent ? (
              <Tooltip title="You cannot delete your own account">
                <Button
                  type="text"
                  size="small"
                  disabled
                  icon={
                    <DeleteOutlined className="text-gray-300 text-sm" />
                  }
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 cursor-not-allowed opacity-60"
                  aria-label="Cannot delete own account"
                />
              </Tooltip>
            ) : (
              <Tooltip title="Delete user account">
                <Button
                  type="text"
                  size="small"
                  onClick={() => handleOpenDeleteModal(record)}
                  icon={
                    <DeleteOutlined className="text-gray-400 hover:text-rose-600 text-sm" />
                  }
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-rose-50 transition-colors text-gray-500 hover:text-rose-600"
                  aria-label="Delete user"
                />
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="pb-8">
      <style>{`
        .solvix-agents-table .ant-table {
          background: transparent;
        }
        .solvix-agents-table .ant-table-thead > tr > th {
          background-color: #f8fafc !important;
          color: #475569 !important;
          font-size: 0.75rem !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 12px 16px !important;
          white-space: nowrap !important;
        }
        .solvix-agents-table .ant-table-tbody > tr > td {
          padding: 13px 16px !important;
          border-bottom: 1px solid #f1f5f9 !important;
          vertical-align: middle !important;
        }
        .solvix-agents-table .ant-table-tbody > tr:last-child > td {
          border-bottom: none !important;
        }
        .solvix-agents-table .ant-table-tbody > tr:hover > td {
          background-color: #fcfaff !important;
        }
        .solvix-agents-table .ant-pagination {
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }
      `}</style>

      <PageHeader
        title={
          <div className="flex flex-wrap items-center gap-3">
            <span>Users & Support Agents</span>
            {!loading && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 tabular-nums">
                {totalCount} {totalCount === 1 ? 'User' : 'Users'}
              </span>
            )}
          </div>
        }
        subtitle="Manage team members, permissions, and administrative role promotions."
        extra={
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={handleCreateAgent}
            className="h-10 px-4 font-semibold shadow-sm hover:shadow transition-all bg-purple-600 hover:bg-purple-700 border-purple-600"
          >
            Add Agent
          </Button>
        }
      />

      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs px-4 py-3 mb-6 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <Input
              placeholder="Search by name or email..."
              prefix={<SearchOutlined className="text-gray-400 text-sm" />}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              allowClear
              className="w-full sm:w-72 h-10 rounded-lg text-sm"
            />
            {searchQuery && (
              <Button
                type="text"
                size="middle"
                onClick={handleClearSearch}
                icon={<ClearOutlined />}
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 hover:bg-purple-50/80 h-10 px-3 rounded-lg border border-purple-100 transition-colors shrink-0"
              >
                Clear
              </Button>
            )}

            <Segmented
              value={roleFilter}
              onChange={(val) => {
                setRoleFilter(val as 'ALL' | UserRole);
                setPage(1);
              }}
              options={[
                { label: `All (${totalCount})`, value: 'ALL' },
                { label: `Agents (${agentCount})`, value: USER_ROLES.SUPPORT_AGENT },
                { label: `Admins (${adminCount})`, value: USER_ROLES.ADMIN },
              ]}
              className="bg-gray-100 p-0.5 rounded-lg text-xs font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            <Tooltip title="Refresh directory">
              <Button
                type="default"
                onClick={handleRefresh}
                icon={
                  <ReloadOutlined spin={loading} className="text-gray-500" />
                }
                disabled={loading}
                className="h-10 px-4 text-xs font-semibold text-gray-700 bg-white border-gray-200 hover:border-purple-400 hover:text-purple-600 rounded-lg shadow-2xs transition-colors"
              >
                Refresh
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>

      {errorMessage && (
        <Alert
          type="error"
          showIcon
          message="Failed to load users"
          description={errorMessage}
          action={
            <Button size="small" type="primary" onClick={handleRefresh}>
              Retry
            </Button>
          }
          className="mb-6 rounded-xl border border-rose-100 bg-rose-50/70 shadow-2xs"
        />
      )}

      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
        <Table<BackendUserResponse>
          rowKey="_id"
          columns={columns}
          dataSource={filteredUsers}
          loading={loading}
          scroll={{ x: 800 }}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: filteredUsers.length,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (totalFiltered, range) => (
              <span className="text-xs text-gray-500 font-normal">
                Showing{' '}
                <strong className="text-gray-700 font-semibold">
                  {range[0]}-{range[1]}
                </strong>{' '}
                of <strong className="text-gray-700 font-semibold">{totalFiltered}</strong>{' '}
                users
              </span>
            ),
            onChange: (newPage, newPageSize) => {
              setPage(newPage);
              setPageSize(newPageSize);
            },
            className:
              '!px-4 !py-3 !my-0 border-t border-gray-100 bg-gray-50/40',
          }}
          className="solvix-agents-table"
          locale={{
            emptyText: searchQuery || roleFilter !== 'ALL' ? (
              <div className="py-12 text-center">
                <SearchOutlined className="text-3xl text-gray-300 mb-2" />
                <p className="text-sm font-semibold text-gray-700 m-0">
                  No users found
                </p>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  No users match your current search and role filters.
                </p>
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    handleClearSearch();
                    setRoleFilter('ALL');
                  }}
                  className="mt-3 text-purple-600 hover:text-purple-700 font-semibold p-0"
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 text-xl mx-auto mb-3">
                  <TeamOutlined />
                </div>
                <p className="text-sm font-bold text-gray-800 m-0">
                  No users yet
                </p>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  Get started by adding your first support agent to handle customer queues and ticket assignments.
                </p>
                <Button
                  type="primary"
                  size="middle"
                  icon={<UserAddOutlined />}
                  onClick={handleCreateAgent}
                  className="mt-4 bg-purple-600 hover:bg-purple-700 border-purple-600 font-semibold h-9 px-4 rounded-lg shadow-sm"
                >
                  Add First Agent
                </Button>
              </div>
            ),
          }}
        />
      </div>

      <AgentFormModal
        open={modalOpen}
        agent={editingAgent}
        onClose={handleCloseModal}
        onSuccess={handleRefresh}
      />

      <ChangeRoleModal
        open={roleModalOpen}
        user={userForRoleChange}
        onClose={handleCloseRoleModal}
        onSuccess={handleRefresh}
      />

      <DeleteUserModal
        open={deleteModalOpen}
        user={userToDelete}
        onClose={handleCloseDeleteModal}
        onSuccess={handleRefresh}
      />
    </div>
  );
};

export default AgentsPage;
