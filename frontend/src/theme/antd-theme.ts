import type { ThemeConfig } from 'antd';

/**
 * Centralized Ant Design theme configuration for SolviX.
 * Uses the primary indigo brand palette and standard border radius.
 */
export const solvixTheme: ThemeConfig = {
  token: {
    colorPrimary: '#4f46e5',
    borderRadius: 8,
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    colorLink: '#4f46e5',
  },
  components: {
    Button: {
      controlHeight: 40,
      borderRadius: 8,
      colorPrimary: '#4f46e5',
      colorPrimaryHover: '#4338ca',
      colorPrimaryActive: '#3730a3',
    },
    Input: {
      controlHeight: 40,
      borderRadius: 8,
    },
    Card: {
      borderRadiusLG: 12,
    },
    Menu: {
      itemBorderRadius: 8,
      itemSelectedColor: '#4f46e5',
      itemSelectedBg: '#eef2ff',
    },
    Layout: {
      headerBg: '#ffffff',
      headerColor: '#111827',
      headerPadding: '0 24px',
      headerHeight: 64,
      siderBg: '#ffffff',
      bodyBg: '#f9fafb',
    },
  },
};


export default solvixTheme;
