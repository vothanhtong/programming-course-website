/**
 * Ant Design dark theme config — dùng chung cho toàn Admin Dashboard
 * Màu sắc dịu, dễ đọc trên nền tối
 */
export const darkTheme = {
  token: {
    // Base
    colorBgBase:        '#0a1628',
    colorTextBase:      '#e2e8f0',
    colorBorder:        'rgba(59,130,246,0.18)',
    borderRadius:       8,
    fontFamily:         "'Inter', -apple-system, sans-serif",
    fontSize:           15,

    // Primary
    colorPrimary:       '#3b82f6',
    colorPrimaryHover:  '#60a5fa',
    colorPrimaryActive: '#2563eb',

    // Background variants
    colorBgContainer:   'rgba(15,23,42,0.9)',
    colorBgElevated:    'rgba(20,30,55,0.95)',
    colorBgLayout:      '#020817',
    colorBgSpotlight:   'rgba(30,41,59,0.8)',

    // Text
    colorText:          '#e2e8f0',
    colorTextSecondary: '#94a3b8',
    colorTextTertiary:  '#64748b',
    colorTextDisabled:  '#475569',
    colorTextHeading:   '#f1f5f9',

    // Border
    colorBorderSecondary: 'rgba(59,130,246,0.1)',

    // Status — tone down, không chói
    colorSuccess:       '#34d399',
    colorSuccessBg:     'rgba(16,185,129,0.1)',
    colorSuccessBorder: 'rgba(16,185,129,0.25)',

    colorWarning:       '#fbbf24',
    colorWarningBg:     'rgba(245,158,11,0.1)',
    colorWarningBorder: 'rgba(245,158,11,0.25)',

    colorError:         '#f87171',
    colorErrorBg:       'rgba(239,68,68,0.1)',
    colorErrorBorder:   'rgba(239,68,68,0.25)',

    colorInfo:          '#60a5fa',
    colorInfoBg:        'rgba(59,130,246,0.1)',
    colorInfoBorder:    'rgba(59,130,246,0.25)',

    // Input
    colorBgContainerDisabled: 'rgba(15,23,42,0.5)',

    // Shadow
    boxShadow:          '0 4px 16px rgba(0,0,0,0.4)',
    boxShadowSecondary: '0 2px 8px rgba(0,0,0,0.3)',
  },
  components: {
    Table: {
      colorBgContainer:     'rgba(15,23,42,0.85)',
      headerBg:             'rgba(10,18,40,0.9)',
      headerColor:          '#cbd5e1',
      headerSortActiveBg:   'rgba(59,130,246,0.1)',
      rowHoverBg:           'rgba(59,130,246,0.06)',
      borderColor:          'rgba(59,130,246,0.1)',
      colorText:            '#e2e8f0',
      footerBg:             'rgba(10,18,40,0.9)',
      fontSize:             15,
    },
    Card: {
      colorBgContainer:     'rgba(15,23,42,0.85)',
      colorBorderSecondary: 'rgba(59,130,246,0.15)',
      colorTextHeading:     '#e2e8f0',
    },
    Modal: {
      contentBg:            'rgba(15,23,42,0.98)',
      headerBg:             'rgba(10,18,40,0.98)',
      titleColor:           '#e2e8f0',
      colorIcon:            '#64748b',
    },
    Input: {
      colorBgContainer:     'rgba(30,41,59,0.8)',
      colorBorder:          'rgba(59,130,246,0.2)',
      colorText:            '#e2e8f0',
      colorTextPlaceholder: '#475569',
      activeBorderColor:    '#3b82f6',
      hoverBorderColor:     'rgba(59,130,246,0.4)',
      activeShadow:         '0 0 0 2px rgba(59,130,246,0.15)',
    },
    Select: {
      colorBgContainer:     'rgba(30,41,59,0.8)',
      colorBorder:          'rgba(59,130,246,0.2)',
      colorText:            '#e2e8f0',
      colorTextPlaceholder: '#475569',
      optionSelectedBg:     'rgba(59,130,246,0.15)',
      colorBgElevated:      'rgba(15,23,42,0.98)',
    },
    Form: {
      labelColor:           '#cbd5e1',
      labelFontSize:        14,
    },
    Button: {
      defaultBg:            'rgba(30,41,59,0.8)',
      defaultBorderColor:   'rgba(59,130,246,0.25)',
      defaultColor:         '#94a3b8',
      defaultHoverBg:       'rgba(59,130,246,0.1)',
      defaultHoverColor:    '#60a5fa',
      defaultHoverBorderColor: 'rgba(59,130,246,0.4)',
    },
    Pagination: {
      colorBgContainer:     'rgba(30,41,59,0.8)',
      colorBorder:          'rgba(59,130,246,0.2)',
      colorText:            '#94a3b8',
      itemActiveBg:         'rgba(59,130,246,0.2)',
    },
    Dropdown: {
      colorBgElevated:      'rgba(15,23,42,0.98)',
      colorText:            '#cbd5e1',
    },
    Popconfirm: {
      colorBgElevated:      'rgba(15,23,42,0.98)',
    },
    Tooltip: {
      colorBgSpotlight:     'rgba(15,23,42,0.95)',
      colorTextLightSolid:  '#e2e8f0',
    },
    Switch: {
      colorPrimary:         '#3b82f6',
    },
    Tabs: {
      colorBorderSecondary: 'rgba(59,130,246,0.15)',
      inkBarColor:          '#3b82f6',
      itemColor:            '#64748b',
      itemSelectedColor:    '#60a5fa',
      itemHoverColor:       '#93c5fd',
    },
    Spin: {
      colorPrimary:         '#3b82f6',
    },
    Tag: {
      defaultBg:            'rgba(30,41,59,0.8)',
      defaultColor:         '#94a3b8',
    },
    Divider: {
      colorSplit:           'rgba(59,130,246,0.12)',
    },
    Descriptions: {
      colorText:            '#cbd5e1',
      colorTextSecondary:   '#64748b',
      colorBgContainer:     'rgba(15,23,42,0.85)',
    },
    Badge: {
      colorBgContainer:     'rgba(15,23,42,0.85)',
    },
    Drawer: {
      colorBgElevated:      'rgba(10,18,40,0.98)',
      colorText:            '#cbd5e1',
    },
    Rate: {
      starColor:            '#fbbf24',
    },
    InputNumber: {
      colorBgContainer:     'rgba(30,41,59,0.8)',
      colorBorder:          'rgba(59,130,246,0.2)',
      colorText:            '#e2e8f0',
    },
    Alert: {
      colorErrorBg:         'rgba(239,68,68,0.1)',
      colorErrorBorder:     'rgba(239,68,68,0.25)',
      colorErrorText:       '#fca5a5',
    },
    Typography: {
      colorText:            '#e2e8f0',
      colorTextSecondary:   '#94a3b8',
      colorTextHeading:     '#f1f5f9',
      titleMarginBottom:    '0.5em',
    },
  },
};

