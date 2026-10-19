import React from 'react';
import { Layout, Dropdown, Avatar, Tag, type MenuProps } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { Logo } from '../common/Logo';

export interface HeaderUser {
  name?: string;
  email?: string;
  role?: string;
}

export interface HeaderProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  user?: HeaderUser | null;
  onLogout?: () => void;
  onProfileClick?: () => void;
  rightContent?: React.ReactNode;
  showLogo?: boolean;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  collapsed = false,
  onToggleCollapse,
  user,
  onLogout,
  onProfileClick,
  rightContent,
  showLogo = false,
  className = '',
}) => {
  const userMenuItems: MenuProps['items'] = [
    ...(user?.email || user?.name
      ? [
          {
            key: 'user-info',
            label: (
              <div className="py-1 px-1">
                <p className="text-xs font-semibold text-gray-900 m-0">
                  {user.name || 'User'}
                </p>
                {user.email && (
                  <p className="text-xs text-gray-500 m-0 mt-0.5">
                    {user.email}
                  </p>
                )}
                {user.role && (
                  <div className="mt-1.5">
                    <Tag
                      color={user.role === 'ADMIN' ? 'purple' : 'blue'}
                      className="text-xs m-0"
                    >
                      {user.role}
                    </Tag>
                  </div>
                )}
              </div>
            ),
            disabled: true,
          },
          { type: 'divider' as const },
        ]
      : []),
    {
      key: 'profile',
      icon: <UserOutlined className="text-gray-500" />,
      label: 'My Profile',
      onClick: onProfileClick,
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined className="text-red-500" />,
      danger: true,
      label: 'Log out',
      onClick: onLogout,
    },
  ];

  return (
    <Layout.Header
      style={{ backgroundColor: '#ffffff', lineHeight: 'normal' }}
      className={`bg-white border-b border-gray-100 px-4 sm:px-6 flex items-center justify-between h-16 shrink-0 z-10 shadow-xs ${className}`}
    >
      <div className="flex items-center gap-4">
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-gray-100 transition-colors cursor-pointer border-0 bg-transparent"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <MenuUnfoldOutlined className="text-lg" />
            ) : (
              <MenuFoldOutlined className="text-lg" />
            )}
          </button>
        )}

        {showLogo && <Logo size="small" />}
      </div>

      <div className="flex items-center gap-4">
        {rightContent}

        {user && (
          <Dropdown
            menu={{ items: userMenuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <button
              type="button"
              className="flex items-center gap-3 py-1 px-2.5 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all cursor-pointer bg-white text-gray-800"
              aria-label="User profile menu"
            >
              <Avatar
                size="default"
                icon={<UserOutlined />}
                className="bg-indigo-600 text-white font-semibold shadow-xs shrink-0"
              >
                {user.name ? user.name.charAt(0).toUpperCase() : undefined}
              </Avatar>

              <div className="hidden sm:flex flex-col text-left">
                <span className="text-sm font-semibold text-gray-900 leading-tight">
                  {user.name || 'User'}
                </span>
                {user.email && (
                  <span className="text-xs text-gray-500 leading-tight mt-0.5">
                    {user.email}
                  </span>
                )}
              </div>

              {user.role && (
                <Tag
                  color={user.role === 'ADMIN' ? 'purple' : 'blue'}
                  className="hidden md:inline-flex m-0 text-xs font-medium"
                >
                  {user.role}
                </Tag>
              )}

              <DownOutlined className="text-xs text-gray-400 hidden sm:inline" />
            </button>
          </Dropdown>
        )}
      </div>
    </Layout.Header>
  );
};

export default Header;