// Tag preset colors — dịu hơn, dễ đọc trên nền tối
export const tagColors = {
  // Level
  beginner:     { bg: 'rgba(16,185,129,0.12)',  color: '#6ee7b7', border: 'rgba(16,185,129,0.25)' },
  intermediate: { bg: 'rgba(59,130,246,0.12)',  color: '#93c5fd', border: 'rgba(59,130,246,0.25)' },
  advanced:     { bg: 'rgba(239,68,68,0.1)',    color: '#fca5a5', border: 'rgba(239,68,68,0.2)'  },

  // Status
  published:    { bg: 'rgba(16,185,129,0.1)',   color: '#6ee7b7', border: 'rgba(16,185,129,0.2)' },
  draft:        { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8', border: 'rgba(100,116,139,0.25)' },
  free:         { bg: 'rgba(16,185,129,0.1)',   color: '#6ee7b7', border: 'rgba(16,185,129,0.2)' },

  // Payment
  paid:         { bg: 'rgba(16,185,129,0.1)',   color: '#6ee7b7', border: 'rgba(16,185,129,0.2)' },
  pending:      { bg: 'rgba(245,158,11,0.1)',   color: '#fcd34d', border: 'rgba(245,158,11,0.2)' },
  failed:       { bg: 'rgba(239,68,68,0.1)',    color: '#fca5a5', border: 'rgba(239,68,68,0.2)'  },
  refunded:     { bg: 'rgba(139,92,246,0.1)',   color: '#c4b5fd', border: 'rgba(139,92,246,0.2)' },

  // Generic
  blue:         { bg: 'rgba(59,130,246,0.12)',  color: '#93c5fd', border: 'rgba(59,130,246,0.25)' },
  green:        { bg: 'rgba(16,185,129,0.12)',  color: '#6ee7b7', border: 'rgba(16,185,129,0.25)' },
  yellow:       { bg: 'rgba(245,158,11,0.12)',  color: '#fcd34d', border: 'rgba(245,158,11,0.25)' },
  red:          { bg: 'rgba(239,68,68,0.1)',    color: '#fca5a5', border: 'rgba(239,68,68,0.2)'  },
  purple:       { bg: 'rgba(139,92,246,0.1)',   color: '#c4b5fd', border: 'rgba(139,92,246,0.2)' },
  gray:         { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8', border: 'rgba(100,116,139,0.25)' },
};

/** Render tag với style dịu */
export const DarkTag = ({ type, children }) => {
  const s = tagColors[type] || tagColors.gray;
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 6,
      fontSize: 12,
      fontWeight: 500,
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
};
